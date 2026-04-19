import { chromium, request } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';
import { AUTH_CREDENTIALS } from './auth.setup';

const STORAGE_STATE_PATH = path.resolve(process.cwd(), 'playwright/.auth/manager.json');
const rawApiBaseUrl = process.env.API_BASE_URL ?? 'http://localhost:5173';
const API_BASE_URL = rawApiBaseUrl.endsWith('/api')
  ? rawApiBaseUrl
  : rawApiBaseUrl.replace(/\/+$/, '') + '/api';
const APP_BASE_URL = process.env.BASE_URL ?? 'http://localhost:5173';

export default async () => {
  await fs.mkdir(path.dirname(STORAGE_STATE_PATH), { recursive: true });

  // Create a fake storage state for testing
  const fakeStorageState = {
    cookies: [],
    origins: [
      {
        origin: APP_BASE_URL,
        localStorage: [
          {
            name: 'auth-storage',
            value: JSON.stringify({
              accessToken: 'fake-token-for-testing',
              refreshToken: 'fake-refresh-token',
              userId: 1,
            }),
          },
        ],
      },
    ],
  };

  await fs.writeFile(STORAGE_STATE_PATH, JSON.stringify(fakeStorageState, null, 2));
};
