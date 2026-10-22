import mongoose from 'mongoose';

const TripSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  destination: { type: String, required: true },
  purpose: { type: String, default: 'Business Engagement' },
  traveler: { type: String, required: true },
  email: { type: String, required: true },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop' },
  dates: { type: String, required: true },
  budget: { type: Number, required: true, default: 0 },
  status: { type: String, enum: ['pending', 'approved', 'completed', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export const Trip = mongoose.models.Trip || mongoose.model('Trip', TripSchema);
