import { expect, test } from '@playwright/test';
import { authenticate, generateUniqueReportName, getBearerHeaders } from '../utils/api-helper';
import { apiBaseUrl } from '../setup/auth.setup';

test.describe('Report Create Endpoints', () => {
  let accessToken: string;

  test.beforeAll(async ({ request }) => {
    const auth = await authenticate(request);
    accessToken = auth.accessToken;
  });

  test('TC-RPT-CR-01: POST /v1/manager/reports creates a report with unique reportName', async ({ request }) => {
    const reportName = generateUniqueReportName('MonthlyRevenue');
    const start = Date.now();
    const response = await request.post(`${apiBaseUrl}/v1/manager/reports`, {
      headers: getBearerHeaders(accessToken),
      data: {
        reportName,
        reportType: 'MONTHLY_REVENUE',
        reportCategory: 'REVENUE',
        reportData: 'Sample report data for revenue analysis',
      },
    });
    const elapsed = Date.now() - start;

    expect(response.status(), 'Create report endpoint should return 200 or 201').toBeGreaterThanOrEqual(200);
    expect(response.status(), 'Create report endpoint should return 200 or 201').toBeLessThanOrEqual(201);
    expect(elapsed, 'Create report response time should be under 3000ms').toBeLessThan(3000);

    const body = await response.json();
    expect(body.code, 'Create report wrapper code should equal 200').toBe(200);
    expect(body.data.id, 'Created report id should exist').toBeTruthy();
    expect(typeof body.data.id, 'Created report id must be a number').toBe('number');
    expect(body.data.id, 'Created report id must be greater than 0').toBeGreaterThan(0);
  });

  test('TC-RPT-CR-02: POST /v1/manager/reports missing required fields returns error', async ({ request }) => {
    const response = await request.post(`${apiBaseUrl}/v1/manager/reports`, {
      headers: getBearerHeaders(accessToken),
      data: {
        reportType: 'MONTHLY_REVENUE',
        reportCategory: 'REVENUE',
      },
    });
    expect(response.status(), 'Missing required fields should not return 200').not.toBe(200);
    const body = await response.json();
    expect(body.message, 'Missing required fields should return validation message').toBeTruthy();
  });

  test('TC-RPT-CR-03: POST /v1/manager/reports duplicate reportName returns failure', async ({ request }) => {
    const reportName = generateUniqueReportName('DuplicateReport');
    const first = await request.post(`${apiBaseUrl}/v1/manager/reports`, {
      headers: getBearerHeaders(accessToken),
      data: {
        reportName,
        reportType: 'MONTHLY_REVENUE',
        reportCategory: 'REVENUE',
        reportData: 'First duplicate test',
      },
    });
    expect(first.status(), 'First report creation should succeed').toBeGreaterThanOrEqual(200);
    expect(first.status(), 'First report creation should succeed').toBeLessThanOrEqual(201);

    const second = await request.post(`${apiBaseUrl}/v1/manager/reports`, {
      headers: getBearerHeaders(accessToken),
      data: {
        reportName,
        reportType: 'MONTHLY_REVENUE',
        reportCategory: 'REVENUE',
        reportData: 'Second duplicate test',
      },
    });
    expect(second.status(), 'Duplicate report name should not create a second report').not.toBe(200);
    expect(second.status(), 'Duplicate report name should not create a second report').not.toBe(201);
    const body = await second.json();
    expect(body.message, 'Duplicate report creation should return an error message').toBeTruthy();
  });
});
