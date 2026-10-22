import mongoose from 'mongoose';
import { Trip } from '../models/Trip.js';
import { Report } from '../models/Report.js';
import { Advance } from '../models/Advance.js';
import { PurchaseRequest } from '../models/PurchaseRequest.js';
import { Setting } from '../models/Setting.js';

export async function connectDB(mongoUri) {
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500
    });
    console.log(`[MERN Stack] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    await seedMongoDatabase();
    return true;
  } catch (err) {
    console.warn(`[MERN Stack] Local/Remote MongoDB instance not reachable (${err.message}).`);
    console.log(`[MERN Stack] Providing active in-memory store adapter to guarantee zero-downtime development.`);
    return false;
  }
}

async function seedMongoDatabase() {
  try {
    // Seed Settings if empty
    const settingsCount = await Setting.countDocuments();
    if (settingsCount === 0) {
      await Setting.create({
        key: 'global_policy_config',
        currency: 'USD',
        dailyMealCap: 75.00,
        mileageRate: 0.67,
        requireReceiptAbove: 25.00,
        managerApprovalThreshold: 5000.00,
        autoApproveLimit: 50.00
      });
      console.log('[MERN Stack] Seeded default Organization Settings into MongoDB.');
    }

    // Seed Trips if empty
    const tripsCount = await Trip.countDocuments();
    if (tripsCount === 0) {
      await Trip.insertMany([
        {
          id: 'TRP-1042',
          destination: 'London, United Kingdom',
          purpose: 'Global Partner Conference',
          traveler: 'Aditya Verma',
          email: 'aditya.v@zylker.com',
          dates: 'Oct 18 - Oct 23, 2026',
          budget: 2850.00,
          status: 'pending'
        },
        {
          id: 'TRP-1041',
          destination: 'Singapore',
          purpose: 'APAC Regional Client Summit',
          traveler: 'Arvind',
          email: 'arvind@zylker.com',
          dates: 'Nov 02 - Nov 06, 2026',
          budget: 1950.00,
          status: 'approved'
        },
        {
          id: 'TRP-1039',
          destination: 'San Francisco, USA',
          purpose: 'Tech Architecture Summit',
          traveler: 'Karthik Kumar',
          email: 'karthik.kumar@zylker.com',
          dates: 'Sep 10 - Sep 15, 2026',
          budget: 3400.00,
          status: 'completed'
        }
      ]);
      console.log('[MERN Stack] Seeded default Business Trips into MongoDB.');
    }

    // Seed Reports if empty
    const reportsCount = await Report.countDocuments();
    if (reportsCount === 0) {
      await Report.insertMany([
        {
          id: 'ER-09',
          title: 'Trip to Singapore Client Onboarding',
          employee: 'Arvind',
          email: 'arvind@zylker.com',
          submittedDate: 'May 12, 2026',
          receiptsCount: 4,
          amount: 322.12,
          policyStatus: 'Compliant',
          status: 'pending'
        },
        {
          id: 'ER-07',
          title: 'Quarterly Sales Executive Dinners',
          employee: 'Karthik Narayanan',
          email: 'karthik.n@zylker.com',
          submittedDate: 'May 14, 2026',
          receiptsCount: 8,
          amount: 1232.48,
          policyStatus: 'Compliant',
          status: 'pending'
        }
      ]);
      console.log('[MERN Stack] Seeded default Expense Reports into MongoDB.');
    }
  } catch (seedErr) {
    console.error('[MERN Stack] Seeding error:', seedErr);
  }
}
