Feature("Homepage");

Scenario("User can navigate to contact section", async ({ I }) => {
  // Navigate to homepage
  I.amOnPage("/");

  // Scroll to contact section by navigating to anchor
  I.amOnPage("/#contact");
  I.wait(1);

  // Verify contact section is visible
  I.see("Get In Touch");
  I.see("Start Your DNA Journey Today");
});

Scenario(
  "User can complete full flow: homepage -> signup -> login -> logout -> homepage -> login",
  async ({ I }) => {
    // ========== STEP 1: START FROM HOMEPAGE ==========
    I.amOnPage("/");
    I.see("Discover Your DNA Story with Bloodline Testing");

    // Generate random credentials
    const timestamp = Date.now();
    const randomEmail = `user${timestamp}@example.com`;
    const randomUsername = `testuser${timestamp}`;
    const password = "SecurePass123!";

    // Import custom steps
    const { steps } = await import("../steps.js");
    Object.assign(I, steps);

    // ========== STEP 2: COMPLETE SIGNUP AND LOGIN ==========
    await I.performCompleteSignUpToSignIn(
      "Jane",
      "Doe",
      randomEmail,
      randomUsername,
      password,
    );

    // Verify we're on homepage after login
    I.wait(2);
    I.seeInCurrentUrl("/");

    // ========== STEP 3: PERFORM LOGOUT ==========
    I.click('[class*="size-9"]'); // Avatar element
    I.wait(1);
    I.click('//div[contains(text(), "Log out")]');
    I.wait(2);

    // Verify redirected to sign-in page
    I.waitInUrl("/sign-in", 10);
    I.see("Login to your account");

    // ========== STEP 4: LOGIN AGAIN ==========
    I.fillField("input:nth-of-type(1)", randomUsername);
    I.fillField('input[type="password"]', password);
    I.click("button");

    // Verify redirected back to homepage
    I.waitInUrl("/", 10);
    I.see("Discover Your DNA Story");
    I.wait(5); // Final pause before test ends
  },
);
