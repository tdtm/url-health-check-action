import axios from "axios"
import * as core from "@actions/core";

export async function checkURLWithRetry(
    url, searchString, searchNotString, retries, retryDelay, basicAuthString, followRedirect, retryAll, cookie, useExponentialBackoff
) {
    let retryCount = 0;
    let config = {
        maxRedirects: followRedirect ? 30 : 0, // set a max to avoid infinite redirects, but that's arbitrary. todo make this an option.
        headers: {},
    };

    if (basicAuthString) {
        const base64Credentials = Buffer.from(basicAuthString).toString('base64');
        config.headers.Authorization = `Basic ${base64Credentials}`
    }

    if (cookie) {
        config.withCredentials = true
        config.headers.Cookie = cookie
    }

    async function makeRequest() {
        const response = await axios.get(url, config);
        let passing  = true

        if (response.status === 200) {
            core.info(`Target ${url} returned a success status code.`);

            if (passing && searchString) {
                if (!response.data.includes(searchString)) {
                    core.error(`Target ${url} did not contain the desired string.`);
                    passing = false;
                }

                core.info(`Target ${url} did contain the desired string.`);
            }

            if (passing && searchNotString) {
                if (response.data.includes(searchNotString)) {
                    core.error(`Target ${url} did contain the undesired string.`);
                    passing = false;
                }

                core.info(`Target ${url} did not contain the undesired string.`);
            }

            if (passing) {
                return true
            }
        } else {
            core.error(`Target ${url} returned a non-200 status code: ${response.status}`);
        }

        if (retryCount < retries) {
            retryCount++;
            const delay = Math.pow(useExponentialBackoff ? 2 : 1, retryCount) * retryDelay;
            core.info(`Retrying in ${delay} ms... (Attempt ${retryCount}/${retries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return makeRequest();
        }

        throw new Error(`Max retries reached.`);
    }

    return makeRequest();
}
