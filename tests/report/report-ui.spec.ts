import { expect, test } from '@playwright/test';

const unauthorizedBase = process.env.BASE_URL ?? 'http://localhost:5173';

test.describe('Report UI', () => {
  test('TC-REP-UI-01: Report page should load for authenticated manager and show cards', async ({ page }) => {
    await page.goto('/report');
    await expect(page.locator('text=DNA Test Reports')).toBeVisible({
      message: 'Report page title must be visible for authenticated manager',
    });
    await expect(page.locator('text=Paternity Test')).toBeVisible({
      message: 'At least one report card title must be visible',
    });
    await expect(page.locator('button:has-text("View Details")')).toHaveCount(
      3,
      { message: 'Report page should display three report cards as defined in mock data' },
    );
  });

  test('TC-REP-UI-02: Report card must display status and result data', async ({ page }) => {
    await page.goto('/report');
    await expect(page.locator('text=Status: Completed')).toBeVisible({
      message: 'Completed status should be visible on report card',
    });
    await expect(page.locator('text=Result: Positive Match')).toBeVisible({
      message: 'Report result text should be displayed on card',
    });
  });

  test('TC-REP-UI-03: Report page must redirect to login when user is not authenticated', async ({ browser }) => {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();
    await page.goto(`${unauthorizedBase}/report`);
    await expect(page).toHaveURL(/sign-in/, {
      message: 'Unauthorized access to report page should redirect to sign-in page',
    });
    await expect(page.locator('text=Login to your account')).toBeVisible();
    await context.close();
  });

  test('TC-REP-UI-04: Report cards should include view details actions', async ({ page }) => {
    await page.goto('/report');
    const buttons = page.locator('button:has-text("View Details")');
    await expect(buttons.first()).toBeVisible({
      message: 'Each report card should contain a View Details button',
    });
  });
});
