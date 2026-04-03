const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  matchId: {
    type: String,
    required: true,
    unique: true,
  },
  team1: String,
  team2: String,
  venue: String,
  date: Date,
  premiumPrediction: {
    winner: String,
    tossWinner: String,
    keyPlayer: String,
    confidence: String,
  },
  freeAnalysis: {
    teamForm: String,
    pitchReport: String,
    weather: String,
    headToHead: String,
    venueAdvantage: String,
  },
  adminId: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Prediction', predictionSchema);