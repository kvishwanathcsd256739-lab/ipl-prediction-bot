const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  matchDate: {
    type: Date,
    required: true,
    index: true
  },
  team1: {
    type: String,
    required: true
  },
  team2: {
    type: String,
    required: true
  },

  // Premium predictions (owner's picks)
  premium: {
    winner: String,
    tossWinner: String,
    keyPlayer: String,
    confidence: Number, // 0-100
    additionalNotes: String
  },

  // Free analysis data
  freeAnalysis: {
    team1Form: [String], // Last 5 matches: ['W', 'L', 'W', 'W', 'L']
    team2Form: [String],

    team1Players: [{
      name: String,
      role: String,
      form: String
    }],
    team2Players: [{
      name: String,
      role: String,
      form: String
    }],

    pitchReport: {
      type: String,
      battingFriendly: Boolean,
      spinnerFriendly: Boolean
    },

    weather: {
      condition: String,
      rainChance: Number
    },

    headToHead: {
      totalMatches: Number,
      team1Wins: Number,
      team2Wins: Number
    },

    venueAdvantage: String,
    tossTrend: String,

    teamStrength: {
      batting: String, // team1 or team2
      bowling: String,
      balance: String
    },

    starPlayers: [String],
    playerPredictions: [String],
    milestones: [String],
    matchFlowPredictions: [String],
    riskFactors: [String],
    teamInsights: [String],
    bonusInsights: [String]
  },

  active: {
    type: Boolean,
    default: true
  },

  createdBy: {
    type: Number, // Telegram user ID
    required: true
  }
}, {
  timestamps: true
});

// Index for finding today's prediction
predictionSchema.index({ matchDate: 1, active: 1 });

module.exports = mongoose.model('Prediction', predictionSchema);
