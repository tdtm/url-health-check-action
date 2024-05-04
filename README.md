# URL health check action

A post-deploy health check with built-in redirect, retry, and text match. A quick & easy way to verify a deployment. 

Modified from jtalk/url-health-check-action@v3. Keept the same options, but re-written using Axios and adding support for the following options:
- contains
- contains-not
- exponential backoff

```yaml
steps:
  - name: Check the deployed service URL
    uses: tdtm/url-health-check-action@v3
    with:
      # Check the following URLs one by one sequentially
      url: https://example.com|http://example.com
      # Follow redirects, or just report success on 3xx status codes
      follow-redirect: false # Optional, defaults to "false"
      # Fail this action after this many failed attempts
      max-attempts: 3 # Optional, defaults to 1
      # Delay between retries in s or ms
      retry-delay: 5s # Optional, only applicable to max-attempts > 1
      # Retry all errors, including 404. This option might trigger curl upgrade.
      retry-all: false # Optional, defaults to "false"
      # Whether to retry with exponential backoff (true) or linear delay
      exponential-backoff: true
      # String representation of cookie attached to health check request.
      # Format: `Name=Value`
      cookie: "token=asdf1234" # Optional, default is empty
      # Basic auth login password pair.
      # Format: `login:password`
      basic-auth: "login:password" # Optional, default is empty
      # Search for the presence/absence of string in the page
      contains: "ready" # Optional, default is empty
      contains-not: "error" # Optional, default is empty
```

The action will fail if once all `max-attempts` have been exhausted, any of the URLs reports either 4xx or 5xx status codes, or the `contains`/`contains-not` checks (if enabled) are not satisfied. A target is considered passing as soon as it passes once.
