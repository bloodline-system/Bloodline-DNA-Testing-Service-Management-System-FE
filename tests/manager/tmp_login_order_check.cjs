const http = require('http');

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

(async () => {
  try {
    const loginBody = JSON.stringify({ username: 'manager2', password: 'manager2', rememberMe: true });
    const login = await request(
      {
        host: 'localhost',
        port: 8080,
        path: '/api/v1/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(loginBody),
        },
      },
      loginBody,
    );
    console.log('login', login.statusCode);
    console.log(login.body);
    const data = JSON.parse(login.body);
    const token = data.data.access_token;
    console.log('token length:', token.length);

    const orders = await request({
      host: 'localhost',
      port: 8080,
      path: '/api/v1/manager/orders',
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + token,
      },
    });
    console.log('orders', orders.statusCode);
    console.log(orders.body);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
