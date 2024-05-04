import * as core from '@actions/core'
import duration from 'duration-js'
import { checkURLWithRetry } from './curl'

process.on('unhandledRejection', (reason) => {
  if (reason instanceof Error) {
    core.error(reason.stack) // Because GitHub won't print it otherwise
    core.setFailed(reason)
  } else {
    core.setFailed(`${reason}`)
  }
})

// Mostly intended to test the action. When true, this reports success as failure and vice versa.
const expectFailure = core.getBooleanInput('expect-failure')
const urlString = core.getInput('url', { required: true })
const maxAttemptsString = core.getInput('max-attempts')
const retryDelayString = core.getInput('retry-delay')
const followRedirect = core.getBooleanInput('follow-redirect')
const useExponentialBackoff = core.getBooleanInput('exponential-backoff')
const retryAll = core.getBooleanInput('retry-all')
const cookie = core.getInput('cookie')
const basicAuthString = core.getInput('basic-auth')
const searchString = core.getInput('contains')
const searchNotString = core.getInput('contains-not')

async function run() {
  const urls = urlString.split('|')
  const retryDelayMs = duration.parse(retryDelayString).milliseconds()
  const maxAttempts = parseInt(maxAttemptsString) - 1

  for (const url of urls) {
    // We don't need to do it in parallel, we're going to have to
    // wait for all of them anyway
    await checkURLWithRetry(
      url,
      searchString,
      searchNotString,
      maxAttempts,
      retryDelayMs,
      basicAuthString,
      followRedirect,
      retryAll,
      cookie,
      useExponentialBackoff
    )
  }

  // If we reach this without running into an error
  core.info('All URL checks succeeded.')
}

run().catch((e) => {
  if (expectFailure) {
    core.info('The check failed as expected.')
  } else {
    core.setFailed(e)
  }
})
