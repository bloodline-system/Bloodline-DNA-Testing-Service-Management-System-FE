# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: report\report-ui.spec.ts >> Report UI >> TC-REP-UI-01: Report page should load for authenticated manager and show cards
- Location: tests\report\report-ui.spec.ts:6:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=DNA Test Reports')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('text=DNA Test Reports')

```

```
Error: apiRequestContext._wrapApiCall: Target page, context or browser has been closed
```