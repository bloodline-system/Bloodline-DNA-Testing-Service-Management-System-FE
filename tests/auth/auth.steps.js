/**
 * auth.steps.js — reusable auth steps (smoke) for CodeceptJS.
 *
 * IMPORTANT:
 * - We DO NOT remove existing implementation in tests/steps.js.
 * - This module re-exports it to avoid duplicated logic.
 */

import { steps } from "../steps.js";

/**
 * Auth steps (signup → OTP → login) implemented in tests/steps.js.
 * Re-exported here to match the required structure.
 */
export const authSteps = {
  ...steps,
};
