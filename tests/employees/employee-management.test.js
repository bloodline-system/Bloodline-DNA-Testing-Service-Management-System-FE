import {
  getManagerCredentials,
  getProfileTargetUsername,
  getStaffCredentials,
  loginWithUsernamePassword,
  openEmployeeCardByUsername,
} from './employee-helpers.js';

Feature('Employee management');

Scenario('Guest is redirected to sign-in when opening /admin/employees', async ({ I }) => {
  I.amOnPage('/admin/employees');
  I.waitInUrl('/sign-in', 15);
  I.see('Login to your account');
});

Scenario('MANAGER can open employee page and see overview sections', async ({ I }) => {
  const { username, password } = getManagerCredentials();
  await loginWithUsernamePassword(I, username, password);

  I.amOnPage('/admin/employees');
  I.waitInUrl('/admin/employees', 15);
  I.see('Account overview & recent activity');
  I.see('Employee filters');
  I.seeElement('//input[@placeholder="Search name or email"]');
  I.see('Employee detail panel');
});

Scenario('MANAGER can use filter controls without error', async ({ I }) => {
  const { username, password } = getManagerCredentials();
  await loginWithUsernamePassword(I, username, password);
  I.amOnPage('/admin/employees');
  I.wait(2);

  I.fillField('//input[contains(@placeholder,"Search name or email")]', 'staff');
  I.wait(1);
  I.click('Reset');
  I.see('Employee filters');
});

Scenario('MANAGER can open detail panel, Overview, Profile, Work history', async ({ I }) => {
  const { username, password } = getManagerCredentials();
  await loginWithUsernamePassword(I, username, password);
  I.amOnPage('/admin/employees');
  I.wait(2);

  const target = getProfileTargetUsername();
  await openEmployeeCardByUsername(I, target);

  I.see('Employee detail panel');
  I.see('Overview');
  I.see('Username');

  I.click('Profile');
  I.see('Update profile');

  I.click('Work history');
  I.see('Orders');
  I.see('Test results');
});

Scenario('MANAGER can update profile first name (tab Profile)', async ({ I }) => {
  const { username, password } = getManagerCredentials();
  await loginWithUsernamePassword(I, username, password);
  I.amOnPage('/admin/employees');
  I.wait(2);

  const target = getProfileTargetUsername();
  await openEmployeeCardByUsername(I, target);

  I.click('Profile');
  const suffix = `e2e${Date.now()}`;
  I.fillField('//input[@placeholder="First name"]', suffix);
  I.click('Update profile');
  I.wait(2);
  I.dontSee('Unable to update employee profile');
});

if (process.env.E2E_STAFF_USERNAME && process.env.E2E_STAFF_PASSWORD) {
  Scenario('STAFF user is redirected away from /admin/employees', async ({ I }) => {
    const { username, password } = getStaffCredentials();
    await loginWithUsernamePassword(I, username, password);
    I.amOnPage('/admin/employees');
    I.waitInUrl('/', 15);
  });
}

if (process.env.E2E_RUN_ROLE_ASSIGN === 'true') {
  Scenario('MANAGER assigns MANAGER role to profile target (destructive — opt-in)', async ({ I }) => {
    const { username, password } = getManagerCredentials();
    await loginWithUsernamePassword(I, username, password);
    I.amOnPage('/admin/employees');
    I.wait(2);

    const target = getProfileTargetUsername();
    await openEmployeeCardByUsername(I, target);
    I.click('Overview');
    I.click('Set MANAGER');
    I.wait(2);
  });
}
