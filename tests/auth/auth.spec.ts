import { expect, test } from '@playwright/test';
import { apiBaseUrl, AUTH_CREDENTIALS, generateUniqueName } from '../setup/auth.setup';

test.describe('Authentication', () => {
  test('TC-AUTH-01: Manager login returns access token and valid payload', async ({ request }) => {
    const start = Date.now();
    const response = await request.post(`${apiBaseUrl}/v1/auth/login`, {
      data: AUTH_CREDENTIALS,
    });
    const elapsed = Date.now() - start;

    expect(response.status(), 'Login HTTP status should be 200').toBe(200);
    expect(elapsed, 'Login response time should be under 2000ms').toBeLessThan(2000);

    const body = await response.json();
    expect(body.code, 'Auth body code should equal 200').toBe(200);
    expect(body.data, 'Auth response data object should exist').toBeTruthy();
    expect(body.data.access_token, 'Access token should be present').toBeTruthy();
    expect(body.data.access_token.split('.').length, 'Access token should be a JWT token').toBe(3);
    expect(body.data.refresh_token, 'Refresh token should be present').toBeTruthy();
    expect(typeof body.data.user_id, 'User ID should be returned').toBe('number');
  });

  test('TC-AUTH-02: Login with wrong credentials returns error', async ({ request }) => {
    const response = await request.post(`${apiBaseUrl}/v1/auth/login`, {
      data: {
        username: 'manager2',
        password: 'wrongpassword',
        rememberMe: true,
      },
    });

    expect(response.status(), 'Invalid login attempt should not return 200').not.toBe(200);

    const body = await response.json();
    expect(body.code, 'Invalid credentials should return error code').not.toBe(200);
    expect(body.message, 'Error message should be present for invalid credentials').toBeTruthy();
  });

  test('TC-AUTH-03: Login page UI uses correct selectors and returns response successfully', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/sign-in');

    await expect(page.locator('text=Login to your account')).toBeVisible({
      message: 'Sign-in heading should be visible on login page',
    });

    await page.fill('#username', AUTH_CREDENTIALS.username);
    await page.fill('#password', AUTH_CREDENTIALS.password);

    const [response] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/v1/auth/login') && r.request().method() === 'POST'),
      page.click('button:has-text("Login")'),
    ]);

    expect(response.ok(), 'Login network response should be OK').toBe(true);
    const body = await response.json();
    expect(body.code, 'Login response body code should equal 200').toBe(200);
    expect(body.data.access_token, 'Login response should contain access token').toBeTruthy();

    await context.close();
  });
});
