import { expect, test } from '@playwright/test';
import { authenticate, getBearerHeaders } from '../utils/api-helper';
import { apiBaseUrl } from '../setup/auth.setup';

test.describe('Order New Endpoints', () => {
  let accessToken: string;

  test.beforeAll(async ({ request }) => {
    const auth = await authenticate(request);
    accessToken = auth.accessToken;
  });

  test('TC-ORD-NEW-01: GET /v1/manager/orders/new returns new orders and staff list', async ({ request }) => {
    const start = Date.now();
    const response = await request.get(`${apiBaseUrl}/v1/manager/orders/new`, {
      headers: getBearerHeaders(accessToken),
    });
    const elapsed = Date.now() - start;

    expect(response.status(), 'GET /orders/new HTTP status should be 200').toBe(200);
    expect(elapsed, 'GET /orders/new response time should be under 2000ms').toBeLessThan(2000);

    const body = await response.json();
    expect(body.code, 'GET /orders/new wrapper code should equal 200').toBe(200);
    expect(body.data, 'GET /orders/new data object must exist').toBeTruthy();
    expect(Array.isArray(body.data.orders), 'GET /orders/new should return orders array').toBe(true);
    expect(Array.isArray(body.data.availableStaff), 'GET /orders/new should return availableStaff array').toBe(true);

    if (body.data.orders.length > 0) {
      for (const order of body.data.orders) {
        expect(typeof order.id, 'New order id must be a number').toBe('number');
        expect(order.id, 'New order id must be greater than zero').toBeGreaterThan(0);
        expect(typeof order.orderStatus, 'New order status must be a string').toBe('string');
        expect(order.orderStatus.length, 'New order status cannot be empty').toBeGreaterThan(0);
      }
    }
  });

  test('TC-ORD-NEW-02: GET /v1/manager/orders/new with invalid token returns unauthorized', async ({ request }) => {
    const response = await request.get(`${apiBaseUrl}/v1/manager/orders/new`, {
      headers: getBearerHeaders('invalid-token'),
    });

    expect(response.status(), 'Invalid token should return non-200 status').not.toBe(200);
    const body = await response.json();
    expect(body.message, 'Unauthorized response should include an error message').toBeTruthy();
  });
});
