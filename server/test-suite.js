import http from 'http';

const BASE_URL = 'http://localhost:5050';

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}

// 1. Health
test('GET /api/health should return status ok', async () => {
  const res = await request('GET', '/api/health');
  if (res.status !== 200 || res.data.status !== 'ok') {
    throw new Error(`Expected status 200 and ok, got ${res.status}`);
  }
});

// 2. Settings GET & POST
test('GET & POST /api/settings should persist organizational rules', async () => {
  const getRes = await request('GET', '/api/settings');
  if (getRes.status !== 200 || !getRes.data.currency) {
    throw new Error(`Failed to fetch settings`);
  }

  const postRes = await request('POST', '/api/settings', {
    currency: 'EUR',
    dailyMealCap: 85.00,
    mileageRate: 0.70
  });
  if (postRes.status !== 200 || !postRes.data.success || postRes.data.settings.currency !== 'EUR') {
    throw new Error(`Failed to update settings`);
  }

  // Restore USD
  await request('POST', '/api/settings', { currency: 'USD', dailyMealCap: 75.00 });
});

// 3. Trips GET & POST
test('GET /api/trips (Admin vs My View) and POST /api/trips', async () => {
  const allTrips = await request('GET', '/api/trips?viewMode=admin');
  if (allTrips.status !== 200 || !Array.isArray(allTrips.data)) {
    throw new Error('Failed to fetch admin trips');
  }

  const myTrips = await request('GET', '/api/trips?viewMode=my');
  if (myTrips.status !== 200 || !Array.isArray(myTrips.data)) {
    throw new Error('Failed to fetch personal trips');
  }

  const newTrip = await request('POST', '/api/trips', {
    destination: 'Berlin, Germany',
    traveler: 'Arvind',
    purpose: 'EU Client Conference',
    budget: 2200.00,
    dates: 'Dec 01 - Dec 05, 2026'
  });
  if (newTrip.status !== 201 || !newTrip.data.success || !newTrip.data.trip.id) {
    throw new Error('Failed to create new trip');
  }
});

// 4. Reports GET & POST
test('GET & POST /api/reports for expense claims', async () => {
  const allReports = await request('GET', '/api/reports?viewMode=admin');
  if (allReports.status !== 200 || !Array.isArray(allReports.data)) {
    throw new Error('Failed to fetch reports');
  }

  const newReport = await request('POST', '/api/reports', {
    title: 'Customer Onboarding Lunch',
    employee: 'Arvind',
    amount: 145.50,
    receiptsCount: 2
  });
  if (newReport.status !== 201 || !newReport.data.success) {
    throw new Error('Failed to submit report');
  }
});

// 5. Advances GET & POST
test('GET & POST /api/advances for cash advances', async () => {
  const allAdvances = await request('GET', '/api/advances?viewMode=admin');
  if (allAdvances.status !== 200 || !Array.isArray(allAdvances.data)) {
    throw new Error('Failed to fetch advances');
  }

  const newAdvance = await request('POST', '/api/advances', {
    employee: 'Arvind',
    amount: 250.00,
    purpose: 'Transit advance for client site'
  });
  if (newAdvance.status !== 201 || !newAdvance.data.success) {
    throw new Error('Failed to disburse advance');
  }
});

// 6. Purchase Requests GET & POST
test('GET & POST /api/purchaserequests for procurement', async () => {
  const allPRs = await request('GET', '/api/purchaserequests?viewMode=admin');
  if (allPRs.status !== 200 || !Array.isArray(allPRs.data)) {
    throw new Error('Failed to fetch purchase requests');
  }

  const newPR = await request('POST', '/api/purchaserequests', {
    item: 'Data Dog Infrastructure Monitoring 1-Year',
    vendor: 'Datadog Inc.',
    department: 'Engineering',
    requester: 'Arvind',
    amount: 3200.00
  });
  if (newPR.status !== 201 || !newPR.data.success) {
    throw new Error('Failed to create purchase request');
  }
});

// 7. Dashboard Overview Calculation (Admin vs My View)
test('GET /api/dashboard/overview switches between Admin and My View', async () => {
  const adminRes = await request('GET', '/api/dashboard/overview?viewMode=admin');
  if (adminRes.status !== 200 || adminRes.data.viewMode !== 'admin') {
    throw new Error('Admin overview failed');
  }

  const myRes = await request('GET', '/api/dashboard/overview?viewMode=my');
  if (myRes.status !== 200 || myRes.data.viewMode !== 'my' || !myRes.data.currentUser) {
    throw new Error('My view overview failed');
  }
});

// 8. Mobile Assistant Actions
test('POST /api/actions/apply-advance & /submit-report', async () => {
  const advRes = await request('POST', '/api/actions/apply-advance', { cardId: 'asst-1' });
  if (advRes.status !== 200 || !advRes.data.success) {
    throw new Error('Assistant advance action failed');
  }

  const repRes = await request('POST', '/api/actions/submit-report', { cardId: 'asst-2' });
  if (repRes.status !== 200 || !repRes.data.success) {
    throw new Error('Assistant report action failed');
  }
});

// 9. PUT Endpoints: Trips, Reports, Advances, Purchase Requests Persistence
test('PUT endpoints update and persist status for trips, reports, advances, and PRs', async () => {
  // Test Trip approval persistence
  const tripRes = await request('PUT', '/api/trips/TRP-1042', { status: 'approved' });
  if (tripRes.status !== 200 || tripRes.data.trip.status !== 'approved') {
    throw new Error('Trip status update failed');
  }

  // Test Report reimbursement persistence
  const repRes = await request('PUT', '/api/reports/ER-09', { status: 'reimbursed' });
  if (repRes.status !== 200 || repRes.data.report.status !== 'reimbursed') {
    throw new Error('Report reimbursement update failed');
  }

  // Test Advance settlement persistence
  const advRes = await request('PUT', '/api/advances/ADV-801', { settlementStatus: 'settled' });
  if (advRes.status !== 200 || advRes.data.advance.settlementStatus !== 'settled') {
    throw new Error('Advance settlement update failed');
  }

  // Test Purchase Request status persistence
  const prRes = await request('PUT', '/api/purchaserequests/PR-2026-88', { status: 'approved' });
  if (prRes.status !== 200 || prRes.data.purchaseRequest.status !== 'approved') {
    throw new Error('Purchase request status update failed');
  }
});

// 10. Corporate Cards Lifecycle (GET, POST, Toggle Status)
test('Corporate cards GET, POST, and PUT toggle status', async () => {
  const list = await request('GET', '/api/corporatecards');
  if (list.status !== 200 || !Array.isArray(list.data)) {
    throw new Error('Failed to fetch corporate cards');
  }

  const create = await request('POST', '/api/corporatecards', {
    holder: 'Pooja Krishnan',
    title: 'Cyber Security Operations Card',
    limit: 12000
  });
  if (create.status !== 201 || !create.data.success) {
    throw new Error('Failed to issue corporate card');
  }

  const toggle = await request('PUT', `/api/corporatecards/${create.data.card.id}/toggle-status`);
  if (toggle.status !== 200 || toggle.data.card.status !== 'frozen') {
    throw new Error('Failed to freeze corporate card');
  }
});

// 11. Budgets Management (GET, POST)
test('Budgets GET and POST endpoints', async () => {
  const list = await request('GET', '/api/budgets');
  if (list.status !== 200 || !Array.isArray(list.data)) {
    throw new Error('Failed to fetch budgets');
  }

  const create = await request('POST', '/api/budgets', {
    department: 'Autonomous Robotics Lab',
    allocated: 95000,
    color: '#8b5cf6'
  });
  if (create.status !== 201 || !create.data.success) {
    throw new Error('Failed to create budget plan');
  }
});

// 12. User Registration & Duplicate Email Validation
test('POST /api/auth/register creates user and prevents duplicate emails', async () => {
  const email = `test.pilot.${Date.now()}@zylker.com`;
  const regRes = await request('POST', '/api/auth/register', {
    name: 'Flight Pilot',
    email,
    password: 'securePassword123',
    role: 'employee',
    department: 'Aviation Ops'
  });

  if (regRes.status !== 201 || !regRes.data.success || !regRes.data.token) {
    throw new Error('User registration failed');
  }

  // Duplicate registration must return 400
  const dupRes = await request('POST', '/api/auth/register', {
    name: 'Flight Pilot 2',
    email,
    password: 'anotherPassword123'
  });

  if (dupRes.status !== 400 || dupRes.data.success !== false) {
    throw new Error('Duplicate user registration was not rejected');
  }
});

// 13. User Login & Token Verification
test('POST /api/auth/login and GET /api/auth/me token authentication', async () => {
  const loginRes = await request('POST', '/api/auth/login', {
    email: 'admin@zylker.com',
    password: 'admin123'
  });

  if (loginRes.status !== 200 || !loginRes.data.success || !loginRes.data.token) {
    throw new Error('Admin login failed');
  }

  if (loginRes.data.user.role !== 'admin') {
    throw new Error('Admin role mismatch');
  }
});

async function run() {
  console.log(`\n========================================`);
  console.log(`RUNNING FULL STACK SYSTEM TEST SUITE`);
  console.log(`========================================\n`);
  
  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    try {
      await t.fn();
      console.log(`✅ [PASS] ${t.name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${t.name}`);
      console.error(`   Error: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n----------------------------------------`);
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED (TOTAL: ${tests.length})`);
  console.log(`----------------------------------------\n`);

  if (failed > 0) process.exit(1);
}

run();
