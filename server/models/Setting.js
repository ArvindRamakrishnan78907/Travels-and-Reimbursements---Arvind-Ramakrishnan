import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema({
  key: { type: String, default: 'global_policy_config', unique: true },
  currency: { type: String, default: 'USD' },
  dailyMealCap: { type: Number, default: 75.00 },
  mileageRate: { type: Number, default: 0.67 },
  requireReceiptAbove: { type: Number, default: 25.00 },
  managerApprovalThreshold: { type: Number, default: 5000.00 },
  autoApproveLimit: { type: Number, default: 50.00 },
  updatedAt: { type: Date, default: Date.now }
});

export const Setting = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
