/**
 * Helpers for employee-management E2E (CodeceptJS + Playwright).
 * Kept in a separate file so existing tests/steps.js is not modified.
 */

/** @param {CodeceptJS.I} I */
export async function loginWithUsernamePassword(I, username, password) {
  I.amOnPage('/sign-in');
  I.see('Login to your account');
  I.fillField('#username', username);
  I.fillField('#password', password);
  I.click('//button[@type="submit"][contains(normalize-space(.),"Login")]');
  I.waitInUrl('/', 20);
}

export function getManagerCredentials() {
  return {
    username: process.env.E2E_MANAGER_USERNAME ?? 'manager2',
    password: process.env.E2E_MANAGER_PASSWORD ?? 'manager2',
  };
}

export function getProfileTargetUsername() {
  return process.env.E2E_PROFILE_TARGET_USERNAME ?? 'staff1';
}

export function getStaffCredentials() {
  const username = process.env.E2E_STAFF_USERNAME;
  const password = process.env.E2E_STAFF_PASSWORD;
  return { username, password };
}

/**
 * Click "View" on the employee card that shows @username in the card header.
 * @param {CodeceptJS.I} I
 * @param {string} username without @ prefix
 */
export async function openEmployeeCardByUsername(I, username) {
  await I.usePlaywrightTo(`open View for @${username}`, async ({ page }) => {
    const handle = `@${username}`;
    let node = page.getByText(handle, { exact: true });
    await node.waitFor({ state: 'visible', timeout: 15000 });
    for (let depth = 0; depth < 25; depth += 1) {
      node = node.locator('xpath=..');
      const viewCount = await node.getByRole('button', { name: 'View' }).count();
      if (viewCount === 1) {
        await node.getByRole('button', { name: 'View' }).click();
        return;
      }
    }
    throw new Error(`Could not find a unique View button for ${handle}`);
  });
  I.wait(1);
}
