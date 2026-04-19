import { setHeadlessWhen } from "@codeceptjs/configure";

setHeadlessWhen(process.env.HEADLESS);

const baseUrl =
  process.env.E2E_BASE_URL ||
  process.env.BASE_URL ||
  process.env.PLAYWRIGHT_BASE_URL ||
  "http://localhost:5173";

export const config = {
  tests: "./tests/**/*.test.js",
  output: "./output",
  helpers: {
    Playwright: {
      url: baseUrl,
      show: true,
      browser: "chromium",
      waitForAction: 500,
      waitForNavigation: "networkidle0",
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
