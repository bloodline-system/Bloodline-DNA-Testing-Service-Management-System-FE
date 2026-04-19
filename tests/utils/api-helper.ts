import type { APIRequestContext, APIResponse } from '@playwright/test';
import { AUTH_CREDENTIALS, apiBaseUrl } from '../setup/auth.setup';

export async function authenticate(request: APIRequestContext) {
  const response = await request.post(`${apiBaseUrl}/v1/auth/login`, {
    data: AUTH_CREDENTIALS,
  });
  const body = await response.json();

  if (response.status() !== 200 || body.code !== 200) {
    throw new Error(`Authentication failed: ${response.status()} ${JSON.stringify(body)}`);
  }

  return {
    accessToken: body.data.access_token as string,
    refreshToken: body.data.refresh_token as string,
  };
}

export function getBearerHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export function generateUniqueReportName(prefix = 'Report') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function expectWrapper(body: any) {
  return {
    hasWrapper: () => {
      return (
        body &&
        Object.prototype.hasOwnProperty.call(body, 'code') &&
        Object.prototype.hasOwnProperty.call(body, 'message') &&
        Object.prototype.hasOwnProperty.call(body, 'data') &&
        Object.prototype.hasOwnProperty.call(body, 'timestamp')
      );
    },
  };
}
