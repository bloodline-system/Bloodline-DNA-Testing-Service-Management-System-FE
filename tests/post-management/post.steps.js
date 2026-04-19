/**
 * post.steps.js — Post Management reusable custom steps.
 *
 * Wrapper around the existing implementation in post-management.steps.js.
 * This keeps backwards compatibility while satisfying the required file list.
 */

export {
  E2E_FEATURED_IMAGE,
  postCardByTitle,
  getAdminCredentials,
  getManagementCredentials,
  getManagerCredentials,
  postManagementSteps as postSteps,
} from "./post-management.steps.js";
