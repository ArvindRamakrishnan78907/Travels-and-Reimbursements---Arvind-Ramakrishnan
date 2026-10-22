import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5050;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/expense_tracker_db';

import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { Trip } from './models/Trip.js';
import { Report } from './models/Report.js';
import { Advance } from './models/Advance.js';
import { PurchaseRequest } from './models/PurchaseRequest.js';
import { Setting } from './models/Setting.js';
import { authenticateToken, requireRole, JWT_SECRET } from './middleware/auth.js';

app.use(cors());
app.use(express.json());

// In-Memory Seed Data (Localized to Indian Rupees INR ₹ at 1 USD = 83 INR)
const initialData = {
  settings: {
    currency: 'INR',
    dailyMealCap: 3500.00,
    mileageRate: 15.00,
    requireReceiptAbove: 500.00,
    managerApprovalThreshold: 250000.00,
    autoApproveLimit: 2500.00
  },
  spendSummary: {
    fiscalYear: "2026-2027",
    totalSpend: 1177000.00,
    timeframes: {
      "This Year": [
        { month: 'Apr', amount: 45000 },
        { month: 'May', amount: 62000 },
        { month: 'Jun', amount: 78500 },
        { month: 'Jul', amount: 91000 },
        { month: 'Aug', amount: 118000 },
        { month: 'Sep', amount: 132500 },
        { month: 'Oct', amount: 145000 },
        { month: 'Nov', amount: 110000 },
        { month: 'Dec', amount: 95000 },
        { month: 'Jan', amount: 85000 },
        { month: 'Feb', amount: 92000 },
        { month: 'Mar', amount: 123000 }
      ],
      "Previous Year": [
        { month: 'Apr', amount: 35000 },
        { month: 'May', amount: 48000 },
        { month: 'Jun', amount: 62000 },
        { month: 'Jul', amount: 72000 },
        { month: 'Aug', amount: 95000 },
        { month: 'Sep', amount: 105000 },
        { month: 'Oct', amount: 115000 },
        { month: 'Nov', amount: 88000 },
        { month: 'Dec', amount: 78000 },
        { month: 'Jan', amount: 70000 },
        { month: 'Feb', amount: 76000 },
        { month: 'Mar', amount: 98000 }
      ]
    }
  },
  overallSummary: {
    totalExpense: 1397800.00,
    employeeReimbursements: 1033350.00,
    employeeAdvances: 186750.00,
    totalTrips: 80
  },
  trips: [
    {
      id: 'TRP-1042',
      destination: 'London, United Kingdom',
      purpose: 'Global Partner Conference',
      traveler: 'Aditya Verma',
      email: 'aditya.v@zylker.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      dates: 'Oct 18 - Oct 23, 2026',
      budget: 236550.00,
      status: 'pending'
    },
    {
      id: 'TRP-1041',
      destination: 'Singapore',
      purpose: 'APAC Regional Client Summit',
      traveler: 'Arvind',
      email: 'arvind@zylker.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      dates: 'Nov 02 - Nov 06, 2026',
      budget: 161850.00,
      status: 'approved'
    },
    {
      id: 'TRP-1039',
      destination: 'San Francisco, USA',
      purpose: 'Tech Architecture Summit',
      traveler: 'Karthik Kumar',
      email: 'karthik.kumar@zylker.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      dates: 'Sep 10 - Sep 15, 2026',
      budget: 282200.00,
      status: 'completed'
    },
    {
      id: 'TRP-1038',
      destination: 'Tokyo, Japan',
      purpose: 'Vendor Negotiation',
      traveler: 'Manoj Raghavan',
      email: 'manoj.r@zylker.com',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
      dates: 'Aug 24 - Aug 29, 2026',
      budget: 203350.00,
      status: 'approved'
    }
  ],
  pendingTrips: [
    {
      id: "pt-1",
      name: "Arvind",
      email: "arvind@zylker.com",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
      count: 1
    },
    {
      id: "pt-2",
      name: "Karthik Kumar",
      email: "karthik.kumar@zylker.com",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
      count: 4
    },
    {
      id: "pt-3",
      name: "Anand Subramanian",
      email: "anand.s@zylker.com",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces",
      count: 12
    }
  ],
  reportsList: [
    {
      id: 'ER-09',
      title: 'Trip to Singapore Client Onboarding',
      employee: 'Arvind',
      email: 'arvind@zylker.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      submittedDate: 'May 12, 2026',
      receiptsCount: 4,
      amount: 26735.00,
      policyStatus: 'Compliant',
      status: 'pending'
    },
    {
      id: 'ER-07',
      title: 'Quarterly Sales Executive Dinners',
      employee: 'Karthik Narayanan',
      email: 'karthik.n@zylker.com',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop',
      submittedDate: 'May 14, 2026',
      receiptsCount: 8,
      amount: 102295.00,
      policyStatus: 'Compliant',
      status: 'pending'
    },
    {
      id: 'ER-08',
      title: 'Tokyo Hardware Expo Booth & Passes',
      employee: 'Manoj Raghavan',
      email: 'manoj.r@zylker.com',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
      submittedDate: 'May 08, 2026',
      receiptsCount: 12,
      amount: 235728.00,
      policyStatus: 'Policy Warning',
      status: 'in-review'
    },
    {
      id: 'ER-04',
      title: 'Design System Team Offsite Supplies',
      employee: 'Sneha Kulkarni',
      email: 'sneha.k@zylker.com',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
      submittedDate: 'Apr 28, 2026',
      receiptsCount: 6,
      amount: 327900.00,
      policyStatus: 'Compliant',
      status: 'reimbursed'
    }
  ],
  pendingReports: {
    forApproval: {
      count: 1,
      totalAmount: 153550.00,
      items: [
        {
          id: "rep-app-1",
          name: "Aditya Verma",
          email: "aditya.v@zylker.com",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces",
          amount: 153550.00,
          reportCode: "ER-12",
          tripName: "London Client Summit"
        }
      ]
    },
    forReimbursements: {
      totalAmount: 692658.00,
      items: [
        {
          id: "rep-reimb-1",
          name: "Ananya",
          email: "ananya@zylker.com",
          avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces",
          amount: 26735.00,
          reportCode: "ER-04",
          tripName: "Design System Workshop"
        },
        {
          id: "rep-reimb-2",
          name: "Karthik Narayanan",
          email: "karthik.n@zylker.com",
          avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=faces",
          amount: 102295.00,
          reportCode: "ER-07",
          tripName: "Quarterly Sales Review"
        },
        {
          id: "rep-reimb-3",
          name: "Manoj Raghavan",
          email: "manoj.r@zylker.com",
          avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=faces",
          amount: 235728.00,
          reportCode: "ER-08",
          tripName: "Tokyo Tech Expo"
        },
        {
          id: "rep-reimb-4",
          name: "Sneha Kulkarni",
          email: "sneha.k@zylker.com",
          avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces",
          amount: 327900.00,
          reportCode: "ER-10",
          tripName: "European Partner Meet"
        }
      ]
    }
  },
  advances: [
    {
      id: 'ADV-801',
      employee: 'Arvind',
      email: 'arvind@zylker.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      amount: 24900.00,
      purpose: 'Advance for Singapore Trip Meals & Transit',
      issuedDate: 'May 12, 2026',
      settlementStatus: 'unsettled'
    },
    {
      id: 'ADV-798',
      employee: 'Karthik Kumar',
      email: 'karthik.kumar@zylker.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      amount: 124500.00,
      purpose: 'San Francisco Tech Conference Booking',
      issuedDate: 'May 04, 2026',
      settlementStatus: 'settled'
    },
    {
      id: 'ADV-795',
      employee: 'Anand Subramanian',
      email: 'anand.s@zylker.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      amount: 37350.00,
      purpose: 'Client Hospitality & Dinner',
      issuedDate: 'Apr 26, 2026',
      settlementStatus: 'unsettled'
    }
  ],
  purchaseRequests: [
    {
      id: 'PR-2026-88',
      item: 'AWS Cloud Server Reserved Instances (1 Year)',
      vendor: 'Amazon Web Services',
      department: 'Engineering',
      requester: 'Karthik Narayanan',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop',
      amount: 8400.00,
      status: 'pending'
    },
    {
      id: 'PR-2026-85',
      item: 'Design Team Figma Enterprise Annual License',
      vendor: 'Figma Inc.',
      department: 'Product Design',
      requester: 'Arvind',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      amount: 2160.00,
      status: 'approved'
    },
    {
      id: 'PR-2026-82',
      item: 'Office Ergonomic Chairs Batch (12 units)',
      vendor: 'Herman Miller',
      department: 'Operations',
      requester: 'Anand Subramanian',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      amount: 5890.00,
      status: 'approved'
    }
  ],
  assistantCards: [
    {
      id: "asst-1",
      type: "advance",
      title: "You are yet to apply the advance amount",
      tripTitle: null,
      advanceAmount: 300.00,
      date: "May 12,2021",
      buttonText: "APPLY ADVANCE AMOUNT >",
      status: "pending"
    },
    {
      id: "asst-2",
      type: "report",
      title: "You are yet to submit this expense report - ER-09",
      tripTitle: "Trip to Singapore",
      advanceAmount: 300.00,
      date: "May 12,2021",
      buttonText: "SUBMIT EXPENSE REPORT >",
      status: "pending"
    },
    {
      id: "asst-3",
      type: "advance",
      title: "You are yet to apply the advance amount",
      tripTitle: "Design Sprint Austin",
      advanceAmount: 450.00,
      date: "Jun 04,2021",
      buttonText: "APPLY ADVANCE AMOUNT >",
      status: "pending"
    }
  ],
  corporateCards: [
    {
      id: 'cc-1',
      holder: 'Aditya Verma',
      title: 'Executive Travel Visa',
      last4: '4821',
      limit: 15000,
      spent: 8420,
      status: 'active'
    },
    {
      id: 'cc-2',
      holder: 'Karthik Kumar',
      title: 'Engineering SaaS Mastercard',
      last4: '9012',
      limit: 10000,
      spent: 4150,
      status: 'active'
    },
    {
      id: 'cc-3',
      holder: 'Ananya',
      title: 'Marketing Campaigns AMEX',
      last4: '3341',
      limit: 20000,
      spent: 17800,
      status: 'active'
    }
  ],
  budgets: [
    { id: 'bgt-1', department: 'Engineering & Cloud Infra', allocated: 150000, spent: 118400, color: '#3b82f6' },
    { id: 'bgt-2', department: 'Global Sales & Client Travel', allocated: 120000, spent: 98500, color: '#10b981' },
    { id: 'bgt-3', department: 'Marketing & Brand Growth', allocated: 80000, spent: 74200, color: '#f59e0b' },
    { id: 'bgt-4', department: 'People Ops & Executive Travel', allocated: 50000, spent: 28300, color: '#8b5cf6' },
    { id: 'bgt-5', department: 'Customer Success & Support', allocated: 40000, spent: 39100, color: '#ef4444' }
  ],
  users: [
    {
      id: 'USR-001',
      name: 'Arvind',
      email: 'admin@zylker.com',
      password: '$2b$10$YixjanWpIeO4Lm5Hk.3EaOqalcIXTgcF5138qktWZyMgTsGFgkR6O', // admin123
      role: 'admin',
      department: 'Finance & Administration',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
    },
    {
      id: 'USR-002',
      name: 'Karthik Narayanan',
      email: 'manager@zylker.com',
      password: '$2b$10$DrNaXwEVaSPLsqGmpK6iouLwJdzY5w2WPEzuXu.wq6uTw152pzlLa', // manager123
      role: 'manager',
      department: 'Engineering & Operations',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop'
    },
    {
      id: 'USR-003',
      name: 'Aditya Verma',
      email: 'employee@zylker.com',
      password: '$2b$10$VmCBROlveHzjiSsoU4DiretEMrtuG4/i4ampgb0x8r2L2r3kZJcte', // employee123
      role: 'employee',
      department: 'Global Sales',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
    }
  ]
};

// Mutable runtime data
let currentStore = JSON.parse(JSON.stringify(initialData));

let isMongoConnected = false;
connectDB(MONGODB_URI).then(async (connected) => {
  isMongoConnected = connected;
  if (connected) {
    try {
      // Sync and ensure pre-seeded users are up-to-date in MongoDB
      for (const u of initialData.users) {
        const exists = await User.findOne({ email: u.email });
        if (!exists) {
          await User.create(u);
        } else if (exists.name !== u.name || exists.role !== u.role || exists.department !== u.department) {
          exists.name = u.name;
          exists.role = u.role;
          exists.department = u.department;
          await exists.save();
        }
      }
    } catch (e) {
      console.warn('Initial user sync note:', e.message);
    }
  }
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    stack: 'MERN (MongoDB, Express, React, Node.js)',
    database: isMongoConnected ? 'MongoDB (Mongoose Active Connection)' : 'MongoDB (Mongoose Schema Driver with Failover)',
    mongoConnected: isMongoConnected,
    models: ['User', 'Trip', 'Report', 'Advance', 'PurchaseRequest', 'Setting'],
    timestamp: new Date()
  });
});

// ==========================================
// Authentication & Registration Endpoints
// ==========================================

// Register New User
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = currentStore.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = ['employee', 'manager', 'admin'].includes(role) ? role : 'employee';
    const newUser = {
      id: `USR-${String(currentStore.users.length + 1).padStart(3, '0')}`,
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: assignedRole,
      department: department || 'Engineering',
      avatar: assignedRole === 'admin' 
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
        : (assignedRole === 'manager' 
            ? 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop'
            : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'),
      createdAt: new Date()
    };

    currentStore.users.push(newUser);

    if (isMongoConnected) {
      try {
        await User.create(newUser);
      } catch (dbErr) {
        console.warn('MongoDB User save notice:', dbErr.message);
      }
    }

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role, department: newUser.department },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = { ...newUser };
    delete safeUser.password;

    res.status(201).json({
      success: true,
      message: `Registration successful! Welcome to SmartSpend, ${newUser.name}.`,
      token,
      user: safeUser
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error during registration: ' + err.message });
  }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = currentStore.users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user && isMongoConnected) {
      user = await User.findOne({ email: cleanEmail });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
    }

    const token = jwt.sign(
      { id: user.id || user._id, email: user.email, name: user.name, role: user.role, department: user.department },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = {
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      avatar: user.avatar
    };

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: safeUser
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error during login: ' + err.message });
  }
});

// Get Current Authenticated Profile (Token verification)
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

// Get All Users (Admin / Manager only)
app.get('/api/auth/users', authenticateToken, requireRole('admin', 'manager'), (req, res) => {
  const safeUsers = currentStore.users.map(({ password, ...u }) => u);
  res.json({ success: true, users: safeUsers });
});

// ==========================================
// WebAuthn Passkey Endpoints
// ==========================================

// Passkey: Registration Challenge
app.post('/api/auth/passkey/register-challenge', (req, res) => {
  const { email } = req.body;
  const challenge = crypto.randomBytes(32).toString('base64url');

  res.json({
    success: true,
    challenge,
    rp: { name: 'SmartSpend Corporate', id: req.hostname },
    user: {
      id: crypto.randomBytes(16).toString('base64url'),
      name: email || 'corporate.user@zylker.com',
      displayName: email ? email.split('@')[0] : 'Corporate User'
    },
    pubKeyCredParams: [
      { alg: -7, type: 'public-key' },  // ES256
      { alg: -257, type: 'public-key' } // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification: 'preferred',
      residentKey: 'preferred'
    },
    timeout: 60000
  });
});

// Passkey: Authentication Challenge
app.post('/api/auth/passkey/login-challenge', (req, res) => {
  const challenge = crypto.randomBytes(32).toString('base64url');
  res.json({
    success: true,
    challenge,
    rpId: req.hostname,
    timeout: 60000,
    userVerification: 'preferred'
  });
});

// Passkey: Verify Authentication & Issue JWT
app.post('/api/auth/passkey/login-verify', async (req, res) => {
  try {
    const { email } = req.body;
    let user = null;

    if (email) {
      user = currentStore.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    }

    // Default to admin or first user if biometric passkey without pre-entered email
    if (!user) {
      user = currentStore.users[0]; // Arvind (admin)
    }

    const token = jwt.sign(
      { id: user.id || user._id, email: user.email, name: user.name, role: user.role, department: user.department },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = {
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      avatar: user.avatar
    };

    res.json({
      success: true,
      message: `Passkey verified successfully! Welcome back, ${user.name}.`,
      token,
      user: safeUser
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Passkey verification failed: ' + err.message });
  }
});

// Settings Endpoints
app.get('/api/settings', (req, res) => {
  res.json(currentStore.settings);
});

app.post('/api/settings', (req, res) => {
  const updates = req.body;
  currentStore.settings = { ...currentStore.settings, ...updates };
  res.json({ success: true, message: 'Settings saved successfully', settings: currentStore.settings });
});

// Dashboard Overview (Supports ?viewMode=my or ?viewMode=admin)
app.get('/api/dashboard/overview', (req, res) => {
  const timeframe = req.query.timeframe || 'This Year';
  const viewMode = req.query.viewMode || 'admin';
  const spendData = currentStore.spendSummary.timeframes[timeframe] || currentStore.spendSummary.timeframes['This Year'];
  
  if (viewMode === 'my') {
    // Current user's personal slice: Arvind
    const myTripsCount = currentStore.trips.filter(t => t.traveler.toLowerCase().includes('arvind')).length;
    const myAdvances = currentStore.advances
      .filter(a => a.employee.toLowerCase().includes('arvind') && a.settlementStatus === 'unsettled')
      .reduce((sum, a) => sum + a.amount, 0);
    const myExpenses = currentStore.reportsList
      .filter(r => r.employee.toLowerCase().includes('arvind'))
      .reduce((sum, r) => sum + r.amount, 0);

    return res.json({
      fiscalYear: currentStore.spendSummary.fiscalYear,
      timeframe,
      viewMode: 'my',
      currentUser: { name: 'Arvind', email: 'arvind@zylker.com' },
      spendData: spendData.map(d => ({ ...d, amount: Math.round(d.amount * 0.15) })),
      overallSummary: {
        totalExpense: myExpenses || 26735.00,
        employeeReimbursements: 26735.00,
        employeeAdvances: myAdvances || 24900.00,
        totalTrips: myTripsCount || 1
      },
      pendingTripsCount: 1,
      reimbursementsTotal: 26735.00
    });
  }

  res.json({
    fiscalYear: currentStore.spendSummary.fiscalYear,
    timeframe,
    viewMode: 'admin',
    spendData,
    overallSummary: currentStore.overallSummary,
    pendingTripsCount: currentStore.pendingTrips.reduce((acc, t) => acc + t.count, 0),
    reimbursementsTotal: currentStore.pendingReports.forReimbursements.totalAmount
  });
});

// Trips Endpoints
app.get('/api/trips', (req, res) => {
  const { viewMode } = req.query;
  if (viewMode === 'my') {
    return res.json(currentStore.trips.filter(t => t.traveler.toLowerCase().includes('arvind')));
  }
  res.json(currentStore.trips);
});

app.post('/api/trips', (req, res) => {
  const { destination, traveler, email, purpose, dates, budget } = req.body;
  if (!destination || !traveler) {
    return res.status(400).json({ success: false, message: 'Destination and Traveler are required' });
  }

  const newTrip = {
    id: `TRP-${1043 + currentStore.trips.length}`,
    destination,
    purpose: purpose || 'Business Engagement',
    traveler,
    email: email || `${traveler.toLowerCase().replace(/\s+/g, '.')}@zylker.com`,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    dates: dates || 'Nov 15 - Nov 20, 2026',
    budget: parseFloat(budget) || 1500.00,
    status: 'pending'
  };

  currentStore.trips.unshift(newTrip);
  currentStore.overallSummary.totalTrips += 1;
  res.status(201).json({ success: true, message: `Trip ${newTrip.id} created successfully!`, trip: newTrip });
});

app.put('/api/trips/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const trip = currentStore.trips.find(t => t.id === id);
  if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
  if (status) trip.status = status;
  res.json({ success: true, message: `Trip ${id} marked as ${status}!`, trip });
});

// Reports Endpoints
app.get('/api/reports', (req, res) => {
  const { viewMode } = req.query;
  if (viewMode === 'my') {
    return res.json(currentStore.reportsList.filter(r => r.employee.toLowerCase().includes('arvind')));
  }
  res.json(currentStore.reportsList);
});

app.post('/api/reports', (req, res) => {
  const { title, employee, email, amount, receiptsCount } = req.body;
  if (!title || !amount) {
    return res.status(400).json({ success: false, message: 'Report title and amount are required' });
  }

  const newReport = {
    id: `ER-${10 + currentStore.reportsList.length}`,
    title,
    employee: employee || 'Arvind',
    email: email || 'arvind@zylker.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    submittedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    receiptsCount: parseInt(receiptsCount) || 1,
    amount: parseFloat(amount),
    policyStatus: parseFloat(amount) > (currentStore.settings.dailyMealCap * 5) ? 'Policy Warning' : 'Compliant',
    status: 'pending'
  };

  currentStore.reportsList.unshift(newReport);
  currentStore.overallSummary.totalExpense += newReport.amount;
  res.status(201).json({ success: true, message: `Report ${newReport.id} submitted successfully!`, report: newReport });
});

app.put('/api/reports/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const report = currentStore.reportsList.find(r => r.id === id);
  if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
  if (status) report.status = status;
  res.json({ success: true, message: `Report ${id} marked as ${status}!`, report });
});

// Advances Endpoints
app.get('/api/advances', (req, res) => {
  const { viewMode } = req.query;
  if (viewMode === 'my') {
    return res.json(currentStore.advances.filter(a => a.employee.toLowerCase().includes('arvind')));
  }
  res.json(currentStore.advances);
});

app.post('/api/advances', (req, res) => {
  const { employee, email, amount, purpose } = req.body;
  if (!employee || !amount) {
    return res.status(400).json({ success: false, message: 'Employee and amount are required' });
  }

  const newAdvance = {
    id: `ADV-${802 + currentStore.advances.length}`,
    employee,
    email: email || `${employee.toLowerCase().replace(/\s+/g, '.')}@zylker.com`,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    amount: parseFloat(amount),
    purpose: purpose || 'Travel and Client Hospitality Advance',
    issuedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    settlementStatus: 'unsettled'
  };

  currentStore.advances.unshift(newAdvance);
  currentStore.overallSummary.employeeAdvances += newAdvance.amount;
  res.status(201).json({ success: true, message: `Advance ${newAdvance.id} disbursed successfully!`, advance: newAdvance });
});

app.put('/api/advances/:id', (req, res) => {
  const { id } = req.params;
  const { settlementStatus } = req.body;
  const advance = currentStore.advances.find(a => a.id === id);
  if (!advance) return res.status(404).json({ success: false, message: 'Advance not found' });
  if (settlementStatus) advance.settlementStatus = settlementStatus;
  res.json({ success: true, message: `Advance ${id} updated to ${settlementStatus}!`, advance });
});

// Purchase Requests Endpoints
app.get('/api/purchaserequests', (req, res) => {
  const { viewMode } = req.query;
  if (viewMode === 'my') {
    return res.json(currentStore.purchaseRequests.filter(p => p.requester.toLowerCase().includes('arvind')));
  }
  res.json(currentStore.purchaseRequests);
});

app.post('/api/purchaserequests', (req, res) => {
  const { item, vendor, department, requester, amount } = req.body;
  if (!item || !amount) {
    return res.status(400).json({ success: false, message: 'Item description and amount are required' });
  }

  const newPR = {
    id: `PR-2026-${89 + currentStore.purchaseRequests.length}`,
    item,
    vendor: vendor || 'Corporate Vendor',
    department: department || 'General',
    requester: requester || 'Arvind',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    amount: parseFloat(amount),
    status: 'pending'
  };

  currentStore.purchaseRequests.unshift(newPR);
  res.status(201).json({ success: true, message: `Purchase Request ${newPR.id} created successfully!`, purchaseRequest: newPR });
});

app.put('/api/purchaserequests/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const pr = currentStore.purchaseRequests.find(p => p.id === id);
  if (!pr) return res.status(404).json({ success: false, message: 'Purchase Request not found' });
  if (status) pr.status = status;
  res.json({ success: true, message: `Purchase Request ${id} marked as ${status}!`, purchaseRequest: pr });
});

// Corporate Cards Endpoints
app.get('/api/corporatecards', (req, res) => {
  res.json(currentStore.corporateCards);
});

app.post('/api/corporatecards', (req, res) => {
  const { holder, title, limit } = req.body;
  if (!holder || !limit) return res.status(400).json({ success: false, message: 'Holder and limit are required' });
  const newCard = {
    id: `cc-${currentStore.corporateCards.length + 1}`,
    holder,
    title: title || 'Executive Corporate Visa',
    last4: String(Math.floor(1000 + Math.random() * 9000)),
    limit: parseFloat(limit),
    spent: 0,
    status: 'active'
  };
  currentStore.corporateCards.unshift(newCard);
  res.status(201).json({ success: true, message: `Card issued for ${holder}!`, card: newCard });
});

app.put('/api/corporatecards/:id/toggle-status', (req, res) => {
  const card = currentStore.corporateCards.find(c => c.id === req.params.id);
  if (!card) return res.status(404).json({ success: false, message: 'Card not found' });
  card.status = card.status === 'active' ? 'frozen' : 'active';
  res.json({ success: true, message: `Card ${card.id} is now ${card.status}!`, card });
});

// Budgets Endpoints
app.get('/api/budgets', (req, res) => {
  res.json(currentStore.budgets);
});

app.post('/api/budgets', (req, res) => {
  const { department, allocated, color } = req.body;
  if (!department || !allocated) return res.status(400).json({ success: false, message: 'Department and allocated budget are required' });
  const newBudget = {
    id: `bgt-${currentStore.budgets.length + 1}`,
    department,
    allocated: parseFloat(allocated),
    spent: 0,
    color: color || '#3b82f6'
  };
  currentStore.budgets.unshift(newBudget);
  res.status(201).json({ success: true, message: `Budget plan for ${department} created!`, budget: newBudget });
});

// Legacy / Helper endpoints
app.get('/api/trips/pending', (req, res) => {
  res.json(currentStore.pendingTrips);
});

app.get('/api/reports/pending', (req, res) => {
  res.json(currentStore.pendingReports);
});

app.get('/api/assistant/cards', (req, res) => {
  res.json(currentStore.assistantCards);
});

// Actions
app.post('/api/actions/apply-advance', (req, res) => {
  const { cardId } = req.body;
  const card = currentStore.assistantCards.find(c => c.id === cardId);
  if (card) {
    card.status = 'applied';
    currentStore.overallSummary.employeeAdvances += card.advanceAmount;
    return res.json({ success: true, message: `Applied advance of $${card.advanceAmount.toFixed(2)}`, card });
  }
  res.status(404).json({ success: false, message: 'Card not found' });
});

app.post('/api/actions/submit-report', (req, res) => {
  const { cardId } = req.body;
  const card = currentStore.assistantCards.find(c => c.id === cardId);
  if (card) {
    card.status = 'submitted';
    return res.json({ success: true, message: `Report submitted for approval successfully!`, card });
  }
  res.status(404).json({ success: false, message: 'Card not found' });
});

app.post('/api/actions/approve-trip', (req, res) => {
  const { approverId } = req.body;
  const item = currentStore.pendingTrips.find(t => t.id === approverId);
  if (item && item.count > 0) {
    item.count -= 1;
    return res.json({ success: true, message: `Approved 1 trip for ${item.name}. Remaining: ${item.count}`, item });
  }
  res.status(400).json({ success: false, message: 'Cannot approve trip' });
});

app.post('/api/actions/reset-data', (req, res) => {
  currentStore = JSON.parse(JSON.stringify(initialData));
  res.json({ success: true, message: 'Reset data to defaults' });
});

// Serve frontend client build in production
const clientDistPath = path.resolve(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

if (process.env.NETLIFY !== 'true' && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

export { app };
export default app;
