const http = require('http');

const PORT = 5001;
const BASE_URL = `http://localhost:${PORT}`;

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING DESTRUCTIVE API TESTS ===');
  let failures = 0;

  // Test Case 1: Create Todo with Empty Title
  try {
    const res = await request('POST', '/api/todos', { title: '' });
    if (res.status === 400) {
      console.log('✅ Test 1 Passed: Empty title rejected with 400');
    } else {
      console.error(`❌ Test 1 Failed: Empty title accepted or wrong status: ${res.status}`, res.body);
      failures++;
    }
  } catch (err) {
    console.error('❌ Test 1 Error:', err.message);
    failures++;
  }

  // Test Case 1b: Create Todo with Whitespace-only Title
  try {
    const res = await request('POST', '/api/todos', { title: '    ' });
    if (res.status === 400) {
      console.log('✅ Test 1b Passed: Whitespace-only title rejected with 400');
    } else {
      console.error(`❌ Test 1b Failed: Whitespace-only title accepted with status: ${res.status}`, res.body);
      failures++;
    }
  } catch (err) {
    console.error('❌ Test 1b Error:', err.message);
    failures++;
  }

  // Test Case 2: Create Todo with Invalid Due Date (Format)
  try {
    const res = await request('POST', '/api/todos', { title: 'Valid Title', due_date: '06-06-2026' });
    if (res.status === 400) {
      console.log('✅ Test 2 Passed: Invalid date format (DD-MM-YYYY) rejected with 400');
    } else {
      console.error(`❌ Test 2 Failed: Invalid date format accepted with status: ${res.status}`, res.body);
      failures++;
    }
  } catch (err) {
    console.error('❌ Test 2 Error:', err.message);
    failures++;
  }

  // Test Case 2b: Create Todo with Impossible Date (Feb 30th)
  try {
    const res = await request('POST', '/api/todos', { title: 'Valid Title', due_date: '2026-02-30' });
    if (res.status === 400) {
      console.log('✅ Test 2b Passed: Impossible date (2026-02-30) rejected with 400');
    } else {
      console.error(`❌ Test 2b Failed: Impossible date accepted with status: ${res.status}`, res.body);
      failures++;
    }
  } catch (err) {
    console.error('❌ Test 2b Error:', err.message);
    failures++;
  }

  // Test Case 3: Create Todo with Invalid Priority
  try {
    const res = await request('POST', '/api/todos', { title: 'Valid Title', priority: 'critical' });
    if (res.status === 400) {
      console.log('✅ Test 3 Passed: Invalid priority ("critical") rejected with 400');
    } else {
      console.error(`❌ Test 3 Failed: Invalid priority accepted with status: ${res.status}`, res.body);
      failures++;
    }
  } catch (err) {
    console.error('❌ Test 3 Error:', err.message);
    failures++;
  }

  // Test Case 4: Update Title to Empty string
  let testTodoId;
  try {
    // Setup a valid todo first
    const setup = await request('POST', '/api/todos', { title: 'Original Task' });
    testTodoId = setup.body.id;

    const res = await request('PUT', `/api/todos/${testTodoId}`, { title: '' });
    if (res.status === 400) {
      console.log('✅ Test 4 Passed: Updating title to empty string rejected with 400');
    } else {
      console.error(`❌ Test 4 Failed: Allowed updating title to empty string, status: ${res.status}`, res.body);
      failures++;
    }
  } catch (err) {
    console.error('❌ Test 4 Error:', err.message);
    failures++;
  }

  // Test Case 5: Update with Invalid Priority
  try {
    const res = await request('PUT', `/api/todos/${testTodoId}`, { priority: 'super-low' });
    if (res.status === 400) {
      console.log('✅ Test 5 Passed: Updating to invalid priority rejected with 400');
    } else {
      console.error(`❌ Test 5 Failed: Allowed updating to invalid priority, status: ${res.status}`, res.body);
      failures++;
    }
  } catch (err) {
    console.error('❌ Test 5 Error:', err.message);
    failures++;
  }

  // Test Case 6: Update with Invalid Due Date
  try {
    const res = await request('PUT', `/api/todos/${testTodoId}`, { due_date: 'not-a-date' });
    if (res.status === 400) {
      console.log('✅ Test 6 Passed: Updating to invalid date format rejected with 400');
    } else {
      console.error(`❌ Test 6 Failed: Allowed updating to invalid date, status: ${res.status}`, res.body);
      failures++;
    }
  } catch (err) {
    console.error('❌ Test 6 Error:', err.message);
    failures++;
  }

  // Test Case 7: Completed logic (completed_at updates)
  try {
    // 7.1: Mark complete
    const resComplete = await request('PUT', `/api/todos/${testTodoId}`, { completed: 1 });
    const today = new Date().toISOString().split('T')[0];
    if (resComplete.status === 200 && resComplete.body.completed === 1 && resComplete.body.completed_at === today) {
      console.log('✅ Test 7.1 Passed: Marking complete updates completed_at to today');
    } else {
      console.error(`❌ Test 7.1 Failed: Completed logic error, status: ${resComplete.status}`, resComplete.body);
      failures++;
    }

    // 7.2: Mark incomplete
    const resIncomplete = await request('PUT', `/api/todos/${testTodoId}`, { completed: 0 });
    if (resIncomplete.status === 200 && resIncomplete.body.completed === 0 && resIncomplete.body.completed_at === null) {
      console.log('✅ Test 7.2 Passed: Marking incomplete resets completed_at to null');
    } else {
      console.error(`❌ Test 7.2 Failed: Incomplete logic error, status: ${resIncomplete.status}`, resIncomplete.body);
      failures++;
    }
  } catch (err) {
    console.error('❌ Test 7 Error:', err.message);
    failures++;
  }

  // Test Case 8: Update non-existent ID
  try {
    const res = await request('PUT', '/api/todos/999999', { title: 'New title' });
    if (res.status === 404) {
      console.log('✅ Test 8 Passed: Non-existent ID returned 404');
    } else {
      console.error(`❌ Test 8 Failed: Expected 404 for non-existent ID, got: ${res.status}`, res.body);
      failures++;
    }
  } catch (err) {
    console.error('❌ Test 8 Error:', err.message);
    failures++;
  }

  // Clean up test todo
  if (testTodoId) {
    try {
      await request('DELETE', `/api/todos/${testTodoId}`);
    } catch (e) {}
  }

  console.log('=== TEST RESULT SUMMARY ===');
  if (failures === 0) {
    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.error(`🚨 ${failures} TESTS FAILED. PLEASE FIX THE BUGS.`);
    process.exit(1);
  }
}

runTests();
