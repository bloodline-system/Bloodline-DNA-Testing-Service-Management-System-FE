import { expect, test } from '@playwright/test';

const formData = {
  testType: 'Paternity Test',
  fullName: 'Test User',
  email: `testuser+${Date.now()}@example.com`,
  phone: '0912345678',
  address: '123 Test Street',
};

test.describe('Order UI', () => {
  test('TC-ORD-UI-01: Order page loads and form fields are visible', async ({ page }) => {
    await page.goto('/order');
    await expect(page.locator('text=Place a DNA Testing Order')).toBeVisible({
      message: 'Order page title must be visible after login',
    });

    await expect(page.locator('label:has-text("Test Type")')).toBeVisible();
    await expect(page.locator('label:has-text("Full Name")')).toBeVisible();
    await expect(page.locator('label:has-text("Email")')).toBeVisible();
    await expect(page.locator('label:has-text("Phone Number")')).toBeVisible();
    await expect(page.locator('label:has-text("Address")')).toBeVisible();
  });

  test('TC-ORD-UI-02: Order form can be submitted and displays alert confirmation', async ({ page }) => {
    await page.goto('/order');
    await page.fill('#testType', formData.testType);
    await page.fill('#fullName', formData.fullName);
    await page.fill('#email', formData.email);
    await page.fill('#phone', formData.phone);
    await page.fill('#address', formData.address);

    const [dialog] = await Promise.all([
      page.waitForEvent('dialog'),
      page.click('button:has-text("Place Order")'),
    ]);

    expect(dialog.type(), 'Order submission should open an alert dialog').toBe('alert');
    expect(dialog.message(), 'Order submission should show success alert text').toContain(
      'Order placed successfully',
    );
    await dialog.dismiss();
  });
});
