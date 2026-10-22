import mongoose from 'mongoose';

const AdvanceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  employee: { type: String, required: true },
  email: { type: String, required: true },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop' },
  amount: { type: Number, required: true, default: 0 },
  purpose: { type: String, default: 'Travel Advance' },
  issuedDate: { type: String, required: true },
  settlementStatus: { type: String, enum: ['unsettled', 'settled', 'partially-settled'], default: 'unsettled' },
  createdAt: { type: Date, default: Date.now }
});

export const Advance = mongoose.models.Advance || mongoose.model('Advance', AdvanceSchema);
