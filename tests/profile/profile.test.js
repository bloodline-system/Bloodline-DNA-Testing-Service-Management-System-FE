import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { steps } from "../steps.js";
import { profileSteps } from "./profile.steps.js";

Feature("Profile page E2E flow");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..", "..");
const fixtureDir = path.join(projectRoot, "tests", "_data");
const validAvatarPath = path.join(fixtureDir, "avatar-valid.png");
const invalidAvatarPath = path.join(fixtureDir, "avatar-invalid.txt");
const oversizedAvatarPath = path.join(fixtureDir, "avatar-too-large.jpg");
const sourceAvatarPath = path.join(projectRoot, "src", "assets", "toggle-logo.png");

// NOTE: Fixtures are prepared at runtime for portability.
const ensureProfileFixtures = () => {
  if (!fs.existsSync(fixtureDir)) {
    fs.mkdirSync(fixtureDir, { recursive: true });
  }
  if (!fs.existsSync(validAvatarPath) && fs.existsSync(sourceAvatarPath)) {
    fs.copyFileSync(sourceAvatarPath, validAvatarPath);
  }
  if (!fs.existsSync(invalidAvatarPath)) {
    fs.writeFileSync(invalidAvatarPath, "this is not an image");
  }
  if (!fs.existsSync(oversizedAvatarPath)) {
    const oversizedBytes = Buffer.alloc(1024 * 1024 + 64, "A");
    fs.writeFileSync(oversizedAvatarPath, oversizedBytes);
  }
};

const buildShortSuffix = () => {
  return Date.now().toString(36).slice(-6);
};

const buildSafePassword = (unsafeTokens = []) => {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const randomCore = Math.random().toString(36).slice(2, 10);
    const candidate = `Safe!${randomCore}@T9`;
    const normalizedCandidate = candidate.toLowerCase();
    const hasOverlap = unsafeTokens.some((token) => {
      if (!token) return false;
      const normalizedToken = `${token}`.toLowerCase();
      if (normalizedToken.length < 4) return false;
      return normalizedCandidate.includes(normalizedToken);
    });
    if (!hasOverlap) {
      return candidate;
    }
  }
  return "Safe!x7m2q8k1@T9";
};

const createUserData = (seed = "profile") => {
  const suffix = buildShortSuffix();
  const safeSeed = seed.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12);
  const firstName = `${safeSeed}First`;
  const lastName = `${safeSeed}Last`;
  const username = `${safeSeed}u${suffix}`;
  return {
    firstName,
    lastName,
    email: `${safeSeed}.${suffix}@gmail.com`,
    username,
    password: buildSafePassword([firstName, lastName, username]),
  };
};

const loginFromSignInPage = async (I, username, password) => {
  I.amOnPage("/sign-in");
  I.waitForText("Login to your account", 10);
  I.fillField("#username", username);
  I.fillField("#password", password);
  I.waitForEnabled(locate("button").withText("Login"), 10);
  I.click("Login");
  I.waitInUrl("/", 10);
};

const logoutFromNavbar = async (I) => {
  await I.usePlaywrightTo("logout from navbar profile dropdown", async ({ page }) => {
    await page
      .locator("button")
      .filter({ hasText: "Hey," })
      .first()
      .click();
    await page.getByRole("menuitem", { name: "Log out" }).click();
  });
  I.waitInUrl("/sign-in", 10);
};

const isSaveChangesDisabled = async (I) => {
  return await I.usePlaywrightTo("check save changes button disabled state", async ({ page }) => {
    const btn = page.getByRole("button", { name: "Save changes" });
    return await btn.isDisabled();
  });
};

const isUpdatePasswordDisabled = async (I) => {
  return await I.usePlaywrightTo("check update password button disabled state", async ({ page }) => {
    const btn = page.getByRole("button", { name: "Update password" });
    return await btn.isDisabled();
  });
};


Scenario("Scenario 1: User cannot access Profile page without login", async ({ I }) => {
  Object.assign(I, profileSteps);
  I.amOnPage("/profile");
  I.waitInUrl("/sign-in", 10);
  I.see("Login to your account");
  I.see("Bloodline DNA System");
});

Scenario("Scenario 2: User can open Profile page after signup and login", async ({ I }) => {
  Object.assign(I, steps);
  Object.assign(I, profileSteps);
  const user = createUserData("profileopen");
  ensureProfileFixtures();
  await I.performCompleteSignUpToSignIn(
    user.firstName,
    user.lastName,
    user.email,
    user.username,
    user.password,
  );
  I.navigateToProfilePage("personal");
  I.see("Personal");
  I.see("Account");
  I.see("Security");
  I.see(user.username);
  I.see(user.email);
});

Scenario(
  "Scenario 3: User can update personal profile successfully with valid email, phone, and date of birth",
  async ({ I }) => {
    Object.assign(I, steps);
    Object.assign(I, profileSteps);
    const user = createUserData("profileupdate");
    const updateSuffix = buildShortSuffix();
    const updated = {
      firstName: `Updated${updateSuffix}`,
      lastName: `User${updateSuffix}`,
      email: `updated.${updateSuffix}@gmail.com`,
      phoneNumber: "+84 912-345-678",
      dateOfBirth: "1994-12-30",
    };
    await I.performCompleteSignUpToSignIn(
      user.firstName,
      user.lastName,
      user.email,
      user.username,
      user.password,
    );
    I.navigateToProfilePage("personal");
    // Fill bằng Playwright để chắc chắn trigger đúng input/change cho RHF + input[type=date]
    await I.usePlaywrightTo("fill valid personal profile form and enable save", async ({ page }) => {
      await page.locator("#firstName").fill(updated.firstName);
      await page.locator("#firstName").blur();
      await page.locator("#lastName").fill(updated.lastName);
      await page.locator("#lastName").blur();
      await page.locator("#email").fill(updated.email);
      await page.locator("#email").blur();
      await page.locator("#phoneNumber").fill(updated.phoneNumber);
      await page.locator("#phoneNumber").blur();
      const dob = page.locator("#dateOfBirth");
      await dob.fill(updated.dateOfBirth);
      await dob.blur();
      await page.getByRole("button", { name: "Save changes" }).waitFor({ state: "visible" });
    });
    I.waitForEnabled(locate("button").withText("Save changes"), 10);
    I.click("Save changes");
    // Toast success tới từ mutation onSuccess
    I.see("Profile updated successfully.");
    I.refreshPage();
    I.waitInUrl("/profile", 10);
    I.waitForElement("#firstName", 10);
    I.seeInField("#firstName", updated.firstName);
    I.seeInField("#lastName", updated.lastName);
    I.seeInField("#email", updated.email);
    I.seeInField("#phoneNumber", updated.phoneNumber);
    I.seeInField("#dateOfBirth", updated.dateOfBirth);
  },
);

Scenario("Scenario 4: Personal profile shows validation error with invalid email", async ({ I }) => {
  Object.assign(I, steps);
  Object.assign(I, profileSteps);
  const user = createUserData("invalidemail");
  await I.performCompleteSignUpToSignIn(
    user.firstName,
    user.lastName,
    user.email,
    user.username,
    user.password,
  );
  I.navigateToProfilePage("personal");
  I.fillPersonalProfileForm({ email: "invalidemail.com" });
  I.click("#firstName");
  I.see("Please enter a valid email.");
});

Scenario("Scenario 5: Personal profile shows validation error with invalid phone number", async ({ I }) => {
  Object.assign(I, steps);
  Object.assign(I, profileSteps);
  const user = createUserData("invalidphone");
  await I.performCompleteSignUpToSignIn(
    user.firstName,
    user.lastName,
    user.email,
    user.username,
    user.password,
  );
  I.navigateToProfilePage("personal");
  I.fillPersonalProfileForm({ phoneNumber: "0909ABC###" });
  I.click("#firstName");
  I.see("Phone number must contain only digits, +, -, and spaces.");
  const saveDisabled = await isSaveChangesDisabled(I);
  if (!saveDisabled) {
    throw new Error("Expected Save changes button to be disabled for invalid phone number.");
  }
});


Scenario("Scenario 6: Personal profile rejects invalid date input format", async ({ I }) => {
  Object.assign(I, steps);
  Object.assign(I, profileSteps);
  const user = createUserData("invaliddate");
  await I.performCompleteSignUpToSignIn(
    user.firstName,
    user.lastName,
    user.email,
    user.username,
    user.password,
  );
  I.navigateToProfilePage("personal");

  const dateValueAfterInvalidInput = await I.usePlaywrightTo(
    "set invalid date format into date input safely",
    async ({ page }) => {
      const dateInput = page.locator("#dateOfBirth");

      await dateInput.click();

      // Không dùng fill("12/30/1994") vì input type=date sẽ throw Malformed value.
      // Set DOM value trực tiếp để mô phỏng dữ liệu sai format rồi trigger input/change.
      await dateInput.evaluate((el) => {
        el.value = "12/30/1994";
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        el.dispatchEvent(new Event("blur", { bubbles: true }));
      });

      return await dateInput.inputValue();
    },
  );

  I.click("#firstName");

  if (dateValueAfterInvalidInput === "12/30/1994") {
    throw new Error("Invalid date format was accepted unexpectedly.");
  }

  const saveDisabled = await isSaveChangesDisabled(I);
  if (!saveDisabled) {
    throw new Error("Save button should be disabled with invalid date.");
  }
});
 
Scenario("Scenario 7: User can upload valid avatar and save profile", async ({ I }) => {
  Object.assign(I, steps);
  Object.assign(I, profileSteps);
  ensureProfileFixtures();

  const user = createUserData("validavatar");
  await I.performCompleteSignUpToSignIn(
    user.firstName,
    user.lastName,
    user.email,
    user.username,
    user.password,
  );

  I.navigateToProfilePage("personal");
  I.waitForElement('input[type="file"][accept="image/*"]', 10);

  const beforePreviewSrc = await I.getAvatarPreviewSrc();

  await I.usePlaywrightTo("upload avatar and submit profile form directly", async ({ page }) => {
    const fileInput = page.locator('input[type="file"][accept="image/*"]');
    await fileInput.setInputFiles(validAvatarPath);
    await page.waitForTimeout(800);

    const preview = page.getByAltText("Avatar preview");
    await preview.waitFor({ state: "visible" });

    const form = page.locator("form").first();
    await form.evaluate((el) => {
      el.requestSubmit();
    });
  });

  I.waitForText("Profile updated successfully.", 15);
  I.wait(1);

  const afterPreviewSrc = await I.getAvatarPreviewSrc();

  if (!afterPreviewSrc) {
    throw new Error("Avatar preview src is empty after valid upload.");
  }

  if (afterPreviewSrc === beforePreviewSrc) {
    throw new Error("Avatar preview src did not change after valid upload.");
  }
});


Scenario("Scenario 8: User cannot upload non-image avatar", async ({ I }) => {
  Object.assign(I, steps);
  Object.assign(I, profileSteps);
  ensureProfileFixtures();
  const user = createUserData("invalidavatar");
  await I.performCompleteSignUpToSignIn(
    user.firstName,
    user.lastName,
    user.email,
    user.username,
    user.password,
  );
  I.navigateToProfilePage("personal");
  const beforePreviewSrc = await I.getAvatarPreviewSrc();
  await I.uploadInvalidAvatarType(invalidAvatarPath);
  I.see("Please select an image file.");
  const afterPreviewSrc = await I.getAvatarPreviewSrc();
  if (afterPreviewSrc !== beforePreviewSrc) {
    throw new Error("Avatar preview changed after uploading an invalid file type.");
  }
});

Scenario("Scenario 9: User cannot upload avatar larger than 1MB", async ({ I }) => {
  Object.assign(I, steps);
  Object.assign(I, profileSteps);
  ensureProfileFixtures();
  const user = createUserData("oversizedavatar");
  await I.performCompleteSignUpToSignIn(
    user.firstName,
    user.lastName,
    user.email,
    user.username,
    user.password,
  );
  I.navigateToProfilePage("personal");
  const beforePreviewSrc = await I.getAvatarPreviewSrc();
  await I.uploadOversizedAvatar(oversizedAvatarPath);
  I.see("Image must be 1MB or smaller.");
  const afterPreviewSrc = await I.getAvatarPreviewSrc();
  if (afterPreviewSrc !== beforePreviewSrc) {
    throw new Error("Avatar preview changed after uploading oversized avatar.");
  }
});

Scenario("Scenario 10: User can open Account tab and see account information", async ({ I }) => {
  Object.assign(I, steps);
  Object.assign(I, profileSteps);
  const user = createUserData("accounttab");
  await I.performCompleteSignUpToSignIn(
    user.firstName,
    user.lastName,
    user.email,
    user.username,
    user.password,
  );
  I.navigateToProfilePage("account");
  I.goToProfileTab("account");
  I.see("Account");
  I.see("Username");
  I.see("Role");
  I.see(user.username);
  I.seeElement(locate("span").withText("Role"));
  const hasStatusOrCreatedAt = await I.usePlaywrightTo(
    "verify account metadata status or created at",
    async ({ page }) => {
      const createdAtCount = await page.getByText("Created at").count();
      const statusCount = await page.getByText("Status").count();
      return createdAtCount > 0 || statusCount > 0;
    },
  );
  if (!hasStatusOrCreatedAt) {
    throw new Error("Expected account tab to show either Created at or Status.");
  }
});

Scenario("Scenario 11: User can cancel delete account", async ({ I }) => {
  Object.assign(I, steps);
  Object.assign(I, profileSteps);
  const user = createUserData("canceldelete");
  await I.performCompleteSignUpToSignIn(
    user.firstName,
    user.lastName,
    user.email,
    user.username,
    user.password,
  );
  I.navigateToProfilePage("account");
  I.goToProfileTab("account");
  I.openDeleteAccountDialog();
  I.cancelDeleteAccount();
  I.waitInUrl("/profile", 10);
  I.see("Danger zone");
  I.amOnPage("/profile?tab=personal");
  I.waitInUrl("/profile", 10);
  I.see("Personal information");
});

Scenario("Scenario 12: User can delete account successfully", async ({ I }) => {
  Object.assign(I, steps);
  Object.assign(I, profileSteps);
  const user = createUserData("confirmdelete");
  await I.performCompleteSignUpToSignIn(
    user.firstName,
    user.lastName,
    user.email,
    user.username,
    user.password,
  );
  I.navigateToProfilePage("account");
  I.goToProfileTab("account");
  I.openDeleteAccountDialog();
  I.confirmDeleteAccount();
  I.waitInUrl("/sign-in", 10);
  I.see("Login to your account");
  I.amOnPage("/profile");
  I.waitInUrl("/sign-in", 10);
});

Scenario("Scenario 13: User can change password successfully", async ({ I }) => {
  Object.assign(I, steps);
  Object.assign(I, profileSteps);
  const user = createUserData("changepassword");
  const newPassword = "SecurePass456!";
  await I.performCompleteSignUpToSignIn(
    user.firstName,
    user.lastName,
    user.email,
    user.username,
    user.password,
  );
  I.navigateToProfilePage("security");
  I.goToProfileTab("security");
  I.fillPasswordForm({
    currentPassword: user.password,
    newPassword,
    confirmPassword: newPassword,
  });
  I.submitPasswordUpdate();
  I.waitForElement(locate("button").withText("Update password"), 10);
  await logoutFromNavbar(I);
  await loginFromSignInPage(I, user.username, newPassword);
  I.amOnPage("/profile?tab=security");
  I.waitInUrl("/profile", 10);
});

Scenario("Scenario 14: User cannot change password with empty fields", async ({ I }) => {
  Object.assign(I, steps);
  Object.assign(I, profileSteps);
  const user = createUserData("emptypassword");
  await I.performCompleteSignUpToSignIn(
    user.firstName,
    user.lastName,
    user.email,
    user.username,
    user.password,
  );
  I.navigateToProfilePage("security");
  I.goToProfileTab("security");
  I.submitPasswordUpdate();
  I.see("Please fill in all password fields.");
  const stillDisabled = await isUpdatePasswordDisabled(I);
  if (stillDisabled) {
    throw new Error("Update password button is disabled unexpectedly.");
  }
});

Scenario(
  "Scenario 15: User cannot change password when confirm password mismatches",
  async ({ I }) => {
    Object.assign(I, steps);
    Object.assign(I, profileSteps);
    const user = createUserData("mismatchpassword");
    await I.performCompleteSignUpToSignIn(
      user.firstName,
      user.lastName,
      user.email,
      user.username,
      user.password,
    );
    I.navigateToProfilePage("security");
    I.goToProfileTab("security");
    I.fillPasswordForm({
      currentPassword: user.password,
      newPassword: "SecurePass456!",
      confirmPassword: "SecurePass789!",
    });
    I.submitPasswordUpdate();
    I.see("New password and confirmation do not match.");
  },
);
   