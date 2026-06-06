const http = require('http');

const API_URL = 'http://localhost:5001/api';

async function request(endpoint, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_URL}${endpoint}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {}
    };

    if (data) {
      options.headers['Content-Type'] = 'application/json';
    }
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING AUTH & MONGODB TESTS ---');
  let passed = 0;
  let failed = 0;

  const assert = (condition, msg) => {
    if (condition) {
      console.log(`✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${msg}`);
      failed++;
    }
  };

  try {
    const userA = { name: 'User A', email: `usera_${Date.now()}@test.com`, password: 'password123' };
    const userB = { name: 'User B', email: `userb_${Date.now()}@test.com`, password: 'password123' };
    let tokenA, tokenB;

    // 1. Register User A
    let res = await request('/auth/register', 'POST', userA);
    assert(res.status === 201 && res.data.token, 'User A registered successfully');
    tokenA = res.data.token;

    // 2. Duplicate Register
    res = await request('/auth/register', 'POST', userA);
    assert(res.status === 400, 'Duplicate registration rejected');

    // 3. Login User A
    res = await request('/auth/login', 'POST', { email: userA.email, password: userA.password });
    assert(res.status === 200 && res.data.token, 'User A login successfully');

    // 4. Invalid Login
    res = await request('/auth/login', 'POST', { email: userA.email, password: 'wrongpassword' });
    assert(res.status === 401, 'Invalid login rejected');

    // 5. Register User B
    res = await request('/auth/register', 'POST', userB);
    assert(res.status === 201 && res.data.token, 'User B registered successfully');
    tokenB = res.data.token;

    // 6. Access Protected Route Without Token
    res = await request('/todos', 'GET');
    assert(res.status === 401, 'Accessing /todos without token is rejected');

    // 7. Create Todo for User A
    res = await request('/todos', 'POST', { title: 'User A Task' }, tokenA);
    assert(res.status === 201 && res.data.title === 'User A Task', 'User A creates a task');
    const taskIdA = res.data.id;

    // 8. Get Todos for User B
    res = await request('/todos', 'GET', null, tokenB);
    assert(res.status === 200 && res.data.length === 0, 'User B sees empty list (data isolation)');

    // 9. User B tries to delete User A's task
    res = await request(`/todos/${taskIdA}`, 'DELETE', null, tokenB);
    assert(res.status === 404, 'User B cannot delete User A\'s task');

    // 10. User A updates their task
    res = await request(`/todos/${taskIdA}`, 'PUT', { completed: true }, tokenA);
    assert(res.status === 200 && res.data.completed === 1, 'User A can update their task');

    // 11. User A deletes their task
    res = await request(`/todos/${taskIdA}`, 'DELETE', null, tokenA);
    assert(res.status === 200, 'User A can delete their task');

  } catch (err) {
    console.error('Test script crashed:', err);
  }

  console.log(`\n--- RESULTS: ${passed} Passed | ${failed} Failed ---`);
  if (failed > 0) process.exit(1);
}

// Give backend a moment to start
setTimeout(runTests, 2000);
