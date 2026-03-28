# Bloodline DNA Testing Service Management System FE

## Auth API Integration Guide (Team Flow)

This guide explains the current best-practice API integration pattern used for auth flows (Sign Up + OTP Verification).

## Goals

- Separate API layer from UI components.
- Keep query/mutation return values clean and predictable.
- Use TanStack Query for async state (loading, success, error).
- Keep Zustand for client/session state only.
- Use strict TypeScript contracts for request and response payloads.

## Project Structure

```text
src/
  lib/
    axios.ts                 # shared axios instance
    api-error.ts             # shared API error message parser

  services/
    auth/
      types.ts               # API request/response contracts
      authService.ts         # raw axios calls, returns response.data only
      auth.queries.ts        # TanStack Query hooks (mutations/queries)

  stores/
    useAuthStore.ts          # session-only client state (accessToken/userId)

  components/layout/auth/
    signup-form.tsx          # uses useSignUpMutation
    otp-verify-form.tsx      # uses useVerifyOtpMutation
```

## Rules We Follow

1. API layer only handles HTTP and returns `response.data`.
2. Query hooks transform API responses into UI-friendly values.
3. Components call hooks, not axios directly.
4. Zustand does not duplicate mutation/query state.
5. API errors are normalized via one helper (`getApiErrorMessage`).

## API Contracts

Defined in `src/services/auth/types.ts`:

- `ApiResponse<TData>`: common server envelope.
- `SignUpRequest`
- `SignUpResponseData` (contains `sign-up-id`)
- `VerifyOtpRequest`

## API Layer Pattern

Defined in `src/services/auth/authService.ts`:

- `signUp(payload)` calls `POST /v1/auth/sign-up`
- `verifyOtp(payload)` calls `POST /v1/auth/verification`

Both functions return only `response.data` (the server envelope), not the whole axios response.

## Query/Mutation Layer Pattern

Defined in `src/services/auth/auth.queries.ts`:

- `useSignUpMutation`
  - Calls `authService.signUp`
  - Returns clean value: `signUpId`
  - Handles success/error toast

- `useVerifyOtpMutation`
  - Calls `authService.verifyOtp`
  - Returns clean value: token/string from `response.data`
  - Handles success/error toast

If a query returns an envelope that needs shaping, use `select` inside `useQuery` to map it to a pure UI model.

## UI Flow (Current)

1. User submits signup form.
2. `useSignUpMutation` returns `signUpId`.
3. Signup page opens OTP dialog with `{ email, signUpId }`.
4. OTP form submits `{ signUpId, otp }` through `useVerifyOtpMutation`.
5. On success, access token is saved in Zustand session store.

## Loading and Error State Guidance

- Use `mutation.isPending` to disable submit buttons and show progress text.
- Use `mutation.isError` and shared error parser for inline message.
- Keep optimistic behavior conservative for auth endpoints.

## Zustand Scope Guideline

Store only long-lived client session state in Zustand:

- `accessToken`
- `userId`
- `setSession`
- `clearSession`

Do not store signup mutation state, otp mutation state, or request loading flags in Zustand.

## Add Another Auth Endpoint (Checklist)

1. Add request/response types in `src/services/auth/types.ts`.
2. Add API method in `src/services/auth/authService.ts`.
3. Add TanStack hook in `src/services/auth/auth.queries.ts`.
4. Consume hook inside UI component/page.
5. Handle pending/error/success in component.
6. Only write to Zustand if data is persistent session/client state.

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
