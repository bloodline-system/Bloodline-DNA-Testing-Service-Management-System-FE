/**
 * factory.js — Post Management test data factory.
 *
 * Thin wrapper around existing factory to avoid duplication.
 */

export {
  DEFAULT_CATEGORY,
  ALT_CATEGORY,
  buildPostTitle,
  buildUpdatedTitle,
  buildPostContent,
  buildPostPayload,
  uniqueSuffix,
} from "./post-management.factory.js";

/**
 * Convenience: suffix based purely on timestamp (as requested).
 * @returns {string}
 */
export function timestampSuffix() {
  return String(Date.now());
}
