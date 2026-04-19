import { setHeadlessWhen } from "@codeceptjs/configure";

setHeadlessWhen(process.env.HEADLESS);

/** Trùng FE dev — dùng cho helpers.Playwright.url và context baseURL (page.goto relative trong usePlaywrightTo). */
const FE_BASE_URL =
  process.env.E2E_BASE_URL ?? process.env.CODECEPT_URL ?? "http://localhost:5173";

export const config = {
  tests: "./tests/**/*.test.js",
  output: "./output",
  helpers: {
    Playwright: {
      url: FE_BASE_URL.replace(/\/$/, ""),
      show: true,
      browser: "chromium",
      waitForAction: 500,
      waitForNavigation: "networkidle0",
      // Playwright: baseURL để page.goto("/sign-in") hợp lệ trong mọi callback
      emulate: {
        baseURL: FE_BASE_URL.replace(/\/$/, ""),
      },
    },
    REST: {
      endpoint: "http://localhost:8080",
    },
  },
  include: {
    I: "./tests/steps.js",
  },
  bootstrap: null,
  mocha: {},
  name: "bloodline-dna-testing-fe",
  plugins: {
    screenshotOnFail: {
      enabled: true,
    },
    pauseOnFail: {
      enabled: false,
    },
  },
};
