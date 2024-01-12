# URL health check action

A cURL-based post-deploy health check with build-in redirect & retry. A quick & easy way to verify a deployment. Modified from jtalk/url-health-check-action@v3.

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

The action will fail if any of the URLs reports either 4xx or 5xx status codes.
