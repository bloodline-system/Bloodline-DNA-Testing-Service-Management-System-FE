import type { APIRequestContext } from '@playwright/test';

export const AUTH_CREDENTIALS = {
  username: 'manager2',
  password: 'manager2',
  rememberMe: true,
};

const rawApiBaseUrl = process.env.API_BASE_URL ?? 'http://localhost:8080';
export const apiBaseUrl = rawApiBaseUrl.endsWith('/api')
  ? rawApiBaseUrl
  : rawApiBaseUrl.replace(/\/+$/, '') + '/api';

export async function requestAuthToken(request: APIRequestContext) {
  const response = await request.post(`${apiBaseUrl}/v1/auth/login`, {
    data: AUTH_CREDENTIALS,
  });

  if (response.status() !== 200) {
    throw new Error(`Auth login failed with status ${response.status()}`);
  }

  const body = await response.json();
  if (body.code !== 200 || !body.data?.access_token) {
    throw new Error('Auth response missing access token or returned non-200 code');
  }

  return body.data.access_token as string;
}

export function generateUniqueName(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
