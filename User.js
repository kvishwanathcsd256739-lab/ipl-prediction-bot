const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegramId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  username: String,
  firstName: String,
  lastName: String,
  
  // Payment tracking
  payments: [{
    predictionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prediction'
    },
    amount: Number,
    paymentDate: Date,
    transactionId: String,
    verified: {
      type: Boolean,
      default: false
    }
  }],
  
  // Weekly subscription
  weeklySubscription: {
    active: {
      type: Boolean,
      default: false
    },
    startDate: Date,
    endDate: Date,
    amount: Number
  },
  
  // User statistics
  stats: {
    totalPredictionsViewed: {
      type: Number,
      default: 0
    },
    totalPayments: {
      type: Number,
      default: 0
    },
    lastActive: Date
  }
}, {
  timestamps: true
});

// Method to check if user has access to premium prediction
userSchema.methods.hasPremiumAccess = function(predictionId) {
  // Check weekly subscription
  if (this.weeklySubscription.active) {
    const now = new Date();
    if (now >= this.weeklySubscription.startDate && now <= this.weeklySubscription.endDate) {
      return true;
    }
  }
  
  // Check individual payment for this prediction
  const payment = this.payments.find(p => 
    p.predictionId.toString() === predictionId.toString() && p.verified
  );
  
  return !!payment;
};

module.exports = mongoose.model('User', userSchema);
