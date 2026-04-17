import { setHeadlessWhen } from "@codeceptjs/configure";

setHeadlessWhen(process.env.HEADLESS);

export const config = {
  tests: "./tests/**/*.test.js",
  output: "./output",
  helpers: {
    Playwright: {
      url: "http://localhost:5174",
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
