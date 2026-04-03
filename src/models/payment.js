const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  telegramId: Number,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  amount: Number,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: Date,
  verifiedAt: Date,
});

module.exports = mongoose.model('Payment', paymentSchema);