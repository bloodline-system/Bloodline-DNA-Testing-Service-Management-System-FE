# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: order\order-ui.spec.ts >> Order UI >> TC-ORD-UI-01: Order page loads and form fields are visible
- Location: tests\order\order-ui.spec.ts:12:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Place a DNA Testing Order')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('text=Place a DNA Testing Order')

```

```
Error: apiRequestContext._wrapApiCall: Target page, context or browser has been closed
```