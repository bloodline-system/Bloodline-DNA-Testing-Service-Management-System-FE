// steps.js - Custom reusable steps for CodeceptJS tests
// Organized by feature: auth, homepage, etc.

const I = actor();

export const steps = {
  // ========== AUTHENTICATION STEPS ==========

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
    // Avoid brittle immediate text asserts; wait for the form to hydrate.
    I.waitForElement("#firstName", 15);
    I.see("Bloodline DNA System");
    I.see("Get Started");

    // Fill sign-up form
    I.fillField("#firstName", firstName);
    I.fillField("#lastName", lastName);
    I.fillField("#email", email);
    I.fillField("#username", username);
    I.fillField("#password", password);
    I.fillField("#confirmPassword", password);

    // Submit form
    I.waitForEnabled(locate("button").withText("Create Account"), 10);
    const signUpResponse = await I.usePlaywrightTo(
      "submit signup and capture sign-up response",
      async ({ page }) => {
        const responsePromise = page.waitForResponse(
          (response) =>
            response.url().includes("/api/v1/auth/sign-up") &&
            response.request().method() === "POST",
        );
        await page
          .getByRole("button", { name: "Create Account", exact: true })
          .click();
        const response = await responsePromise;
        const body = await response.text();
        return { status: response.status(), body };
      },
    );

    if (signUpResponse.status !== 200) {
      throw new Error(
        `Sign-up failed with status ${signUpResponse.status}: ${signUpResponse.body}`,
      );
    }

    // Handle OTP verification
    I.see("Verify your login");
    I.see("Enter the verification code");
    I.waitForText("Verify your login", 10);
    I.seeElement('[data-slot="input-otp"]');

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
    I.waitForEnabled(locate("button").withText("Verify"), 10);
    I.click("Verify");

    // Redirect to sign-in
    I.waitInUrl("/sign-in", 10);
    I.see("Login to your account");

    // Login with newly created credentials
    I.fillField("#username", username);
    I.fillField("#password", password);

    // "Login" text also exists in "Login with GitHub"; click the exact submit button.
    await I.usePlaywrightTo(
      "submit login and wait redirect",
      async ({ page }) => {
        const loginForm = page.locator("form").filter({
          has: page.locator("#username"),
        });

        await page.waitForFunction(() => {
          const forms = document.querySelectorAll("form");
          for (const form of forms) {
            if (!form.querySelector("#username")) continue;
            const btns = form.querySelectorAll('button[type="submit"]');
            for (const b of btns) {
              const t = (b.textContent || "").replace(/\s+/g, " ").trim();
              if (t === "Login" && !b.disabled) return true;
            }
          }
          return false;
        });

        const responsePromise = page.waitForResponse(
          (response) =>
            response.url().includes("/api/v1/auth/login") &&
            response.request().method() === "POST",
        );

        await loginForm
          .getByRole("button", { name: "Login", exact: true })
          .click();

        await responsePromise;

        await page.waitForURL(
          (url) => {
            try {
              const p = new URL(url).pathname;
              return p !== "/sign-in" && !p.startsWith("/sign-in/");
            } catch {
              return false;
            }
          },
          { timeout: 20000, waitUntil: "commit" },
        );
      },
    );
  },
};
