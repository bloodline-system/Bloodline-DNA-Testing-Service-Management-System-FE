/**
 * waitForResponse.js — centralized Playwright network wait helpers.
 */

/**
 * @param {import('playwright').Page} page
 * @param {(r: import('playwright').Response) => boolean} predicate
 * @param {number} [timeoutMs]
 */
export async function waitForResponse(page, predicate, timeoutMs = 30000) {
  return page.waitForResponse(predicate, { timeout: timeoutMs });
}

/**
 * Waits for a request matching predicate (useful for asserting query params).
 * @param {import('playwright').Page} page
 * @param {(req: import('playwright').Request) => boolean} predicate
 * @param {number} [timeoutMs]
 */
export async function waitForRequest(page, predicate, timeoutMs = 30000) {
  return page.waitForRequest(predicate, { timeout: timeoutMs });
}
