import { steps } from "../steps.js";
import { testKitSteps } from "./testkit.steps.js";

Feature("Test Kit Management");

Scenario("User cannot access Test Kit page without login", async ({ I }) => {
  // Navigate directly without authentication
  I.amOnPage("/test-kits");
  I.wait(2);

  // ProtectedRoute redirects to /sign-in when no accessToken
  I.waitInUrl("/sign-in", 5);
  I.see("Login to your account");
});

Scenario(
  "User can view Test Kit Management page after login",
  async ({ I }) => {
    // Add custom steps to I
    Object.assign(I, steps);
    Object.assign(I, testKitSteps);

    // Generate random credentials
    const timestamp = Date.now();
    const randomEmail = `user${timestamp}@example.com`;
    const randomUsername = `testuser${timestamp}`;
    const password = "SecurePass123!";

    // ========== STEP 1: SIGNUP AND LOGIN ==========
    await I.performCompleteSignUpToSignIn(
      "John",
      "Doe",
      randomEmail,
      randomUsername,
      password,
    );

    // ========== STEP 2: NAVIGATE TO TEST KIT PAGE ==========
    I.navigateToTestKitPage();

    // Verify Add Test Kit button exists
    I.see("Add Test Kit");

    // Verify search bar exists
    I.seeElement('input[placeholder="Search test kits..."]');

    // Verify table headers
    I.see("ID");
    I.see("Kit Name");
    I.see("Type");
    I.see("Sample Type");
    I.see("Price");
    I.see("Stock");
    I.see("Status");
    I.see("Actions");

    // Verify pagination controls
    I.see("Previous");
    I.see("Next");
  },
);

Scenario(
  "User can create a new Test Kit and see it in the table",
  async ({ I }) => {
    // Add custom steps to I
    Object.assign(I, steps);
    Object.assign(I, testKitSteps);

    // Generate random credentials
    const timestamp = Date.now();
    const randomEmail = `user${timestamp}@example.com`;
    const randomUsername = `testuser${timestamp}`;
    const password = "SecurePass123!";
    const kitName = `E2E Kit ${timestamp}`;

    // ========== STEP 1: SIGNUP AND LOGIN ==========
    await I.performCompleteSignUpToSignIn(
      "Jane",
      "Doe",
      randomEmail,
      randomUsername,
      password,
    );

    // ========== STEP 2: NAVIGATE TO TEST KIT PAGE ==========
    I.navigateToTestKitPage();

    // ========== STEP 3: CREATE NEW TEST KIT ==========
    await I.createTestKit({
      kitName,
      producedBy: `E2E Lab ${timestamp}`,
      basePrice: "150",
      currentPrice: "120",
      quantity: "25",
      expiryDate: "2027-12-31",
      description: `Auto-generated kit ${timestamp}`,
    });

    // ========== STEP 4: VERIFY KIT APPEARS IN TABLE ==========
    I.seeKitInTable(kitName);
    I.seeAvailableBadge();
  },
);

Scenario(
  "Create Test Kit form shows validation errors when submitted empty",
  async ({ I }) => {
    // Add custom steps to I
    Object.assign(I, steps);
    Object.assign(I, testKitSteps);

    // Generate random credentials
    const timestamp = Date.now();
    const randomEmail = `user${timestamp}@example.com`;
    const randomUsername = `testuser${timestamp}`;
    const password = "SecurePass123!";

    // ========== STEP 1: SIGNUP AND LOGIN ==========
    await I.performCompleteSignUpToSignIn(
      "John",
      "Smith",
      randomEmail,
      randomUsername,
      password,
    );

    // ========== STEP 2: NAVIGATE TO TEST KIT PAGE ==========
    I.navigateToTestKitPage();

    // ========== STEP 3: OPEN DIALOG AND CLEAR ALL FIELDS ==========
    I.openCreateDialog();

    await I.fillTestKitForm({
      kitName: "",
      producedBy: "",
      expiryDate: "",
    });

    // ========== STEP 4: SUBMIT EMPTY FORM ==========
    await I.usePlaywrightTo("click Create button", async ({ page }) => {
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "Create" })
        .click();
    });
    I.wait(1);

    // ========== STEP 5: VERIFY VALIDATION MESSAGES ==========
    I.see("Kit name is required");
    I.see("Producer is required");
    I.see("Expiry date is required");

    // Dialog should still be open
    I.seeElement('[role="dialog"][data-state="open"]');
  },
);

Scenario(
  "User can cancel Create Test Kit dialog without creating a kit",
  async ({ I }) => {
    // Add custom steps to I
    Object.assign(I, steps);
    Object.assign(I, testKitSteps);

    // Generate random credentials
    const timestamp = Date.now();
    const randomEmail = `user${timestamp}@example.com`;
    const randomUsername = `testuser${timestamp}`;
    const password = "SecurePass123!";
    const kitName = `Cancelled Kit ${timestamp}`;

    // ========== STEP 1: SIGNUP AND LOGIN ==========
    await I.performCompleteSignUpToSignIn(
      "Alice",
      "Doe",
      randomEmail,
      randomUsername,
      password,
    );

    // ========== STEP 2: NAVIGATE TO TEST KIT PAGE ==========
    I.navigateToTestKitPage();

    // ========== STEP 3: OPEN DIALOG AND FILL KIT NAME ==========
    I.openCreateDialog();
    await I.fillTestKitForm({ kitName });

    // ========== STEP 4: CANCEL DIALOG ==========
    await I.cancelDialog();

    // ========== STEP 5: VERIFY KIT NOT CREATED ==========
    I.dontSeeKitInTable(kitName);
  },
);

Scenario("User can edit an existing Test Kit", async ({ I }) => {
  // Add custom steps to I
  Object.assign(I, steps);
  Object.assign(I, testKitSteps);

  // Generate random credentials
  const timestamp = Date.now();
  const randomEmail = `user${timestamp}@example.com`;
  const randomUsername = `testuser${timestamp}`;
  const password = "SecurePass123!";

  // Use highly unique names to avoid collision with other test data
  const originalName = `ORIG_${timestamp}`;
  const updatedName = `UPDT_${timestamp}`;

  // ========== STEP 1: SIGNUP AND LOGIN ==========
  await I.performCompleteSignUpToSignIn(
    "Bob",
    "Doe",
    randomEmail,
    randomUsername,
    password,
  );

  // ========== STEP 2: NAVIGATE AND CREATE A KIT ==========
  I.navigateToTestKitPage();

  await I.createTestKit({
    kitName: originalName,
    producedBy: "Original Lab",
    basePrice: "100",
    currentPrice: "90",
    quantity: "10",
    expiryDate: "2027-06-30",
  });

  I.seeKitInTable(originalName);

  // ========== STEP 3: FIND AND CLICK EDIT ON THE CORRECT ROW ==========
  // Use Playwright to find the exact row containing originalName
  await I.usePlaywrightTo(
    "click edit on row with originalName",
    async ({ page }) => {
      const row = page
        .locator("table tbody tr")
        .filter({ hasText: originalName });
      await row.locator("button").first().click();
    },
  );

  I.waitForElement('[role="dialog"][data-state="open"]', 5);
  I.see("Edit Test Kit");

  // ========== STEP 4: UPDATE KIT NAME ==========
  await I.fillTestKitForm({ kitName: updatedName });
  await I.submitEditForm();

  // ========== STEP 5: VERIFY UPDATED NAME IN TABLE ==========
  // Updated name should appear
  I.seeKitInTable(updatedName);

  // Original name should no longer exist anywhere in table
  // Use Playwright to check exact cell content to avoid partial match
  await I.usePlaywrightTo("verify original name is gone", async ({ page }) => {
    const rows = page.locator("table tbody tr");
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const cellText = await rows.nth(i).locator("td").nth(1).textContent();
      if (cellText?.trim() === originalName) {
        throw new Error(
          `Found original kit name "${originalName}" in row ${i} — edit did not work correctly`,
        );
      }
    }
  });
});

Scenario("User can delete a Test Kit", async ({ I }) => {
  // Add custom steps to I
  Object.assign(I, steps);
  Object.assign(I, testKitSteps);

  // Generate random credentials
  const timestamp = Date.now();
  const randomEmail = `user${timestamp}@example.com`;
  const randomUsername = `testuser${timestamp}`;
  const password = "SecurePass123!";
  const kitName = `DEL_${timestamp}`;

  // ========== STEP 1: SIGNUP AND LOGIN ==========
  await I.performCompleteSignUpToSignIn(
    "Charlie",
    "Doe",
    randomEmail,
    randomUsername,
    password,
  );

  // ========== STEP 2: NAVIGATE AND CREATE A KIT ==========
  I.navigateToTestKitPage();

  await I.createTestKit({
    kitName,
    producedBy: "Delete Lab",
    basePrice: "80",
    currentPrice: "70",
    quantity: "5",
    expiryDate: "2027-03-31",
  });

  I.seeKitInTable(kitName);

  // ========== STEP 3: DELETE THE KIT ==========
  // Click delete on the exact row containing kitName
  await I.usePlaywrightTo("click delete on exact row", async ({ page }) => {
    page.once("dialog", (dialog) => dialog.accept());
    const row = page.locator("table tbody tr").filter({ hasText: kitName });
    await row.locator("button").nth(1).click();
  });

  I.wait(2);

  // ========== STEP 4: VERIFY KIT IS REMOVED OR UNAVAILABLE ==========
  // Backend may soft-delete (isAvailable=false) or hard-delete
  // Either way, check the exact row — if still present, status must be "Unavailable"
  await I.usePlaywrightTo(
    "verify kit deleted or unavailable",
    async ({ page }) => {
      const row = page.locator("table tbody tr").filter({ hasText: kitName });
      const count = await row.count();

      if (count === 0) {
        // Hard delete — kit is completely gone ✅
        console.log(`✅ Kit "${kitName}" was hard deleted`);
        return;
      }

      // Soft delete — kit still present, must have "Unavailable" status
      const statusCell = row.locator("td").nth(6);
      const statusText = await statusCell.textContent();
      if (!statusText?.includes("Unavailable")) {
        throw new Error(
          `Kit "${kitName}" still exists with status "${statusText}" after delete — expected Unavailable or removed`,
        );
      }
      console.log(
        `✅ Kit "${kitName}" was soft deleted — status is Unavailable`,
      );
    },
  );
});

Scenario(
  "User can navigate between pages using pagination controls",
  async ({ I }) => {
    // Add custom steps to I
    Object.assign(I, steps);
    Object.assign(I, testKitSteps);

    // Generate random credentials
    const timestamp = Date.now();
    const randomEmail = `user${timestamp}@example.com`;
    const randomUsername = `testuser${timestamp}`;
    const password = "SecurePass123!";

    // ========== STEP 1: SIGNUP AND LOGIN ==========
    await I.performCompleteSignUpToSignIn(
      "Diana",
      "Doe",
      randomEmail,
      randomUsername,
      password,
    );

    // ========== STEP 2: NAVIGATE TO TEST KIT PAGE ==========
    I.navigateToTestKitPage();

    // ========== STEP 3: CREATE 11 KITS TO TRIGGER SECOND PAGE ==========
    for (let i = 1; i <= 11; i++) {
      await I.createTestKit({
        kitName: `Page Kit ${i} ${timestamp}`,
        producedBy: `Lab ${i}`,
        basePrice: "100",
        currentPrice: "90",
        quantity: "5",
        expiryDate: "2027-12-31",
      });
    }

    // ========== STEP 4: VERIFY PAGINATION ==========
    // Currently on page 1
    I.seeCurrentPage(1);

    // Previous button is disabled on first page
    I.seeElement("button[disabled]");

    // Click Next to go to page 2
    I.goToNextPage();
    I.seeCurrentPage(2);

    // Click Previous to go back to page 1
    I.goToPreviousPage();
    I.seeCurrentPage(1);
  },
);
