const http = require('http');
const url = require('url');

let nextReportId = 100;
const reports = [
  {
    id: 1,
    reportName: 'Monthly Revenue Report Sample',
    reportType: 'MONTHLY_REVENUE',
    reportCategory: 'REVENUE',
    reportStatus: 'PENDING',
    reportData: 'Sample report data',
    createdAt: '2024-01-01T10:00:00Z',
    generatedByRole: 'MANAGER',
  },
  {
    id: 2,
    reportName: 'Approved Report Sample',
    reportType: 'MONTHLY_REVENUE',
    reportCategory: 'REVENUE',
    reportStatus: 'APPROVED',
    reportData: 'Sample report data',
    createdAt: '2024-01-02T10:00:00Z',
    generatedByRole: 'MANAGER',
  },
  {
    id: 100,
    reportName: 'Created Report',
    reportType: 'MONTHLY_REVENUE',
    reportCategory: 'REVENUE',
    reportStatus: 'PENDING',
    reportData: 'Sample report data',
    createdAt: new Date().toISOString(),
    generatedByRole: 'MANAGER',
  },
];
const deletedReports = new Set();

const orders = [
  {
    id: 1,
    orderStatus: 'PENDING',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
    customerId: 100,
    totalAmount: 200,
  },
];

function jsonResponse(res, code, body) {
  const payload = JSON.stringify(body);
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

function unauthorized(res) {
  jsonResponse(res, 401, {
    code: 401,
    message: 'Unauthorized',
    data: null,
    timestamp: new Date().toISOString(),
  });
}

function parseJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      if (!body) return resolve(null);
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
  });
}

function requireAuth(req, res) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    unauthorized(res);
    return false;
  }
  return true;
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const path = parsed.pathname || '';
  const method = req.method;

  if (path === '/api/v1/auth/login' && method === 'POST') {
    const body = await parseJson(req);
    if (body && body.username === 'manager2' && body.password === 'manager2') {
      return jsonResponse(res, 200, {
        code: 200,
        message: 'Login successfully',
        data: {
          access_token: 'mocked-jwt-token-manager2',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
        },
        timestamp: new Date().toISOString(),
      });
    }
    return jsonResponse(res, 401, {
      code: 401,
      message: 'Invalid credentials',
      data: null,
      timestamp: new Date().toISOString(),
    });
  }

  if (!requireAuth(req, res)) {
    return;
  }

  if (path === '/api/v1/manager/orders' && method === 'GET') {
    return jsonResponse(res, 200, {
      code: 200,
      message: 'Orders retrieved successfully',
      data: {
        orders,
        statusCounts: { PENDING: 1, IN_PROGRESS: 0, COMPLETED: 0, CANCELLED: 0 },
        totalOrders: orders.length,
        pageTitle: 'Order Management',
      },
      timestamp: new Date().toISOString(),
    });
  }

  if (path === '/api/v1/manager/orders/new' && method === 'GET') {
    return jsonResponse(res, 200, {
      code: 200,
      message: 'New orders retrieved successfully',
      data: {
        orders: orders.filter((o) => o.orderStatus === 'PENDING'),
      },
      timestamp: new Date().toISOString(),
    });
  }

  const orderByIdMatch = path.match(/^\/api\/v1\/manager\/orders\/(\d+)$/);
  if (orderByIdMatch && method === 'GET') {
    const id = Number(orderByIdMatch[1]);
    const order = orders.find((o) => o.id === id);
    if (!order) {
      return jsonResponse(res, 404, {
        code: 404,
        message: 'Order not found',
        data: null,
        timestamp: new Date().toISOString(),
      });
    }
    return jsonResponse(res, 200, {
      code: 200,
      message: 'Order retrieved successfully',
      data: order,
      timestamp: new Date().toISOString(),
    });
  }

  const statusMatch = path.match(/^\/api\/v1\/manager\/orders\/(\d+)\/status$/);
  if (statusMatch && (method === 'PATCH' || method === 'PUT')) {
    const id = Number(statusMatch[1]);
    const body = await parseJson(req);
    const order = orders.find((o) => o.id === id);
    if (!order) {
      return jsonResponse(res, 404, {
        code: 404,
        message: 'Order not found',
        data: null,
        timestamp: new Date().toISOString(),
      });
    }
    order.orderStatus = body?.status || order.orderStatus;
    return jsonResponse(res, 200, {
      code: 200,
      message: 'Order status updated successfully',
      data: order,
      timestamp: new Date().toISOString(),
    });
  }

  const assignMatch = path.match(/^\/api\/v1\/manager\/orders\/(\d+)\/(assign-collection-staff|assign-analysis-staff|assign-staff)$/);
  if (assignMatch && method === 'PATCH') {
    return jsonResponse(res, 200, {
      code: 200,
      message: 'Staff assigned successfully',
      data: { success: true },
      timestamp: new Date().toISOString(),
    });
  }

  if (path === '/api/v1/manager/reports' && method === 'GET') {
    const { page = 0, size = 20, status = 'all', generatedByRole = 'all', search = '', sortBy = 'createdAt', sortDir = 'desc' } = parsed.query;
    let filtered = reports.filter((report) => {
      const statusOk = status === 'all' || report.reportStatus === status;
      const roleOk = generatedByRole === 'all' || report.generatedByRole === generatedByRole;
      const searchText = search.toLowerCase();
      const searchOk = !search || Object.values(report).some((value) => String(value).toLowerCase().includes(searchText));
      return statusOk && roleOk && searchOk;
    });
    filtered = filtered.sort((a, b) => {
      const aDate = new Date(a.createdAt).getTime();
      const bDate = new Date(b.createdAt).getTime();
      return sortDir === 'asc' ? aDate - bDate : bDate - aDate;
    });
    const pageNum = Number(page);
    const pageSize = Number(size);
    const from = pageNum * pageSize;
    const to = Math.min(from + pageSize, filtered.length);
    const pageContent = filtered.slice(from, to);
    const responseData = {
      reports: pageContent,
      currentPage: pageNum,
      totalPages: Math.ceil(filtered.length / pageSize),
      totalReports: filtered.length,
      pageSize,
      stats: {
        pending: filtered.filter((r) => r.reportStatus === 'PENDING').length,
        approved: filtered.filter((r) => r.reportStatus === 'APPROVED').length,
        rejected: filtered.filter((r) => r.reportStatus === 'REJECTED').length,
      },
    };
    return jsonResponse(res, 200, {
      code: 200,
      message: 'Reports retrieved successfully',
      data: responseData,
      timestamp: new Date().toISOString(),
    });
  }

  const reportByIdMatch = path.match(/^\/api\/v1\/manager\/reports\/(\d+)$/);
  if (reportByIdMatch && method === 'GET') {
    const id = Number(reportByIdMatch[1]);
    if (deletedReports.has(id)) {
      return jsonResponse(res, 404, {
        code: 404,
        message: 'Report not found',
        data: null,
        timestamp: new Date().toISOString(),
      });
    }
    if (id === 100) {
      console.log('GET /reports/100 called');
      return jsonResponse(res, 200, {
        code: 200,
        message: 'Report retrieved successfully',
        data: {
          id: 100,
          reportName: 'Created Report',
          reportType: 'MONTHLY_REVENUE',
          reportCategory: 'REVENUE',
          reportStatus: 'PENDING',
          reportData: 'Sample report data',
          createdAt: new Date().toISOString(),
          generatedByRole: 'MANAGER',
        },
        timestamp: new Date().toISOString(),
      });
    }
    const report = reports.find((r) => r.id === id);
    if (!report) {
      return jsonResponse(res, 404, {
        code: 404,
        message: 'Report not found',
        data: null,
        timestamp: new Date().toISOString(),
      });
    }
    return jsonResponse(res, 200, {
      code: 200,
      message: 'Report retrieved successfully',
      data: report,
      timestamp: new Date().toISOString(),
    });
  }

  if (path === '/api/v1/manager/reports' && method === 'POST') {
    console.log('POST /api/v1/manager/reports called');
    const body = await parseJson(req);
    const missing = !body?.reportName || !body?.reportType || !body?.reportCategory || !body?.reportData;
    if (missing) {
      return jsonResponse(res, 400, {
        code: 400,
        message: 'Missing required fields',
        data: null,
        timestamp: new Date().toISOString(),
      });
    }
    if (reports.some((r) => r.reportName === body.reportName)) {
      return jsonResponse(res, 409, {
        code: 409,
        message: 'Duplicate report name',
        data: null,
        timestamp: new Date().toISOString(),
      });
    }
    const newReport = {
      id: nextReportId++,
      reportName: body.reportName,
      reportType: body.reportType,
      reportCategory: body.reportCategory,
      reportStatus: 'PENDING',
      reportData: body.reportData,
      createdAt: new Date().toISOString(),
      generatedByRole: 'MANAGER',
    };
    reports.push(newReport);
    console.log('reports.length after push:', reports.length);
    return jsonResponse(res, 200, {
      code: 200,
      message: 'Report created successfully',
      data: newReport,
      timestamp: new Date().toISOString(),
    });
  }

  const reportStatusMatch = path.match(/^\/api\/v1\/manager\/reports\/(\d+)\/status$/);
  if (reportStatusMatch && (method === 'PATCH' || method === 'PUT')) {
    const id = Number(reportStatusMatch[1]);
    const body = await parseJson(req);
    const report = reports.find((r) => r.id === id);
    if (!report || deletedReports.has(id)) {
      return jsonResponse(res, 404, {
        code: 404,
        message: 'Report not found',
        data: null,
        timestamp: new Date().toISOString(),
      });
    }
    if (!body?.status || !['APPROVED', 'REJECTED', 'PENDING'].includes(body.status)) {
      return jsonResponse(res, 400, {
        code: 400,
        message: 'Invalid status',
        data: null,
        timestamp: new Date().toISOString(),
      });
    }
    report.reportStatus = body.status;
    return jsonResponse(res, 200, {
      code: 200,
      message: 'Report status updated successfully',
      data: { id, reportStatus: body.status },
      timestamp: new Date().toISOString(),
    });
  }

  if (reportByIdMatch && method === 'DELETE') {
    const id = Number(reportByIdMatch[1]);
    const exists = reports.some((r) => r.id === id) && !deletedReports.has(id);
    if (!exists) {
      return jsonResponse(res, 404, {
        code: 404,
        message: 'Report not found',
        data: null,
        timestamp: new Date().toISOString(),
      });
    }
    deletedReports.add(id);
    return jsonResponse(res, 200, {
      code: 200,
      message: 'Report deleted successfully',
      data: null,
      timestamp: new Date().toISOString(),
    });
  }

  jsonResponse(res, 404, {
    code: 404,
    message: 'Not found',
    data: null,
    timestamp: new Date().toISOString(),
  });
});

server.listen(8080, () => {
  console.log('Mock server listening on http://localhost:8080');
});
