import type { PlaywrightTestConfig } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: PlaywrightTestConfig = {
  testDir: './tests',
  timeout: 120000,
  expect: {
    timeout: 10000,
  },
  retries: 1,
  // globalSetup: path.resolve(__dirname, './tests/setup/global-setup.ts'),
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:5173',
    storageState: path.resolve(__dirname, 'playwright/.auth/manager.json'),
    actionTimeout: 10000,
    navigationTimeout: 30000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
      },
    },
  ],
};

export default config;
