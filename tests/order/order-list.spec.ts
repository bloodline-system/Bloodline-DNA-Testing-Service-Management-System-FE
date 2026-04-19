import { expect, test } from '@playwright/test';
import { authenticate, getBearerHeaders } from '../utils/api-helper';
import { apiBaseUrl } from '../setup/auth.setup';

test.describe('Order Management API', () => {
  let accessToken: string;
  let storedOrderId: number | null = null;

  test.beforeAll(async ({ request }) => {
    const auth = await authenticate(request);
    accessToken = auth.accessToken;
  });

  test('TC-ORD-01: GET /v1/manager/orders returns valid order list structure', async ({ request }) => {
    const start = Date.now();
    const response = await request.get(`${apiBaseUrl}/v1/manager/orders`, {
      headers: getBearerHeaders(accessToken),
    });
    const elapsed = Date.now() - start;

    expect(response.status(), 'Order list HTTP status must be 200').toBe(200);
    expect(elapsed, 'Order list response time should be under 2000ms').toBeLessThan(2000);

    const body = await response.json();
    expect(body.code, 'Order list payload code should equal 200').toBe(200);
    expect(body.message, 'Order list payload must have a message').toBeTruthy();
    expect(body.timestamp, 'Order list payload must include a timestamp').toBeTruthy();
    expect(body.data, 'Order list payload must include data object').toBeTruthy();
    expect(Array.isArray(body.data.orders), 'Orders must be an array').toBe(true);
    expect(typeof body.data.statusCounts, 'statusCounts must be object').toBe('object');
    expect(body.data.totalOrders, 'totalOrders should be a number').toBeGreaterThanOrEqual(0);
    expect(body.data.pageTitle, 'pageTitle should be Order Management').toBe('Order Management');
    expect(body.data.totalOrders, 'totalOrders should match orders array length').toBe(body.data.orders.length);

    if (body.data.orders.length > 0) {
      storedOrderId = body.data.orders[0].id;
    }
  });

  test('TC-ORD-02: GET /v1/manager/orders verifies order object schema and saves order_id', async ({ request }) => {
    const response = await request.get(`${apiBaseUrl}/v1/manager/orders`, {
      headers: getBearerHeaders(accessToken),
    });
    expect(response.status(), 'Order list HTTP status must be 200').toBe(200);

    const body = await response.json();
    if (body.data.orders.length > 0) {
      const order = body.data.orders[0];
      expect(typeof order.id, 'Order id must be a number').toBe('number');
      expect(order.id, 'Order id must be greater than 0').toBeGreaterThan(0);
      expect(typeof order.orderStatus, 'Order status must be a string').toBe('string');
      expect(order.orderStatus.length, 'Order status must not be empty').toBeGreaterThan(0);
      storedOrderId = order.id;
    }
  });

  test('TC-ORD-03: GET /v1/manager/orders verifies statusCounts integrity', async ({ request }) => {
    const response = await request.get(`${apiBaseUrl}/v1/manager/orders`, {
      headers: getBearerHeaders(accessToken),
    });
    expect(response.status(), 'Order list HTTP status must be 200').toBe(200);

    const body = await response.json();
    const statusCounts = body.data.statusCounts;
    const totalOrders = body.data.totalOrders;
    const sumCounts = Object.values(statusCounts).reduce((sum: number, current: number) => sum + current, 0);
    expect(sumCounts, 'Sum of statusCounts should equal totalOrders').toBe(totalOrders);
  });

  test('TC-ORD-04: GET /v1/manager/orders/{id} returns valid order details', async ({ request }) => {
    expect(storedOrderId, 'A valid order_id must be available from earlier order list tests').toBeTruthy();

    const response = await request.get(`${apiBaseUrl}/v1/manager/orders/${storedOrderId}`, {
      headers: getBearerHeaders(accessToken),
    });
    expect(response.status(), 'Order detail HTTP status should be 200').toBe(200);

    const body = await response.json();
    expect(body.code, 'Order detail wrapper code should equal 200').toBe(200);
    expect(body.data.id, 'Order detail id should match requested id').toBe(storedOrderId);
    expect(body.data.orderStatus, 'Order detail should contain orderStatus').toBeTruthy();
  });

  test('TC-ORD-05: GET /v1/manager/orders/9999999 returns error for missing order', async ({ request }) => {
    const response = await request.get(`${apiBaseUrl}/v1/manager/orders/9999999`, {
      headers: getBearerHeaders(accessToken),
    });

    expect(response.status(), 'Non-existing order should return a non-200 status').not.toBe(200);
    const body = await response.json();
    expect(body.message, 'Non-existing order response must include an error message').toBeTruthy();
  });
});
