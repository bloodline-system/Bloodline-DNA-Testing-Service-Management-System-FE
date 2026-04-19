import { authSteps } from "./auth.steps.js";

Feature("Full Authentication Test Flow");

Scenario("User can complete signup, login, then logout", async ({ I }) => {
  // Add custom steps to I
  Object.assign(I, authSteps);

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

  // Logout (avoid fixed sleeps; wait for real UI signals)
  await I.usePlaywrightTo("logout via navbar", async ({ page }) => {
    await page.locator('[class*="size-9"]').first().click();
    await page.getByText("Log out", { exact: true }).click();
  });

  // Verify logout success.
  // App may redirect to /sign-in or stay on home ("Logout successfully!" toast).
  await I.usePlaywrightTo("verify logged-out state", async ({ page }) => {
    await page.waitForLoadState("domcontentloaded");

    await page.waitForURL(
      (url) => url.pathname === "/sign-in" || url.pathname === "/",
      { timeout: 5000 },
    );

    const pathname = new URL(page.url()).pathname;
    if (pathname === "/sign-in") {
      await page.getByText("Login to your account", { exact: true }).waitFor({
        timeout: 5000,
      });
      return;
    }

    await page.getByText("Sign In", { exact: true }).first().waitFor({
      timeout: 5000,
    });

    // Ensure logout menu item is not visible anymore.
    const logoutVisibleCount = await page
      .getByText("Log out", { exact: true })
      .count();
    if (logoutVisibleCount > 0) {
      throw new Error(
        'Expected to be logged out, but "Log out" is still visible',
      );
    }
  });
});
