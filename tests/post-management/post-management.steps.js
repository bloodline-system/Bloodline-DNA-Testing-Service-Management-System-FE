// post-management.steps.js — custom steps tái sử dụng (CodeceptJS + Playwright)

import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  getAdminCredentials,
  getManagementCredentials,
  getManagerCredentials,
  getE2eBaseUrl,
  e2eAbsoluteUrl,
  managementAuthSteps,
} from "../auth/management-auth.steps.js";
import { POST_TEXT, PW } from "./post-management.selectors.js";
import {
  expectNoCreatePostRequest,
  handleNextDialog,
  isManagerPostsCreateRequest,
  isManagerPostsListRequest,
  waitForResponseMatching,
} from "./network.utils.js";
import { retryAsync } from "../utils/retry.js";

const I = actor();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const E2E_FEATURED_IMAGE = path.join(
  __dirname,
  "fixtures",
  "e2e-featured.png",
);

/** Re-export — đăng nhập ADMIN/MANAGER dùng chung tests/auth/management-auth.steps.js */
export { getAdminCredentials, getManagementCredentials, getManagerCredentials };

/**
 * Card bài viết theo đúng tiêu đề (tránh partial match).
 * @param {import('playwright').Page} page
 * @param {string} exactTitle
 */
export function postCardByTitle(page, exactTitle) {
  return page.locator(PW.postCard).filter({
    has: page.locator(PW.cardTitle).getByText(exactTitle, { exact: true }),
  });
}

function filtersCard(page) {
  const title = page
    .locator('[data-slot="card-title"]')
    .filter({ hasText: new RegExp(`^${POST_TEXT.filtersHeading}$`) })
    .first();

  return title.locator("..").locator("..");
}

function editorCard(page) {
  const title = page
    .locator('aside [data-slot="card-title"]')
    .filter({ hasText: /^(Create post|Edit post)$/ })
    .first();

  return title.locator("..").locator("..");
}

async function waitForPostListSettled(page) {
  await page.waitForFunction(
    (loadingText) => !document.body.innerText.includes(loadingText),
    POST_TEXT.loading,
    { timeout: 60000 },
  );
}

/**
 * Read persisted auth session from zustand (key: auth-storage).
 * @param {import('playwright').Page} page
 */
async function hasAuthSession(page) {
  return page
    .evaluate(() => {
      try {
        const raw = localStorage.getItem("auth-storage");
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        const token = parsed?.state?.accessToken;
        return Boolean(token && typeof token === "string" && token.length > 10);
      } catch {
        return false;
      }
    })
    .catch(() => false);
}

/**
 * Probe access to Post Management by observing GET /api/v1/manager/posts.
 * - status 200 => authorized
 * - status 401/403 => authenticated but not authorized
 * - redirect /sign-in => not authenticated
 *
 * @param {import('playwright').Page} page
 */
async function probePostManagementAccess(page) {
  const listResponsePromise = page
    .waitForResponse((r) => isManagerPostsListRequest(r), { timeout: 20000 })
    .catch(() => null);

  await page.goto(e2eAbsoluteUrl("/manager/posts"), {
    waitUntil: "domcontentloaded",
  });

  await Promise.race([
    listResponsePromise,
    page
      .waitForURL(/\/sign-in(?:\b|\/|\?|#)/, { timeout: 15000 })
      .catch(() => null),
    page
      .getByText(POST_TEXT.heroHeading, { exact: true })
      .waitFor({ state: "visible", timeout: 15000 })
      .catch(() => null),
    page
      .getByText(POST_TEXT.loadError, { exact: true })
      .waitFor({ state: "visible", timeout: 15000 })
      .catch(() => null),
  ]).catch(() => {});

  const currentUrl = page.url();
  if (/\/sign-in(?:\b|\/|\?|#)/.test(currentUrl)) {
    return {
      ok: false,
      reason: "redirect_signin",
      status: null,
      url: currentUrl,
    };
  }

  const res = await listResponsePromise;
  const status = res ? res.status() : null;

  if (status === 200) {
    return { ok: true, reason: "ok", status, url: currentUrl };
  }

  if (status === 401 || status === 403) {
    return { ok: false, reason: "api_unauthorized", status, url: currentUrl };
  }

  // If the request wasn't captured but hero is visible, treat as likely OK.
  // (This avoids false negatives from fast cache/memoized queries.)
  const heroVisible = await page
    .getByText(POST_TEXT.heroHeading, { exact: true })
    .isVisible()
    .catch(() => false);

  if (!res && heroVisible) {
    return {
      ok: true,
      reason: "ui_ready_no_list_response",
      status: null,
      url: currentUrl,
    };
  }

  const loadErrorVisible = await page
    .getByText(POST_TEXT.loadError, { exact: true })
    .isVisible()
    .catch(() => false);

  if (loadErrorVisible) {
    return { ok: false, reason: "ui_load_error", status, url: currentUrl };
  }

  return { ok: false, reason: "unknown", status, url: currentUrl };
}

/**
 * Mở /manager/posts và chờ render (hero hoặc load error).
 */
async function goToPostManagementCore() {
  await I.usePlaywrightTo(
    "open /manager/posts and wait UI",
    async ({ page }) => {
      // Prepare wait BEFORE navigation to avoid missing the response.
      const listResponsePromise = page
        .waitForResponse((r) => isManagerPostsListRequest(r), {
          timeout: 25000,
        })
        .catch(() => null);

      await page.goto(e2eAbsoluteUrl("/manager/posts"), {
        waitUntil: "domcontentloaded",
      });

      // Wait for one of the expected states.
      await Promise.race([
        page
          .getByText(POST_TEXT.heroHeading, { exact: true })
          .waitFor({ state: "visible", timeout: 30000 }),
        page
          .getByText(POST_TEXT.loadError, { exact: true })
          .waitFor({ state: "visible", timeout: 30000 }),
        page.waitForURL(/\/sign-in(?:\b|\/|\?|#)/, { timeout: 30000 }),
      ]).catch(() => {});

      if (page.url().includes("/sign-in")) {
        throw new Error(
          "Redirected back to /sign-in when opening /manager/posts",
        );
      }

      const heroVisible = await page
        .getByText(POST_TEXT.heroHeading, { exact: true })
        .isVisible()
        .catch(() => false);

      const loadErrorVisible = await page
        .getByText(POST_TEXT.loadError, { exact: true })
        .isVisible()
        .catch(() => false);

      const listResponse = await listResponsePromise;

      if (!heroVisible && !loadErrorVisible) {
        const status = listResponse ? listResponse.status() : "NO_RESPONSE";
        throw new Error(
          `Post page did not render expected FE state. GET /manager/posts status=${status}`,
        );
      }

      if (heroVisible) {
        // Minimal "page ready" signals for subsequent CRUD steps.
        await page
          .getByText(POST_TEXT.filtersHeading, { exact: true })
          .waitFor({ state: "visible", timeout: 20000 });
        await page
          .locator('aside [data-slot="card-title"]')
          .filter({ hasText: new RegExp(`^${POST_TEXT.createPostHeading}$`) })
          .first()
          .waitFor({ state: "visible", timeout: 20000 });

        // Best-effort: let list finish loading to reduce flakiness.
        await waitForPostListSettled(page).catch(() => {});
      }
    },
  );
}

/**
 * Step gộp cho toàn bộ test quản lý bài viết: đăng nhập MANAGER hoặc ADMIN rồi vào /manager/posts.
 * @param {{ role?: "MANAGER"|"ADMIN", username?: string, password?: string }} [options]
 */
async function loginForPostManagement(options = {}) {
  const role = options.role ?? "MANAGER";
  const { username, password } = options;
  if (role === "ADMIN") {
    await managementAuthSteps.loginAsAdmin(username, password);
  } else {
    await managementAuthSteps.loginAsManager(username, password);
  }
  await goToPostManagementCore();
}

export const postManagementSteps = {
  /** Ủy quyền sang management-auth.steps.js (MANAGER seed) */
  loginAsManager: managementAuthSteps.loginAsManager,

  /** Đăng nhập ADMIN seed — cùng flow, khác biến env ADMIN_* */
  loginAsAdmin: managementAuthSteps.loginAsAdmin,

  /** Đăng nhập (MANAGER/ADMIN) + mở trang quản lý bài viết — nên dùng trong Before() của test CRUD */
  loginForPostManagement,

  /**
   * Login as MANAGER seed only when needed.
   * @param {string} [username]
   * @param {string} [password]
   * @param {{ force?: boolean }} [options]
   */
  async loginAsManagerIfNeeded(username, password, options = {}) {
    const force = options.force ?? false;

    if (!force) {
      const alreadyLoggedIn = await I.usePlaywrightTo(
        "check auth session",
        async ({ page }) => {
          // Ensure same origin for localStorage access.
          if (!page.url().startsWith(getE2eBaseUrl())) {
            await page.goto(e2eAbsoluteUrl("/"), {
              waitUntil: "domcontentloaded",
            });
          }
          return hasAuthSession(page);
        },
      );
      if (alreadyLoggedIn) return;
    }

    await managementAuthSteps.loginAsManager(username, password);
  },

  /**
   * Login as ADMIN seed only when needed.
   * @param {string} [username]
   * @param {string} [password]
   * @param {{ force?: boolean }} [options]
   */
  async loginAsAdminIfNeeded(username, password, options = {}) {
    const force = options.force ?? false;

    if (!force) {
      const alreadyLoggedIn = await I.usePlaywrightTo(
        "check auth session",
        async ({ page }) => {
          if (!page.url().startsWith(getE2eBaseUrl())) {
            await page.goto(e2eAbsoluteUrl("/"), {
              waitUntil: "domcontentloaded",
            });
          }
          return hasAuthSession(page);
        },
      );
      if (alreadyLoggedIn) return;
    }

    await managementAuthSteps.loginAsAdmin(username, password);
  },

  /**
   * ensureAuthorizedForPostManagement()
   *
   * Mandatory authorization strategy:
   * 1) If NOT logged in -> login MANAGER
   * 2) If logged in but cannot access -> re-login MANAGER
   * 3) If still fail -> fallback ADMIN
   * 4) If still fail -> throw clear error
   */
  async ensureAuthorizedForPostManagement() {
    const attempts = [];

    const probe = () =>
      I.usePlaywrightTo("probe post management access", async ({ page }) => {
        return retryAsync(() => probePostManagementAccess(page), {
          retries: 1,
          delayMs: 250,
          shouldRetry: (error) =>
            /Timeout|net::|Navigation|ERR_/.test(String(error)),
        });
      });

    let result = await probe();
    attempts.push({ step: "probe_current", ...result });

    if (result.ok) {
      await goToPostManagementCore();
      return;
    }

    // 1) Not logged in -> login MANAGER
    if (result.reason === "redirect_signin") {
      await this.loginAsManagerIfNeeded(undefined, undefined, { force: true });
      result = await probe();
      attempts.push({ step: "login_manager", ...result });
      if (result.ok) {
        await goToPostManagementCore();
        return;
      }

      // 2) Still failing after manager login -> re-login MANAGER once
      await this.loginAsManagerIfNeeded(undefined, undefined, { force: true });
      result = await probe();
      attempts.push({ step: "relogin_manager", ...result });
      if (result.ok) {
        await goToPostManagementCore();
        return;
      }
    } else {
      // 2) Logged in but cannot access -> re-login MANAGER
      await this.loginAsManagerIfNeeded(undefined, undefined, { force: true });
      result = await probe();
      attempts.push({ step: "relogin_manager", ...result });
      if (result.ok) {
        await goToPostManagementCore();
        return;
      }
    }

    // 3) Fallback ADMIN
    await this.loginAsAdminIfNeeded(undefined, undefined, { force: true });
    result = await probe();
    attempts.push({ step: "fallback_admin", ...result });
    if (result.ok) {
      await goToPostManagementCore();
      return;
    }

    // 4) Fail with a clear, actionable error.
    const summarized = attempts
      .map(
        (a) =>
          `${a.step}:${a.reason}:${a.status ?? "NO_STATUS"}:${String(a.url).slice(0, 80)}`,
      )
      .join(" | ");

    throw new Error(
      `ensureAuthorizedForPostManagement failed. Attempts=${summarized}`,
    );
  },

  /**
   * Mở trang quản lý bài viết và chờ list load xong (hoặc error UI).
   */
  goToPostManagement: goToPostManagementCore,

  /**
   * @param {import('playwright').Page} page
   * @param {object} data
   * @param {string} [data.postTitle]
   * @param {string} [data.postContent]
   * @param {string} [data.postCategory]
   * @param {string} [data.postStatus]
   * @param {string[]} [data.tags]
   */
  async fillPostEditor(page, data) {
    const editor = editorCard(page);

    if (data.postTitle !== undefined) {
      const titleField = editor.locator("label", { hasText: /^Title$/ });
      await titleField
        .locator("..")
        .locator('input[data-slot="input"]')
        .fill(data.postTitle);
    }
    if (data.postContent !== undefined) {
      const contentField = editor.locator("label", { hasText: /^Content$/ });
      await contentField
        .locator("..")
        .locator('textarea[data-slot="textarea"]')
        .fill(data.postContent);
    }
    if (data.postCategory !== undefined) {
      const categoryField = editor.locator("label", { hasText: /^Category$/ });
      await categoryField
        .locator("..")
        .locator("select")
        .selectOption(data.postCategory);
    }
    if (data.postStatus !== undefined) {
      const statusField = editor.locator("label", { hasText: /^Status$/ });
      await statusField
        .locator("..")
        .locator("select")
        .selectOption(data.postStatus);
    }
    if (data.tags !== undefined && Array.isArray(data.tags)) {
      for (const tag of data.tags) {
        const label = String(tag).replaceAll("_", " ");
        await editor.getByRole("button", { name: label }).click();
      }
    }
  },

  /**
   * Upload ảnh đại diện — chờ hết "Uploading image..." (dễ fail nếu API upload down).
   * @param {import('playwright').Page} page
   * @param {string} absoluteFilePath
   */
  async uploadFeaturedImage(page, absoluteFilePath) {
    const editor = editorCard(page);
    const imageLabel = editor.locator("label", { hasText: /^Featured image$/ });
    const fileInput = imageLabel
      .locator("..")
      .locator('input[type="file"][accept="image/*"]');

    await fileInput.setInputFiles(absoluteFilePath);

    await page
      .getByText(POST_TEXT.uploadingImage, { exact: true })
      .waitFor({ state: "hidden", timeout: 60000 })
      .catch(() => {});

    await editor.locator('img[alt="Featured preview"]').waitFor({
      state: "visible",
      timeout: 30000,
    });
  },

  async submitPostEditor(page) {
    const editor = editorCard(page);
    const isEdit = await editor
      .locator('[data-slot="card-title"]')
      .getByText(POST_TEXT.editPostHeading, { exact: true })
      .isVisible()
      .catch(() => false);

    const name = isEdit ? POST_TEXT.updatePost : POST_TEXT.createPost;
    await editor.getByRole("button", { name }).click();
  },

  /**
   * Tạo bài từ UI — chờ POST 201 và list ổn định.
   */
  async createPostFromUI(page, payload, options = {}) {
    const { withImagePath } = options;

    await this.fillPostEditor(page, payload);

    if (withImagePath) {
      await this.uploadFeaturedImage(page, withImagePath);
    }

    const responsePromise = waitForResponseMatching(
      page,
      (r) =>
        isManagerPostsCreateRequest(r) && r.status() >= 200 && r.status() < 300,
      60000,
    );

    await this.submitPostEditor(page);

    const res = await responsePromise;
    if (res.status() !== 201) {
      throw new Error(`Create post expected 201, got ${res.status()}`);
    }

    await waitForResponseMatching(
      page,
      (r) => isManagerPostsListRequest(r) && r.status() === 200,
      30000,
    ).catch(() => null);

    await waitForPostListSettled(page);

    await postCardByTitle(page, payload.postTitle).waitFor({
      state: "visible",
      timeout: 20000,
    });
  },

  async updatePostFromUI(page, partial) {
    await this.fillPostEditor(page, partial);

    const responsePromise = waitForResponseMatching(
      page,
      (r) =>
        r.request().method() === "PUT" &&
        r.url().includes("/api/v1/manager/posts/") &&
        r.status() >= 200 &&
        r.status() < 300,
      60000,
    );

    await this.submitPostEditor(page);
    await responsePromise;
    await waitForPostListSettled(page);
  },

  /**
   * @param {import('playwright').Page} page
   * @param {{ query?: string, status?: string, category?: string, tag?: string }} f
   */
  async filterPosts(page, f) {
    const card = filtersCard(page);

    const expectedUrlFragments = [];
    if (f.query !== undefined) {
      expectedUrlFragments.push(`q=${encodeURIComponent(f.query)}`);
    }
    if (f.status !== undefined) {
      expectedUrlFragments.push(`status=${encodeURIComponent(f.status)}`);
    }
    if (f.category !== undefined) {
      expectedUrlFragments.push(`category=${encodeURIComponent(f.category)}`);
    }
    if (f.tag !== undefined) {
      expectedUrlFragments.push(`tag=${encodeURIComponent(f.tag)}`);
    }

    // Prepare wait BEFORE interacting to avoid missing a fast response.
    const responsePromise = waitForResponseMatching(
      page,
      (r) =>
        isManagerPostsListRequest(r) &&
        r.status() === 200 &&
        expectedUrlFragments.every((frag) => r.url().includes(frag)),
      30000,
    ).catch(() => null);

    if (f.query !== undefined) {
      await page.getByLabel(POST_TEXT.searchLabel).fill(f.query);
    }
    if (f.status !== undefined) {
      await card.locator("select").nth(0).selectOption(f.status);
    }
    if (f.category !== undefined) {
      await card.locator("select").nth(1).selectOption(f.category);
    }
    if (f.tag !== undefined) {
      await card.locator("select").nth(2).selectOption(f.tag);
    }

    await responsePromise;

    await waitForPostListSettled(page);
  },

  async resetFilters(page) {
    await filtersCard(page)
      .getByRole("button", { name: POST_TEXT.reset })
      .click();

    await waitForResponseMatching(
      page,
      (r) => isManagerPostsListRequest(r) && r.status() === 200,
      30000,
    ).catch(() => null);

    await waitForPostListSettled(page);
  },

  async resetPostEditor(page) {
    await editorCard(page)
      .getByRole("button", { name: POST_TEXT.reset })
      .click();
  },

  /**
   * @param {import('playwright').Page} page
   * @param {string} exactTitle
   * @param {'Edit'|'Publish'|'Archive'|'Delete'} action
   */
  async clickCardActionByTitle(page, exactTitle, action) {
    const card = postCardByTitle(page, exactTitle);
    await card.getByRole("button", { name: action }).click();
  },

  /**
   * Xóa bài có confirm — đăng ký dialog + DELETE response trước khi click.
   */
  async deletePostByTitleConfirmed(page, exactTitle) {
    const dialogPromise = handleNextDialog(page, "Delete post", "accept");
    const deletePromise = waitForResponseMatching(
      page,
      (r) =>
        r.request().method() === "DELETE" &&
        r.url().includes("/api/v1/manager/posts/"),
      30000,
    );

    await this.clickCardActionByTitle(page, exactTitle, "Delete");
    await dialogPromise;
    await deletePromise;
    await waitForPostListSettled(page);
  },

  /**
   * Bấm Delete rồi dismiss confirm — bài vẫn còn.
   */
  async deletePostByTitleDismiss(page, exactTitle) {
    const dialogPromise = handleNextDialog(page, "Delete post", "dismiss");
    await this.clickCardActionByTitle(page, exactTitle, "Delete");
    await dialogPromise;
    await waitForPostListSettled(page);
  },

  /**
   * Overload:
   * - expectPostCardVisible(title)
   * - expectPostCardVisible(page, title)
   */
  async expectPostCardVisible(pageOrTitle, maybeTitle) {
    if (typeof pageOrTitle === "string") {
      const exactTitle = pageOrTitle;
      await I.usePlaywrightTo(`see card ${exactTitle}`, async ({ page }) => {
        await postCardByTitle(page, exactTitle).waitFor({
          state: "visible",
          timeout: 15000,
        });
      });
      return;
    }

    const page = pageOrTitle;
    const exactTitle = maybeTitle;
    if (!exactTitle) throw new Error("Missing exactTitle");
    await postCardByTitle(page, exactTitle).waitFor({
      state: "visible",
      timeout: 15000,
    });
  },

  /**
   * Overload:
   * - expectPostCardNotVisible(title)
   * - expectPostCardNotVisible(page, title)
   */
  async expectPostCardNotVisible(pageOrTitle, maybeTitle) {
    if (typeof pageOrTitle === "string") {
      const exactTitle = pageOrTitle;
      await I.usePlaywrightTo(`no card ${exactTitle}`, async ({ page }) => {
        await postCardByTitle(page, exactTitle).waitFor({
          state: "hidden",
          timeout: 15000,
        });
      });
      return;
    }

    const page = pageOrTitle;
    const exactTitle = maybeTitle;
    if (!exactTitle) throw new Error("Missing exactTitle");
    await postCardByTitle(page, exactTitle).waitFor({
      state: "hidden",
      timeout: 15000,
    });
  },

  async expectStatsModeCreate() {
    I.see(POST_TEXT.modeCreate);
  },

  async expectStatsModeUpdate() {
    I.see(POST_TEXT.modeUpdate);
  },

  /**
   * Badge status trên card (sau statusLabel FE: Published, Archived, …).
   */
  /**
   * Overload:
   * - expectCardStatusBadge(title, statusLabel)
   * - expectCardStatusBadge(page, title, statusLabel)
   */
  async expectCardStatusBadge(pageOrTitle, titleOrStatus, maybeStatus) {
    if (typeof pageOrTitle === "string") {
      const exactTitle = pageOrTitle;
      const statusLabel = titleOrStatus;
      await I.usePlaywrightTo(
        `status ${statusLabel} for ${exactTitle}`,
        async ({ page }) => {
          const card = postCardByTitle(page, exactTitle);
          await card.getByText(statusLabel, { exact: true }).waitFor({
            state: "visible",
            timeout: 15000,
          });
        },
      );
      return;
    }

    const page = pageOrTitle;
    const exactTitle = titleOrStatus;
    const statusLabel = maybeStatus;
    if (!exactTitle || !statusLabel) {
      throw new Error("Missing exactTitle/statusLabel");
    }

    const card = postCardByTitle(page, exactTitle);
    await card.getByText(statusLabel, { exact: true }).waitFor({
      state: "visible",
      timeout: 15000,
    });
  },

  /**
   * Overload:
   * - openEditorByEdit(title)
   * - openEditorByEdit(page, title)
   */
  async openEditorByEdit(pageOrTitle, maybeTitle) {
    if (typeof pageOrTitle === "string") {
      const exactTitle = pageOrTitle;
      await I.usePlaywrightTo(`edit ${exactTitle}`, async ({ page }) => {
        await postCardByTitle(page, exactTitle)
          .getByRole("button", { name: POST_TEXT.edit })
          .click();

        await editorCard(page)
          .locator('[data-slot="card-title"]')
          .getByText(POST_TEXT.editPostHeading, { exact: true })
          .waitFor({ state: "visible", timeout: 10000 });
      });
      return;
    }

    const page = pageOrTitle;
    const exactTitle = maybeTitle;
    if (!exactTitle) throw new Error("Missing exactTitle");

    await postCardByTitle(page, exactTitle)
      .getByRole("button", { name: POST_TEXT.edit })
      .click();

    await editorCard(page)
      .locator('[data-slot="card-title"]')
      .getByText(POST_TEXT.editPostHeading, { exact: true })
      .waitFor({ state: "visible", timeout: 10000 });
  },

  /**
   * Xóa bài — nhận dialog confirm. Phải gọi handleNextDialog trước khi click Delete.
   */
  async confirmDialogOnNextNavigation(page, fragment) {
    return handleNextDialog(page, fragment, "accept");
  },

  async dismissDialogOnNextNavigation(page) {
    return handleNextDialog(page, "", "dismiss");
  },

  /**
   * Validation: submit không được gửi POST create.
   */
  async expectCreateBlockedByClient(page, triggerFillAndSubmit) {
    await expectNoCreatePostRequest(page, triggerFillAndSubmit);
  },

  async waitForPatchStatusOk(page) {
    return waitForResponseMatching(
      page,
      (r) =>
        r.request().method() === "PATCH" &&
        r.url().includes("/api/v1/manager/posts/") &&
        r.url().includes("/status"),
      30000,
    );
  },

  async waitForDeleteOk(page) {
    return waitForResponseMatching(
      page,
      (r) =>
        r.request().method() === "DELETE" &&
        r.url().includes("/api/v1/manager/posts/"),
      30000,
    );
  },

  /**
   * Đọc giá trị số trên stat "Current page" (vd: "0 / 1").
   */
  /**
   * Overload:
   * - readCurrentPageStat()
   * - readCurrentPageStat(page)
   */
  async readCurrentPageStat(page) {
    if (page) {
      const label = page.getByText(POST_TEXT.currentPageLabel, { exact: true });
      const statTile = label.locator("..");
      const value = statTile.locator("div.text-2xl").first();
      return (await value.innerText()).trim();
    }

    return I.usePlaywrightTo("read current page stat", async ({ page }) => {
      const label = page.getByText(POST_TEXT.currentPageLabel, { exact: true });
      const statTile = label.locator("..");
      const value = statTile.locator("div.text-2xl").first();
      return (await value.innerText()).trim();
    });
  },

  /**
   * Logout — cùng pattern avatar với authflow.test.
   */
  async logoutFromNavbar() {
    await I.usePlaywrightTo("logout", async ({ page }) => {
      await page.locator('[class*="size-9"]').first().click();
      await page.getByText("Log out", { exact: true }).click();
    });

    I.waitInUrl("/sign-in", 10);
  },
};
