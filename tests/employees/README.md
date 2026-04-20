# Employee management — CodeceptJS E2E

These tests live only under `tests/employees/` and do not modify existing project files.

## Prerequisites

1. **Frontend** running on the same origin as [codecept.conf.js](../../codecept.conf.js) Playwright `url` (default `http://localhost:5174`).
2. **Backend** at `http://localhost:8080` (REST helper in config; employee UI calls `/api` via Vite proxy).

## Run

From the repository root:

```bash
npx codeceptjs run tests/employees/employee-management.test.js
```

Or run all tests (includes `tests/employees` via glob `tests/**/*.test.js`):

```bash
npm test
```

Headless:

```bash
set HEADLESS=true
npx codeceptjs run tests/employees/employee-management.test.js
```

(PowerShell: `$env:HEADLESS="true"; npx codeceptjs run tests/employees/employee-management.test.js`)

## Environment variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `E2E_MANAGER_USERNAME` / `E2E_MANAGER_PASSWORD` | Login as MANAGER (or ADMIN) to access `/admin/employees` | `manager2` / `manager2` |
| `E2E_PROFILE_TARGET_USERNAME` | Employee card opened for Profile / Overview flows | `staff1` |
| `E2E_STAFF_USERNAME` / `E2E_STAFF_PASSWORD` | If both set, runs scenario: STAFF cannot access employee page | _(optional)_ |
| `E2E_RUN_ROLE_ASSIGN` | Set to `true` to run optional destructive scenario that clicks **Set MANAGER** | off |

Do not commit real production passwords; use local seed accounts only.
