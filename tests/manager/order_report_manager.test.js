import assert from "node:assert";

Feature("Manager Order and Report API Flow");

const managerLoginPayload = {
  username: "manager2",
  password: "manager2",
  rememberMe: true,
};

const authState = {
  accessToken: null,
  refreshToken: null,
  expiresIn: null,
};

let orderId = null;
let orderStatusToUpdate = null;
let reportId = null;
let createdReportId = null;
let duplicateReportId = null;
let createdReportName = null;

function buildAuthHeaders() {
  if (!authState.accessToken) {
    return {};
  }
  return {
    Authorization: `Bearer ${authState.accessToken}`,
  };
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function assertStandardResponse(resp, expectedCode = null) {
  assert.ok(isObject(resp), "response must be an object");
  assert.ok(
    Object.prototype.hasOwnProperty.call(resp, "code"),
    "response must include code",
  );
  assert.ok(
    Object.prototype.hasOwnProperty.call(resp, "message"),
    "response must include message",
  );
  assert.ok(
    Object.prototype.hasOwnProperty.call(resp, "data"),
    "response must include data",
  );
  assert.ok(
    Object.prototype.hasOwnProperty.call(resp, "timestamp"),
    "response must include timestamp",
  );
  if (expectedCode !== null) {
    assert.strictEqual(resp.code, expectedCode, `expected code ${expectedCode}`);
  }
  assert.strictEqual(
    typeof resp.message,
    "string",
    "response.message must be a string",
  );
}

async function loginAsManager(I) {
  const start = Date.now();
  const response = await I.sendPostRequest("/api/v1/auth/login", managerLoginPayload);
  const duration = Date.now() - start;

  assert.strictEqual(response.status, 200, "Login HTTP status should be 200");
  assert.ok(response.data, "Login response data must exist");
  assertStandardResponse(response.data, 200);
  assert.ok(response.data.data.access_token, "access_token must be returned");
  assert.ok(response.data.data.refresh_token, "refresh_token must be returned");
  assert.ok(typeof response.data.data.expires_in === "number");
  assert.ok(duration < 2000, `Login response time should be < 2000ms, got ${duration}`);

  authState.accessToken = response.data.data.access_token;
  authState.refreshToken = response.data.data.refresh_token;
  authState.expiresIn = response.data.data.expires_in;
}

async function measureRequest(requestFn) {
  const start = Date.now();
  const response = await requestFn();
  const time = Date.now() - start;
  return { response, time };
}

Before(async ({ I }) => {
  if (!authState.accessToken) {
    await loginAsManager(I);
  }
});

AfterSuite(async ({ I }) => {
  const headers = buildAuthHeaders();
  const teardownIds = [duplicateReportId, createdReportId].filter(Boolean);
  for (const id of teardownIds) {
    try {
      await I.sendDeleteRequest(`/api/v1/manager/reports/${id}`, headers);
    } catch {
      // ignore cleanup failures
    }
  }
});

Scenario("Order Management full flow for Manager role", async ({ I }) => {
  const headers = buildAuthHeaders();

  // TC-ORD-001: GET All Orders
  const allOrdersResult = await measureRequest(() =>
    I.sendGetRequest("/api/v1/manager/orders", headers),
  );
  assert.strictEqual(allOrdersResult.response.status, 200);
  assert.ok(allOrdersResult.time < 2000, `Orders list response time should be < 2000ms, got ${allOrdersResult.time}`);

  const ordersPayload = allOrdersResult.response.data;
  assertStandardResponse(ordersPayload, 200);
  assert.ok(Array.isArray(ordersPayload.data.orders), "orders must be an array");
  assert.ok(isObject(ordersPayload.data.statusCounts), "statusCounts must be an object");
  assert.ok(
    typeof ordersPayload.data.totalOrders === "number" && ordersPayload.data.totalOrders >= 0,
    "totalOrders must be a number >= 0",
  );
  assert.strictEqual(
    ordersPayload.data.totalOrders,
    ordersPayload.data.orders.length,
    "totalOrders must equal orders.length",
  );
  assert.strictEqual(ordersPayload.data.pageTitle, "Order Management");

  if (ordersPayload.data.orders.length > 0) {
    const firstOrder = ordersPayload.data.orders[0];
    assert.ok(typeof firstOrder.id === "number" && firstOrder.id > 0, "order.id must be a positive number");
    assert.ok(typeof firstOrder.orderStatus === "string", "orderStatus must be a string");
    orderId = firstOrder.id;
    orderStatusToUpdate = firstOrder.orderStatus;
  } else {
    throw new Error("No manager orders exist to continue the Order Management flow");
  }

  // TC-ORD-004: GET Order By ID
  const orderByIdResult = await measureRequest(() =>
    I.sendGetRequest(`/api/v1/manager/orders/${orderId}`, headers),
  );
  assert.strictEqual(orderByIdResult.response.status, 200);
  assert.ok(orderByIdResult.time < 2000, `Order detail response time should be < 2000ms, got ${orderByIdResult.time}`);

  const orderDetailPayload = orderByIdResult.response.data;
  assertStandardResponse(orderDetailPayload, 200);
  assert.strictEqual(orderDetailPayload.data.id, orderId);
  assert.ok(typeof orderDetailPayload.data.orderStatus === "string");

  // TC-ORD-007: PATCH Update Order Status
  const allowedStatuses = ["PENDING", "NEW", "IN_PROGRESS"];
  const targetStatus = allowedStatuses.includes(orderStatusToUpdate)
    ? "IN_PROGRESS"
    : "IN_PROGRESS";

  const patchStatusResult = await measureRequest(() =>
    I.sendPatchRequest(
      `/api/v1/manager/orders/${orderId}/status`,
      { status: targetStatus },
      headers,
    ),
  );
  assert.strictEqual(patchStatusResult.response.status, 200);
  assert.ok(patchStatusResult.time < 2000, `Order status update response time should be < 2000ms, got ${patchStatusResult.time}`);
  assertStandardResponse(patchStatusResult.response.data, 200);
  assert.strictEqual(patchStatusResult.response.data.data.id, orderId);
  assert.strictEqual(patchStatusResult.response.data.data.orderStatus, targetStatus);

  // TC-ORD-009: PATCH Assign Staff to Order
  const assignStaffResult = await measureRequest(() =>
    I.sendPatchRequest(
      `/api/v1/manager/orders/${orderId}/assign-staff`,
      {
        collectStaffId: "staff-1",
        analysisStaffId: "staff-2",
      },
      headers,
    ),
  );
  assert.ok([200, 201].includes(assignStaffResult.response.status));
  assertStandardResponse(assignStaffResult.response.data);
  assert.ok(assignStaffResult.response.data.data !== undefined, "assign-staff should return data");

  // Verify status after assignment and status update
  const orderAfterAssign = await measureRequest(() =>
    I.sendGetRequest(`/api/v1/manager/orders/${orderId}`, headers),
  );
  assert.strictEqual(orderAfterAssign.response.status, 200);
  assert.ok(orderAfterAssign.time < 2000);
  assertStandardResponse(orderAfterAssign.response.data, 200);
  assert.strictEqual(orderAfterAssign.response.data.data.orderStatus, targetStatus);
});

Scenario("Report Management full CRUD flow for Manager role", async ({ I }) => {
  const headers = buildAuthHeaders();

  // TC-RPT-001: GET All Reports default
  const allReportsResult = await measureRequest(() =>
    I.sendGetRequest(
      "/api/v1/manager/reports?page=0&size=20&status=all&generatedByRole=all&search=&sortBy=createdAt&sortDir=desc",
      headers,
    ),
  );
  assert.strictEqual(allReportsResult.response.status, 200);
  assert.ok(allReportsResult.time < 2000);
  assertStandardResponse(allReportsResult.response.data, 200);

  const reportsData = allReportsResult.response.data.data;
  assert.ok(Array.isArray(reportsData.reports));
  assert.strictEqual(reportsData.currentPage, 0);
  assert.ok(typeof reportsData.totalPages === "number" && reportsData.totalPages >= 0);
  assert.ok(typeof reportsData.totalReports === "number" && reportsData.totalReports >= 0);
  assert.strictEqual(reportsData.pageSize, 20);
  assert.ok(isObject(reportsData.stats), "stats must be an object");

  if (reportsData.reports.length > 0) {
    const firstReport = reportsData.reports[0];
    assert.ok(typeof firstReport.id === "number");
    assert.ok(typeof firstReport.reportName === "string");
    assert.ok(typeof firstReport.reportStatus === "string");
    reportId = firstReport.id;
  }

  if (reportId) {
    const reportByIdResult = await measureRequest(() =>
      I.sendGetRequest(`/api/v1/manager/reports/${reportId}`, headers),
    );
    assert.strictEqual(reportByIdResult.response.status, 200);
    assert.ok(reportByIdResult.time < 2000);
    assertStandardResponse(reportByIdResult.response.data, 200);
    assert.strictEqual(reportByIdResult.response.data.data.id, reportId);
    assert.ok(reportByIdResult.response.data.data.reportName.length > 0);
    assert.ok(
      ["PENDING", "APPROVED", "REJECTED"].includes(
        reportByIdResult.response.data.data.reportStatus,
      ),
    );
  }

  // TC-RPT-009: POST Create Report
  const now = Date.now();
  const uniqueSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  createdReportName = `Report_${uniqueSuffix}_${now}`;
  const createReportPayload = {
    reportName: createdReportName,
    reportType: "MONTHLY_REVENUE",
    reportCategory: "REVENUE",
    reportData: "Sample report data for revenue analysis",
  };

  const createReportResult = await measureRequest(() =>
    I.sendPostRequest("/api/v1/manager/reports", createReportPayload, headers),
  );
  assert.ok([200, 201].includes(createReportResult.response.status));
  assert.ok(createReportResult.time < 3000);
  assertStandardResponse(createReportResult.response.data);
  assert.ok(createReportResult.response.data.data.id > 0);
  assert.strictEqual(createReportResult.response.data.data.reportName, createdReportName);
  assert.strictEqual(createReportResult.response.data.data.reportType, "MONTHLY_REVENUE");
  assert.strictEqual(createReportResult.response.data.data.reportStatus, "PENDING");
  createdReportId = createReportResult.response.data.data.id;

  const createdReportGetResult = await measureRequest(() =>
    I.sendGetRequest(`/api/v1/manager/reports/${createdReportId}`, headers),
  );
  assert.strictEqual(createdReportGetResult.response.status, 200);
  assert.ok(createdReportGetResult.time < 2000);
  assertStandardResponse(createdReportGetResult.response.data, 200);
  assert.strictEqual(createdReportGetResult.response.data.data.id, createdReportId);
  assert.strictEqual(createdReportGetResult.response.data.data.reportStatus, "PENDING");

  const approveResult = await measureRequest(() =>
    I.sendPatchRequest(
      `/api/v1/manager/reports/${createdReportId}/status`,
      { status: "APPROVED" },
      headers,
    ),
  );
  assert.strictEqual(approveResult.response.status, 200);
  assertStandardResponse(approveResult.response.data, 200);
  assert.strictEqual(approveResult.response.data.data.reportStatus, "APPROVED");
  assert.strictEqual(approveResult.response.data.data.id, createdReportId);

  const approvedGetResult = await measureRequest(() =>
    I.sendGetRequest(`/api/v1/manager/reports/${createdReportId}`, headers),
  );
  assert.strictEqual(approvedGetResult.response.status, 200);
  assertStandardResponse(approvedGetResult.response.data, 200);
  assert.strictEqual(approvedGetResult.response.data.data.reportStatus, "APPROVED");

  const approvedListResult = await measureRequest(() =>
    I.sendGetRequest(
      "/api/v1/manager/reports?page=0&size=20&status=APPROVED&generatedByRole=all&search=&sortBy=createdAt&sortDir=desc",
      headers,
    ),
  );
  assert.strictEqual(approvedListResult.response.status, 200);
  assertStandardResponse(approvedListResult.response.data, 200);
  const approvedReports = approvedListResult.response.data.data.reports;
  assert.ok(Array.isArray(approvedReports));
  assert.ok(
    approvedReports.every((item) => item.reportStatus === "APPROVED"),
    "Every returned report must have APPROVED status",
  );
  const foundApproved = approvedReports.some((item) => item.id === createdReportId);
  assert.ok(
    foundApproved,
    "Created report should appear in the APPROVED reports list",
  );

  const rejectResult = await measureRequest(() =>
    I.sendPatchRequest(
      `/api/v1/manager/reports/${createdReportId}/status`,
      { status: "REJECTED" },
      headers,
    ),
  );
  assert.strictEqual(rejectResult.response.status, 200);
  assertStandardResponse(rejectResult.response.data, 200);
  assert.strictEqual(rejectResult.response.data.data.reportStatus, "REJECTED");

  const deleteResult = await measureRequest(() =>
    I.sendDeleteRequest(`/api/v1/manager/reports/${createdReportId}`, headers),
  );
  assert.ok([200, 204].includes(deleteResult.response.status));
  if (deleteResult.response.status === 200) {
    assert.ok(
      typeof deleteResult.response.data.message === "string" &&
        deleteResult.response.data.message.length > 0,
      "Delete response message must be present for HTTP 200",
    );
  }

  const afterDeleteResult = await measureRequest(() =>
    I.sendGetRequest(`/api/v1/manager/reports/${createdReportId}`, headers),
  );
  assert.ok([404, 500].includes(afterDeleteResult.response.status));
});

Scenario("Error and edge case coverage for Order and Report endpoints", async ({ I }) => {
  const headers = buildAuthHeaders();

  const noAuthOrders = await measureRequest(() => I.sendGetRequest("/api/v1/manager/orders"));
  assert.ok([401, 403].includes(noAuthOrders.response.status));
  assert.ok(noAuthOrders.response.data.message, "Unauthorized response must include message");

  const noAuthReports = await measureRequest(() => I.sendGetRequest("/api/v1/manager/reports?page=0&size=20&status=all&generatedByRole=all&search=&sortBy=createdAt&sortDir=desc"));
  assert.ok([401, 403].includes(noAuthReports.response.status));
  assert.ok(noAuthReports.response.data.message, "Unauthorized reports response must include message");

  const missingOrderResult = await measureRequest(() =>
    I.sendGetRequest("/api/v1/manager/orders/9999999", headers),
  );
  assert.strictEqual(missingOrderResult.response.status, 404);
  assert.ok(missingOrderResult.response.data.message);

  const missingReportResult = await measureRequest(() =>
    I.sendGetRequest("/api/v1/manager/reports/9999999", headers),
  );
  assert.ok([404, 500].includes(missingReportResult.response.status));
  assert.ok(missingReportResult.response.data.message);

  const invalidOrderIdResult = await measureRequest(() =>
    I.sendGetRequest("/api/v1/manager/orders/abc", headers),
  );
  assert.ok([400, 404, 422].includes(invalidOrderIdResult.response.status));
  assert.ok(invalidOrderIdResult.response.data.message);

  const emptyCreateReportResult = await measureRequest(() =>
    I.sendPostRequest("/api/v1/manager/reports", {}, headers),
  );
  assert.ok([400, 422].includes(emptyCreateReportResult.response.status));
  assert.ok(emptyCreateReportResult.response.data.message);

  const invalidStatusReportResult = await measureRequest(() =>
    I.sendPatchRequest(
      "/api/v1/manager/reports/9999999/status",
      { status: "GARBAGE_VALUE" },
      headers,
    ),
  );
  assert.ok([400, 422, 404, 500].includes(invalidStatusReportResult.response.status));
  assert.ok(invalidStatusReportResult.response.data.message);
});
