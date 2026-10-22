import mongoose from 'mongoose';

const PurchaseRequestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  item: { type: String, required: true },
  vendor: { type: String, required: true },
  department: { type: String, default: 'General' },
  requester: { type: String, required: true },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop' },
  amount: { type: Number, required: true, default: 0 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export const PurchaseRequest = mongoose.models.PurchaseRequest || mongoose.model('PurchaseRequest', PurchaseRequestSchema);
