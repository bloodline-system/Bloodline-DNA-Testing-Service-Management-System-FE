# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: order\order-new.spec.ts >> Order New Endpoints >> TC-ORD-NEW-01: GET /v1/manager/orders/new returns new orders and staff list
- Location: tests\order\order-new.spec.ts:13:3

# Error details

```
TimeoutError: apiRequestContext.post: Timeout 10000ms exceeded.
Call log:
  - → POST http://localhost:8080/api/v1/auth/login
    - user-agent: Playwright/1.59.1 (x64; windows 10.0) node/20.19
    - accept: */*
    - accept-encoding: gzip,deflate,br
    - content-type: application/json
    - content-length: 63

```

# Test source

```ts
  1  | import type { APIRequestContext, APIResponse } from '@playwright/test';
  2  | import { AUTH_CREDENTIALS, apiBaseUrl } from '../setup/auth.setup';
  3  | 
  4  | export async function authenticate(request: APIRequestContext) {
> 5  |   const response = await request.post(`${apiBaseUrl}/v1/auth/login`, {
     |                                  ^ TimeoutError: apiRequestContext.post: Timeout 10000ms exceeded.
  6  |     data: AUTH_CREDENTIALS,
  7  |   });
  8  |   const body = await response.json();
  9  | 
  10 |   if (response.status() !== 200 || body.code !== 200) {
  11 |     throw new Error(`Authentication failed: ${response.status()} ${JSON.stringify(body)}`);
  12 |   }
  13 | 
  14 |   return {
  15 |     accessToken: body.data.access_token as string,
  16 |     refreshToken: body.data.refresh_token as string,
  17 |   };
  18 | }
  19 | 
  20 | export function getBearerHeaders(token: string) {
  21 |   return {
  22 |     Authorization: `Bearer ${token}`,
  23 |   };
  24 | }
  25 | 
  26 | export function generateUniqueReportName(prefix = 'Report') {
  27 |   return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  28 | }
  29 | 
  30 | export function expectWrapper(body: any) {
  31 |   return {
  32 |     hasWrapper: () => {
  33 |       return (
  34 |         body &&
  35 |         Object.prototype.hasOwnProperty.call(body, 'code') &&
  36 |         Object.prototype.hasOwnProperty.call(body, 'message') &&
  37 |         Object.prototype.hasOwnProperty.call(body, 'data') &&
  38 |         Object.prototype.hasOwnProperty.call(body, 'timestamp')
  39 |       );
  40 |     },
  41 |   };
  42 | }
  43 | 
```