/**
 * Steps đăng nhập tài khoản có role ADMIN hoặc MANAGER — dùng cho E2E UI cần quyền
 * (ví dụ /manager/posts, quản lý bài viết).
 *
 * Khác với tests/steps.js (sign-up + OTP + login user mới): file này chỉ điền form /sign-in
 * với user seed đã có sẵn trên môi trường test.
 *
 * Biến môi trường:
 * - MANAGER_USERNAME / MANAGER_PASSWORD (mặc định manager2 / manager2)
 * - ADMIN_USERNAME / ADMIN_PASSWORD (mặc định admin / admin123)
 *
 * Lưu ý kỹ thuật: nút submit phải dùng { name: "Login", exact: true } để không trùng
 * với "Login with GitHub" (Playwright strict mode).
 *
 * Base URL FE: mặc định http://localhost:5173 — override bằng E2E_BASE_URL hoặc CODECEPT_URL
 * (phải trùng helpers.Playwright.url trong codecept.conf.js). Cần thiết vì page.goto("/path")
 * trong usePlaywrightTo không có baseURL → lỗi "Cannot navigate to invalid URL".
 */

const I = actor();

/** Trùng helpers.Playwright.url trong codecept.conf.js — dùng khi gọi page.goto trực tiếp (Playwright cần URL tuyệt đối). */
const DEFAULT_E2E_BASE = "http://localhost:5173";

export function getE2eBaseUrl() {
  const raw =
    process.env.E2E_BASE_URL ?? process.env.CODECEPT_URL ?? DEFAULT_E2E_BASE;
  return String(raw).replace(/\/$/, "");
}

/** @param {string} path ví dụ "/sign-in" */
export function e2eAbsoluteUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${getE2eBaseUrl()}${p}`;
}

function isSignInUrl(urlString) {
  try {
    const p = new URL(urlString).pathname;
    return p === "/sign-in" || p.startsWith("/sign-in/");
  } catch {
    return false;
  }
}

/**
 * LoginForm: nút submit bị disabled khi !isDirty || !isValid (RHF + zod).
 * Phải chờ nút "Login" (không phải "Logging in...") thật sự enabled rồi mới click.
 *
 * @param {import('playwright').Page} page
 * @param {string} username
 * @param {string} password
 */
async function performOneLoginAttempt(page, username, password) {
  await page.goto(e2eAbsoluteUrl("/sign-in"));

  await page.locator("#username").fill(username);
  await page.locator("#password").fill(password);

  const loginForm = page
    .locator("form")
    .filter({ has: page.locator("#username") });

  await page.waitForFunction(
    () => {
      const forms = document.querySelectorAll("form");
      for (const form of forms) {
        if (!form.querySelector("#username")) continue;
        for (const b of form.querySelectorAll('button[type="submit"]')) {
          const t = (b.textContent || "").replace(/\s+/g, " ").trim();
          if (t === "Login" && !b.disabled) return true;
        }
      }
      return false;
    },
    { timeout: 20000 },
  );

  const loginWait = page.waitForResponse(
    (r) =>
      r.url().includes("/api/v1/auth/login") && r.request().method() === "POST",
    { timeout: 20000 },
  );

  await loginForm.getByRole("button", { name: "Login", exact: true }).click();

  const res = await loginWait.catch(() => null);

  // Login coi như OK khi:
  // 1) Có response 2xx/3xx từ /api/v1/auth/login
  // 2) URL rời khỏi /sign-in (app có thể redirect về "/" hoặc route khác, vd "/manager/posts")
  if (res && res.status() >= 200 && res.status() < 400) {
    await page
      .waitForURL(
        (url) => {
          try {
            const p = new URL(url).pathname;
            return p !== "/sign-in" && !p.startsWith("/sign-in/");
          } catch {
            return false;
          }
        },
        { timeout: 25000, waitUntil: "commit" },
      )
      .catch(() => {});
  }

  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(400);

  return {
    response: res,
    status: res ? res.status() : null,
    loggedIn: !isSignInUrl(page.url()),
    currentUrl: page.url(),
  };
}

/**
 * @param {"MANAGER"|"ADMIN"} [role]
 */
export function getManagementCredentials(role = "MANAGER") {
  if (role === "ADMIN") {
    return {
      username: process.env.ADMIN_USERNAME ?? "admin",
      password: process.env.ADMIN_PASSWORD ?? "admin123",
    };
  }
  return {
    username: process.env.MANAGER_USERNAME ?? "manager2",
    password: process.env.MANAGER_PASSWORD ?? "manager2",
  };
}

/** Alias rõ ràng cho test chỉ cần MANAGER */
export function getManagerCredentials() {
  return getManagementCredentials("MANAGER");
}

/** Alias cho test muốn đăng nhập bằng tài khoản admin seed */
export function getAdminCredentials() {
  return getManagementCredentials("ADMIN");
}

/**
 * Luồng đăng nhập chung: /sign-in → POST /api/v1/auth/login → chờ về homepage.
 * Retry nhẹ khi HTTP 5xx (backend tạm lỗi).
 *
 * @param {string} [username]
 * @param {string} [password]
 * @param {{ role?: "MANAGER"|"ADMIN" }} [options]
 */
async function loginAsManagementUser(username, password, options = {}) {
  const role = options.role ?? "MANAGER";
  const creds = getManagementCredentials(role);
  const user = username ?? creds.username;
  const pass = password ?? creds.password;

  await I.amOnPage("/sign-in");

  await I.usePlaywrightTo(
    "submit management login and wait API",
    async ({ page }) => {
      let lastStatus = null;
      let lastUrl = page.url();

      for (let attempt = 1; attempt <= 3; attempt += 1) {
        const result = await performOneLoginAttempt(page, user, pass);
        lastStatus = result.status;
        lastUrl = result.currentUrl;

        if (result.loggedIn) {
          return;
        }

        if (result.status && result.status >= 500 && attempt < 3) {
          await page.waitForTimeout(1500);
          continue;
        }

        break;
      }

      throw new Error(
        `Management login failed (role=${role}). HTTP=${lastStatus ?? "NO_RESPONSE"}, url=${lastUrl}`,
      );
    },
  );

  // Không dùng I.waitInUrl("/") — trong Codecept nó chỉ kiểm tra chuỗi "/" có trong URL (mọi http URL đều pass).
  // Sau login app có thể redirect về "/" hoặc route khác (vd "/manager/posts"), nên chỉ cần chắc chắn đã rời "/sign-in".
  await I.usePlaywrightTo(
    "wait authenticated after management login",
    async ({ page }) => {
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
}

export const managementAuthSteps = {
  loginAsManagementUser,

  /**
   * Đăng nhập user seed MANAGER (mặc định manager2).
   */
  async loginAsManager(username, password) {
    await loginAsManagementUser(username, password, { role: "MANAGER" });
  },

  /**
   * Đăng nhập user seed ADMIN (env ADMIN_* hoặc fallback như getManagementCredentials).
   */
  async loginAsAdmin(username, password) {
    await loginAsManagementUser(username, password, { role: "ADMIN" });
  },
};
