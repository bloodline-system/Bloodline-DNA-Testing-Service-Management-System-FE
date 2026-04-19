// testkit.steps.js - Custom reusable steps for Test Kit Management page
// Organized by action: navigate, create, edit, delete, search, pagination

const I = actor();

export const testKitSteps = {
  // ========== NAVIGATION STEPS ==========

  /**
   * Navigate to Test Kit Management page
   * Requires user to already be logged in
   */
  navigateToTestKitPage() {
    I.amOnPage("/test-kits");
    I.wait(2);
    I.see("Test Kits Management");
  },

  // ========== CREATE STEPS ==========

  /**
   * Open the Create Test Kit dialog
   */
  openCreateDialog() {
    I.click("Add Test Kit");
    I.waitForElement('[role="dialog"][data-state="open"]', 5);
    I.see("Create Test Kit");
  },

  /**
   * Fill the Create/Edit Test Kit form
   * NOTE: Form labels do NOT have htmlFor → must use positional selectors
   *
   * Dialog input order:
   *   input[0]              → Kit Name
   *   input[1]              → Producer
   *   input[type=number][0] → Base Price
   *   input[type=number][1] → Current Price
   *   input[type=number][2] → Quantity in Stock
   *   input[type=date]      → Expiry Date
   *   textarea              → Description
   *
   * @param {object} kit - { kitName, producedBy, basePrice, currentPrice, quantity, expiryDate, description }
   */
  async fillTestKitForm(kit) {
    await I.usePlaywrightTo("fill test kit form", async ({ page }) => {
      const dialog = page.getByRole("dialog");

      // Kit Name (1st input)
      if (kit.kitName !== undefined) {
        await dialog.locator("input").nth(0).clear();
        await dialog.locator("input").nth(0).fill(kit.kitName);
      }

      // Producer (2nd input)
      if (kit.producedBy !== undefined) {
        await dialog.locator("input").nth(1).clear();
        await dialog.locator("input").nth(1).fill(kit.producedBy);
      }

      // Base Price (1st number input)
      if (kit.basePrice !== undefined) {
        await dialog.locator('input[type="number"]').nth(0).clear();
        await dialog
          .locator('input[type="number"]')
          .nth(0)
          .fill(String(kit.basePrice));
      }

      // Current Price (2nd number input)
      if (kit.currentPrice !== undefined) {
        await dialog.locator('input[type="number"]').nth(1).clear();
        await dialog
          .locator('input[type="number"]')
          .nth(1)
          .fill(String(kit.currentPrice));
      }

      // Quantity in Stock (3rd number input)
      if (kit.quantity !== undefined) {
        await dialog.locator('input[type="number"]').nth(2).clear();
        await dialog
          .locator('input[type="number"]')
          .nth(2)
          .fill(String(kit.quantity));
      }

      // Expiry Date
      if (kit.expiryDate !== undefined) {
        await dialog.locator('input[type="date"]').fill(kit.expiryDate);
      }

      // Description (textarea)
      if (kit.description !== undefined) {
        await dialog.locator("textarea").clear();
        await dialog.locator("textarea").fill(kit.description);
      }
    });
  },

  /**
   * Submit the Create form by clicking "Create" button
   * Then verify dialog closes
   */
  async submitCreateForm() {
    await I.usePlaywrightTo("click Create button", async ({ page }) => {
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "Create" })
        .click();
    });
    I.wait(2);
    I.dontSeeElement('[role="dialog"][data-state="open"]');
  },

  /**
   * Complete full create flow: open dialog → fill form → submit
   * @param {object} kit - kit data object
   */
  async createTestKit(kit) {
    testKitSteps.openCreateDialog();
    await testKitSteps.fillTestKitForm(kit);
    await testKitSteps.submitCreateForm();
  },

  // ========== EDIT STEPS ==========

  /**
   * Click edit button on a specific row (default: first row)
   * @param {number} rowIndex - 0-based row index (default: 0)
   */
  async openEditDialog(rowIndex = 0) {
    await I.usePlaywrightTo("click edit button", async ({ page }) => {
      await page
        .locator("table tbody tr")
        .nth(rowIndex)
        .locator("button")
        .first()
        .click();
    });
    I.waitForElement('[role="dialog"][data-state="open"]', 5);
    I.see("Edit Test Kit");
  },

  /**
   * Submit the Edit form by clicking "Update" button
   * Then verify dialog closes
   */
  async submitEditForm() {
    await I.usePlaywrightTo("click Update button", async ({ page }) => {
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "Update" })
        .click();
    });
    I.wait(2);
    I.dontSeeElement('[role="dialog"][data-state="open"]');
  },

  // ========== DELETE STEPS ==========

  /**
   * Click delete button on a specific row and accept the confirm dialog
   * @param {number} rowIndex - 0-based row index (default: 0)
   */
  async deleteTestKit(rowIndex = 0) {
    await I.usePlaywrightTo(
      "click delete and accept confirm",
      async ({ page }) => {
        // Accept browser confirm() before clicking
        page.once("dialog", (dialog) => dialog.accept());
        await page
          .locator("table tbody tr")
          .nth(rowIndex)
          .locator("button")
          .nth(1)
          .click();
      },
    );
    I.wait(2);
  },

  /**
   * Click delete button on a specific row and DISMISS (cancel) the confirm dialog
   * @param {number} rowIndex - 0-based row index (default: 0)
   */
  async dismissDeleteTestKit(rowIndex = 0) {
    await I.usePlaywrightTo(
      "click delete and dismiss confirm",
      async ({ page }) => {
        // Dismiss browser confirm() → kit should NOT be deleted
        page.once("dialog", (dialog) => dialog.dismiss());
        await page
          .locator("table tbody tr")
          .nth(rowIndex)
          .locator("button")
          .nth(1)
          .click();
      },
    );
    I.wait(1);
  },

  // ========== CANCEL STEPS ==========

  /**
   * Click Cancel button inside the open dialog
   */
  async cancelDialog() {
    await I.usePlaywrightTo("click Cancel button", async ({ page }) => {
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "Cancel" })
        .click();
    });
    I.wait(1);
    I.dontSeeElement('[role="dialog"][data-state="open"]');
  },

  // ========== SEARCH STEPS ==========

  /**
   * Type a search query into the search bar
   * @param {string} query
   */
  searchTestKit(query) {
    I.fillField('input[placeholder="Search test kits..."]', query);
    I.wait(2);
  },

  /**
   * Clear the search bar
   */
  clearSearch() {
    I.clearField('input[placeholder="Search test kits..."]');
    I.wait(2);
  },

  // ========== PAGINATION STEPS ==========

  /**
   * Click Next page button
   */
  goToNextPage() {
    I.click("Next");
    I.wait(1);
  },

  /**
   * Click Previous page button
   */
  goToPreviousPage() {
    I.click("Previous");
    I.wait(1);
  },

  /**
   * Verify current page number shown in pagination
   * @param {number} pageNumber - 1-based page number
   */
  seeCurrentPage(pageNumber) {
    I.see(`Page ${pageNumber}`);
  },

  // ========== ASSERTION STEPS ==========

  /**
   * Verify a kit name is visible in the table
   * @param {string} kitName
   */
  seeKitInTable(kitName) {
    I.see(kitName);
  },

  /**
   * Verify a kit name is NOT visible in the table
   * @param {string} kitName
   */
  dontSeeKitInTable(kitName) {
    I.dontSee(kitName);
  },

  /**
   * Verify the kit status badge is "Available"
   */
  seeAvailableBadge() {
    I.see("Available");
  },
};
