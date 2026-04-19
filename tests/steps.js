// steps.js - Custom reusable steps for CodeceptJS tests
// Organized by feature: auth, homepage, etc.

const I = actor();

export const steps = {
  // ========== AUTHENTICATION STEPS ==========

  /**
   * Sign in with username + password (same fields as LoginForm).
   * Requires FE + BE; redirects to "/" on success.
   */
  async loginWithUsernamePassword(username, password) {
    I.amOnPage('/sign-in');
    I.see('Login to your account');
    I.fillField('#username', username);
    I.fillField('#password', password);
    I.waitForEnabled('form button[type="submit"]', 10);
    I.click('form button[type="submit"]');
    I.waitInUrl('/', 20);
  },

  /** Open employee management (requires ADMIN or MANAGER session). */
  goToEmployeeManagement() {
    I.amOnPage('/admin/employees');
  },

  /**
   * Complete signup to signin workflow
   */
  /**
   * Complete signup to signin workflow
   * 1. Navigate to signup page
   * 2. Fill form with provided credentials
   * 3. Submit and verify OTP dialog
   * 4. Retrieve OTP from debug endpoint
   * 5. Enter OTP code
   * 6. Verify signup completion
   * 7. Login with same credentials
   * 8. Verify redirect to homepage
   */
  async performCompleteSignUpToSignIn(
    firstName,
    lastName,
    email,
    username,
    password,
  ) {
    // Navigate to sign-up page
    I.amOnPage("/sign-up");
    I.see("Bloodline DNA System");
    I.see("Get Started");
    I.see("It's free to signup");

    // Fill sign-up form
    I.fillField("#firstName", firstName);
    I.fillField("#lastName", lastName);
    I.fillField("#email", email);
    I.fillField("#username", username);
    I.fillField("#password", password);
    I.fillField("#confirmPassword", password);

    // Submit form
    I.see("Create Account");
    I.click("button");

    // Handle OTP verification
    I.waitForElement('[role="dialog"][data-state="open"]', 10);
    I.see("Verify your login");
    I.see("Enter the verification code");
    I.seeElement('[data-slot="input-otp"]');
    I.wait(3);

    // Retrieve OTP from debug endpoint
    const response = await I.sendGetRequest(
      `/api/debug/otp/username/${username}`,
    );
    const otpCode = response.data.data.otp_code;

    // Input OTP
    await I.usePlaywrightTo("type OTP code", async ({ page }) => {
      const otpInput = page.locator('[data-slot="input-otp"]');
      await otpInput.focus();
      await otpInput.pressSequentially(otpCode, { delay: 50 });
    });

    // Wait for all OTP slots to be filled
    I.waitForFunction(
      () =>
        Array.from(
          document.querySelectorAll('[data-slot="input-otp-slot"]'),
        ).every((slot) => slot.textContent.trim() !== ""),
      10,
    );

    // Submit OTP verification
    I.waitForEnabled('[role="dialog"] button[type="submit"]', 10);
    I.click('[role="dialog"] button[type="submit"]');

    // Redirect to sign-in
    I.waitInUrl("/sign-in", 10);
    I.see("Login to your account");

    // Login with newly created credentials
    I.fillField("input:nth-of-type(1)", username);
    I.fillField('input[type="password"]', password);
    I.seeElement("button");
    I.see("Login");
    I.click("button");

    // Verify login button is ready to submit
    I.seeElement("button");
    I.see("Login");

    // Click login button to submit form
    I.click("button");

    I.waitInUrl("/", 5);
  },
};
