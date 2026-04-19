import { expect, test } from '@playwright/test';
import { authenticate, getBearerHeaders } from '../utils/api-helper';
import { apiBaseUrl } from '../setup/auth.setup';

test.describe('Report Detail Endpoint', () => {
  let accessToken: string;

  test.beforeAll(async ({ request }) => {
    const auth = await authenticate(request);
    accessToken = auth.accessToken;
  });

  test('TC-RPT-DET-01: GET /v1/manager/reports/9999999 returns 404', async ({ request }) => {
    const response = await request.get(`${apiBaseUrl}/v1/manager/reports/9999999`, {
      headers: getBearerHeaders(accessToken),
    });

    expect(response.status(), 'Non-existing report detail should return 404').toBe(404);
    const body = await response.json();
    expect(body.code, 'Non-existing report detail should return wrapper code 404').toBe(404);
    expect(body.message, 'Non-existing report detail should return not found message').toBeTruthy();
  });
});
