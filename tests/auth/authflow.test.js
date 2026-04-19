import { steps } from "../steps.js";

Feature("Full Authentication Test Flow");

Scenario("User can complete signup, login, then logout", async ({ I }) => {
  // Add custom steps to I
  Object.assign(I, steps);

  const timestamp = Date.now();
  const randomEmail = `user${timestamp}@example.com`;
  const randomUsername = `testuser${timestamp}`;
  const password = "SecurePass123!";

  // Complete signup flow
  await I.performCompleteSignUpToSignIn(
    "John",
    "Doe",
    randomEmail,
    randomUsername,
    password,
  );

  // Already on homepage after login
  I.wait(3);

  // Click user profile avatar to open dropdown menu
  I.click('[class*="size-9"]'); // Avatar element
  I.wait(1);

  // Click logout button using XPath
  I.click('//div[contains(text(), "Log out")]');
  I.wait(2);

  // Verify logout success - redirected to sign-in
  I.waitInUrl("/sign-in", 5);
  I.see("Login to your account");
});
