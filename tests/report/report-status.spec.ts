import { expect, test } from '@playwright/test';
import { authenticate, generateUniqueReportName, getBearerHeaders } from '../utils/api-helper';
import { apiBaseUrl } from '../setup/auth.setup';

test.describe('Report Status Update Endpoint', () => {
  let accessToken: string;
  let reportId: number;

  test.beforeAll(async ({ request }) => {
    const auth = await authenticate(request);
    accessToken = auth.accessToken;
    const createResponse = await request.post(`${apiBaseUrl}/v1/manager/reports`, {
      headers: getBearerHeaders(accessToken),
      data: {
        reportName: generateUniqueReportName('StatusReport'),
        reportType: 'MONTHLY_REVENUE',
        reportCategory: 'REVENUE',
        reportData: 'Status update test data',
      },
    });
    const createBody = await createResponse.json();
    reportId = createBody.data.id;
  });

  test('TC-RPT-STS-01: PATCH /v1/manager/reports/9999999/status returns 404', async ({ request }) => {
    const response = await request.patch(`${apiBaseUrl}/v1/manager/reports/9999999/status`, {
      headers: getBearerHeaders(accessToken),
      data: { status: 'APPROVED' },
    });
    expect(response.status(), 'Updating status for non-existing report should return 404').toBe(404);
    const body = await response.json();
    expect(body.code, 'Non-existing status update should return wrapper code 404').toBe(404);
  });

  test('TC-RPT-STS-02: PATCH /v1/manager/reports/{{report_id}}/status approves report successfully', async ({ request }) => {
    const response = await request.patch(`${apiBaseUrl}/v1/manager/reports/${reportId}/status`, {
      headers: getBearerHeaders(accessToken),
      data: { status: 'APPROVED' },
    });
    expect(response.status(), 'Status approve request should return 200').toBe(200);
    const body = await response.json();
    expect(body.code, 'Status approve wrapper code should equal 200').toBe(200);
    expect(body.data.reportStatus, 'Report status should be updated to APPROVED').toBe('APPROVED');
  });

  test('TC-RPT-STS-03: PATCH /v1/manager/reports/{{report_id}}/status invalid status returns 400', async ({ request }) => {
    const response = await request.patch(`${apiBaseUrl}/v1/manager/reports/${reportId}/status`, {
      headers: getBearerHeaders(accessToken),
      data: { status: 'INVALID_STATUS' },
    });
    expect(response.status(), 'Invalid status update should not return 200').not.toBe(200);
    const body = await response.json();
    expect(body.message, 'Invalid status update should return validation message').toBeTruthy();
  });
});
