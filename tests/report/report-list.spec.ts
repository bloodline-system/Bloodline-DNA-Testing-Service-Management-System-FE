import { expect, test } from '@playwright/test';
import { authenticate, getBearerHeaders } from '../utils/api-helper';
import { apiBaseUrl } from '../setup/auth.setup';

test.describe('Report Management API', () => {
  let accessToken: string;

  test.beforeAll(async ({ request }) => {
    const auth = await authenticate(request);
    accessToken = auth.accessToken;
  });

  test('TC-REP-01: GET /v1/manager/reports returns valid paginated list', async ({ request }) => {
    const response = await request.get(`${apiBaseUrl}/v1/manager/reports`, {
      headers: getBearerHeaders(accessToken),
    });

    expect(response.status(), 'Reports list HTTP status should be 200').toBe(200);
    const body = await response.json();
    expect(body.code, 'Reports list payload code should equal 200').toBe(200);
    expect(Array.isArray(body.data.content), 'Reports content must be an array').toBe(true);
    expect(typeof body.data.pageNumber, 'pageNumber must be a number').toBe('number');
    expect(typeof body.data.pageSize, 'pageSize must be a number').toBe('number');
    expect(typeof body.data.totalElements, 'totalElements must be a number').toBe('number');
    expect(typeof body.data.totalPages, 'totalPages must be a number').toBe('number');
  });

  test('TC-REP-02: GET /v1/manager/reports filters by status and role correctly', async ({ request }) => {
    const response = await request.get(
      `${apiBaseUrl}/v1/manager/reports?page=0&size=10&status=PENDING&generatedByRole=all&search=&sortBy=createdAt&sortDir=desc`,
      { headers: getBearerHeaders(accessToken) },
    );

    expect(response.status(), 'Filtered reports list must respond with 200').toBe(200);
    const body = await response.json();
    expect(body.code, 'Filtered reports payload code should equal 200').toBe(200);
    expect(Array.isArray(body.data.content), 'Filtered reports content must be an array').toBe(true);
  });

  test('TC-REP-03: GET /v1/manager/reports filters by generatedByRole', async ({ request }) => {
    const response = await request.get(
      `${apiBaseUrl}/v1/manager/reports?page=0&size=10&status=all&generatedByRole=ANALYST&search=&sortBy=createdAt&sortDir=desc`,
      { headers: getBearerHeaders(accessToken) },
    );

    expect(response.status(), 'Role-filtered reports list must respond with 200').toBe(200);
    const body = await response.json();
    expect(body.code, 'Role filter payload code should equal 200').toBe(200);
  });

  test('TC-REP-04: GET /v1/manager/reports respects requested page size', async ({ request }) => {
    const response = await request.get(
      `${apiBaseUrl}/v1/manager/reports?page=0&size=5&status=all&generatedByRole=all&search=&sortBy=createdAt&sortDir=desc`,
      { headers: getBearerHeaders(accessToken) },
    );

    expect(response.status(), 'Reports page size request should return 200').toBe(200);
    const body = await response.json();
    expect(body.code, 'Page size response code should equal 200').toBe(200);
    expect(body.data.content.length, 'Report page size should not exceed requested size').toBeLessThanOrEqual(5);
  });

  test('TC-REP-05: GET /v1/manager/reports search returns no results for random string', async ({ request }) => {
    const searchQuery = `no-results-${Date.now()}`;
    const response = await request.get(
      `${apiBaseUrl}/v1/manager/reports?page=0&size=5&status=all&generatedByRole=all&search=${searchQuery}&sortBy=createdAt&sortDir=desc`,
      { headers: getBearerHeaders(accessToken) },
    );

    expect(response.status(), 'Search endpoint should return 200 even for no results').toBe(200);
    const body = await response.json();
    expect(body.code, 'Search response code should equal 200').toBe(200);
    expect(body.data.content.length, 'Search for random string should return zero results').toBe(0);
  });

  test('TC-REP-06: GET /v1/manager/reports with invalid token returns unauthorized', async ({ request }) => {
    const response = await request.get(`${apiBaseUrl}/v1/manager/reports`, {
      headers: getBearerHeaders('invalid-token'),
    });

    expect(response.status(), 'Invalid token for reports list should not return 200').not.toBe(200);
    const body = await response.json();
    expect(body.message, 'Invalid token failure should include error message').toBeTruthy();
  });
});
