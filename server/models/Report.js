import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  employee: { type: String, required: true },
  email: { type: String, required: true },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop' },
  submittedDate: { type: String, required: true },
  receiptsCount: { type: Number, default: 1 },
  amount: { type: Number, required: true, default: 0 },
  policyStatus: { type: String, default: 'Compliant' },
  status: { type: String, enum: ['pending', 'in-review', 'reimbursed', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export const Report = mongoose.models.Report || mongoose.model('Report', ReportSchema);
