const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    index: true
  },
  predictionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prediction',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['single', 'weekly'],
    default: 'single'
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'expired'],
    default: 'pending'
  },
  transactionId: String,
  qrCodeUrl: String,
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
  }
}, {
  timestamps: true
});

// Index for cleanup of expired payments
paymentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Payment', paymentSchema);
