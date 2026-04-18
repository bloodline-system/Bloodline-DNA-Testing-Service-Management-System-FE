const I = actor();

const TAB_MAP = {
  personal: "Personal",
  account: "Account",
  security: "Security",
};

export const profileSteps = {
  navigateToProfilePage(tab = "personal") {
    I.amOnPage(`/profile?tab=${tab}`);
    I.waitInUrl("/profile", 10);
    I.waitForText("Shape your profile and security in one place.", 10);
    I.waitForText("Account studio", 10);

    const normalized = `${tab}`.toLowerCase();
    if (normalized === "personal") {
      I.waitForText("Personal information", 10);
      I.waitForElement("#firstName", 10);
      I.waitForElement("#email", 10);
      
      // Wait for form to be fully populated with actual user data
      I.waitForFunction(() => {
        const emailEl = document.querySelector("#email");
        const firstNameEl = document.querySelector("#firstName");
        // Ensure email has loaded real data (contains @ and is not placeholder)
        return Boolean(
          emailEl && 
          emailEl.value && 
          emailEl.value.includes("@") &&
          firstNameEl &&
          firstNameEl.value &&
          firstNameEl.value.length > 0
        );
      }, 15);
      
      I.waitForElement(locate("button").withText("Save changes"), 10);
    }
  },

  goToProfileTab(tabName) {
    const normalized = `${tabName}`.toLowerCase();
    const tabLabel = TAB_MAP[normalized] || tabName;
    I.click(tabLabel);
    I.waitInUrl(`/profile?tab=${normalized}`, 10);

    if (normalized === "personal") {
      I.waitForText("Personal information", 10);
      I.waitForElement("#firstName", 10);
    }

    if (normalized === "account") {
      I.waitForText("Danger zone", 10);
      I.waitForText("Delete account", 10);
    }

    if (normalized === "security") {
      I.waitForText("Password change", 10);
      I.waitForElement("#currentPassword", 10);
    }
  },

  fillPersonalProfileForm(data = {}) {
    if (data.firstName !== undefined) {
      I.fillField("#firstName", data.firstName);
      I.executeScript(() => {
        const el = document.querySelector("#firstName");
        el?.dispatchEvent(new Event("input", { bubbles: true }));
        el?.blur?.();
      });
    }
    if (data.lastName !== undefined) {
      I.fillField("#lastName", data.lastName);
      I.executeScript(() => {
        const el = document.querySelector("#lastName");
        el?.dispatchEvent(new Event("input", { bubbles: true }));
        el?.blur?.();
      });
    }
    if (data.email !== undefined) {
      I.fillField("#email", data.email);
      I.executeScript(() => {
        const el = document.querySelector("#email");
        el?.dispatchEvent(new Event("input", { bubbles: true }));
        el?.blur?.();
      });
    }
    if (data.phoneNumber !== undefined) {
      I.fillField("#phoneNumber", data.phoneNumber);
      I.executeScript(() => {
        const el = document.querySelector("#phoneNumber");
        el?.dispatchEvent(new Event("input", { bubbles: true }));
        el?.blur?.();
      });
    }
    if (data.dateOfBirth !== undefined) {
      I.fillField("#dateOfBirth", data.dateOfBirth);
      I.executeScript(() => {
        const el = document.querySelector("#dateOfBirth");
        el?.dispatchEvent(new Event("input", { bubbles: true }));
        el?.blur?.();
      });
    }
  },

  async uploadAvatar(filePath) {
    await I.usePlaywrightTo("upload valid avatar file", async ({ page }) => {
      await page
        .locator('input[type="file"][accept="image/*"]')
        .first()
        .setInputFiles(filePath);

      const preview = page.getByAltText("Avatar preview");
      await preview.waitFor({ state: "visible" });
      await page.waitForFunction(() => {
        const img = document.querySelector('img[alt="Avatar preview"]');
        const src = img ? img.getAttribute("src") : "";
        return Boolean(src && src.startsWith("blob:"));
      });
    });
  },

  async uploadInvalidAvatarType(filePath) {
    await I.usePlaywrightTo("upload invalid avatar type file", async ({ page }) => {
      await page.locator('input[type="file"][accept="image/*"]').setInputFiles(filePath);
    });
  },

  async uploadOversizedAvatar(filePath) {
    await I.usePlaywrightTo("upload oversized avatar image", async ({ page }) => {
      await page.locator('input[type="file"][accept="image/*"]').setInputFiles(filePath);
    });
  },

  saveProfileChanges() {
    I.waitForEnabled(locate("button").withText("Save changes"), 20);
    I.click("Save changes");
    I.waitForText("Profile updated successfully.", 10);
  },

  fillPasswordForm(data = {}) {
    if (data.currentPassword !== undefined) {
      I.fillField("#currentPassword", data.currentPassword);
    }
    if (data.newPassword !== undefined) {
      I.fillField("#newPassword", data.newPassword);
    }
    if (data.confirmPassword !== undefined) {
      I.fillField("#confirmPassword", data.confirmPassword);
    }
  },

  submitPasswordUpdate() {
    I.waitForElement(locate("button").withText("Update password"), 10);
    I.click("Update password");
  },

  openDeleteAccountDialog() {
    I.waitForElement(locate("button").withText("Delete account"), 10);
    I.click("Delete account");
    I.waitForElement('[role="dialog"][data-state="open"]', 10);
    I.see("Delete account", '[role="dialog"]');
    I.see("Confirm delete", '[role="dialog"]');
  },

  cancelDeleteAccount() {
    I.click("Cancel", '[role="dialog"]');
    I.dontSeeElement('[role="dialog"][data-state="open"]');
  },

  confirmDeleteAccount() {
    I.click("Confirm delete", '[role="dialog"]');
  },

  async openProfileFromNavbar() {
    await I.usePlaywrightTo("open profile from navbar dropdown", async ({ page }) => {
      const trigger = page
        .locator("button")
        .filter({ hasText: "Hey," })
        .first();
      await trigger.click();
      await page.getByRole("menuitem", { name: "Profile" }).click();
    });
    I.waitInUrl("/profile", 10);
  },

  async getAvatarPreviewSrc() {
    return await I.usePlaywrightTo("read avatar preview source", async ({ page }) => {
      return await page.getByAltText("Avatar preview").getAttribute("src");
    });
  },
};
