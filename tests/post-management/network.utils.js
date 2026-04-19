/**
 * Tiện ích chờ response / chặn request create — giảm flaky so với I.wait cố định.
 */

/**
 * @param {import('playwright').Request | import('playwright').Response} reqOrRes
 */
function getMethod(reqOrRes) {
  if (typeof reqOrRes.method === "function") return reqOrRes.method();
  if (typeof reqOrRes.method === "string") return reqOrRes.method;
  if (typeof reqOrRes.request === "function") {
    const req = reqOrRes.request();
    if (req && typeof req.method === "function") return req.method();
    if (req && typeof req.method === "string") return req.method;
  }
  return undefined;
}

/**
 * @param {import('playwright').Request | import('playwright').Response} reqOrRes
 */
function getUrl(reqOrRes) {
  if (typeof reqOrRes.url === "function") return reqOrRes.url();
  if (typeof reqOrRes.url === "string") return reqOrRes.url;
  if (typeof reqOrRes.request === "function") {
    const req = reqOrRes.request();
    if (req && typeof req.url === "function") return req.url();
    if (req && typeof req.url === "string") return req.url;
  }
  return "";
}

/** POST tạo bài: /api/v1/manager/posts (không có /id) */
export function isManagerPostsCreateRequest(request) {
  const url = getUrl(request);
  return (
    getMethod(request) === "POST" &&
    /\/api\/v1\/manager\/posts(\?|$)/.test(url) &&
    !/\/manager\/posts\/\d+/.test(url)
  );
}

export function isManagerPostsListRequest(request) {
  const url = getUrl(request);
  return (
    getMethod(request) === "GET" &&
    url.includes("/api/v1/manager/posts") &&
    !/\/manager\/posts\/\d+/.test(url)
  );
}

/**
 * Chạy action và đảm bảo không có request POST tạo post.
 * Dùng khi client return sớm (title/content rỗng sau trim).
 * @param {import('playwright').Page} page
 * @param {() => Promise<void>} triggerAsync
 */
export async function expectNoCreatePostRequest(page, triggerAsync) {
  /** @type {import('playwright').Request[]} */
  const hits = [];
  const listener = (req) => {
    if (isManagerPostsCreateRequest(req)) hits.push(req);
  };
  page.on("request", listener);
  try {
    await triggerAsync();
    await page.waitForTimeout(400);
  } finally {
    page.off("request", listener);
  }
  if (hits.length > 0) {
    throw new Error(
      `Không mong đợi POST tạo post nhưng có ${hits.length} request`,
    );
  }
}

/**
 * @param {import('playwright').Page} page
 * @param {(r: import('playwright').Response) => boolean} predicate
 * @param {number} [timeout]
 */
export async function waitForResponseMatching(
  page,
  predicate,
  timeout = 30000,
) {
  return page.waitForResponse(predicate, { timeout });
}

/**
 * @param {import('playwright').Page} page
 * @param {string} dialogMessageFragment
 * @param {'accept'|'dismiss'} action
 */
export async function handleNextDialog(page, dialogMessageFragment, action) {
  const dialogPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Không thấy window.confirm kịp thời"));
    }, 10000);
    page.once("dialog", (dialog) => {
      clearTimeout(timeout);
      if (
        dialogMessageFragment &&
        !dialog.message().includes(dialogMessageFragment)
      ) {
        void dialog.dismiss().catch(() => {});
        reject(
          new Error(
            `Dialog message không khớp: ${dialog.message().slice(0, 120)}`,
          ),
        );
        return;
      }
      if (action === "accept") {
        void dialog.accept().then(resolve).catch(reject);
      } else {
        void dialog.dismiss().then(resolve).catch(reject);
      }
    });
  });
  return dialogPromise;
}
