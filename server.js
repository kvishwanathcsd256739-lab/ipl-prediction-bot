require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const { getTodaysMatches } = require('./src/utils/schedule');
const { analyzeMatch, generateApiReport, formatAnalyticsApiResponse } = require('./src/analytics');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in .env');
    }

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connected successfully!');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    return false;
  }
};

// Start Server
const startServer = async () => {
  try {
    // Connect to DB first
    const dbConnected = await connectDB();
    
    if (!dbConnected) {
      console.error('Failed to connect to MongoDB');
      process.exit(1);
    }

    // Now load handlers
    const userHandler = require('./src/handlers/userhandler');
    const adminHandler = require('./src/handlers/adminhandler');
    const webhookRoutes = require('./src/routes/webhookRoutes');

    // Routes
    app.use('/webhook', webhookRoutes);

    app.get('/health', (req, res) => {
      res.json({ status: 'Bot is running! 🏏' });
    });

    // ── Analytics endpoints ────────────────────────────────────────────────

    // GET /analytics/today  — predictions for today's (or next) matches
    app.get('/analytics/today', (req, res) => {
      try {
        const { matches } = getTodaysMatches();
        const report = generateApiReport(matches);
        res.json({ success: true, count: report.length, matches: report });
      } catch (err) {
        res.status(500).json({ success: false, error: err.message });
      }
    });

    // GET /analytics/match?team1=CSK&team2=MI&venue=Chennai&date=2026-04-05&time=19:30
    app.get('/analytics/match', (req, res) => {
      try {
        const { team1, team2, venue = 'Unknown', date = '', time = '19:30' } = req.query;
        if (!team1 || !team2) {
          return res.status(400).json({ success: false, error: 'team1 and team2 are required' });
        }
        // Note: when venue is omitted, a balanced/default venue profile is used for analytics
        const analytics = analyzeMatch({ team1, team2, venue, date, time });
        res.json({ success: true, data: formatAnalyticsApiResponse(analytics) });
      } catch (err) {
        res.status(500).json({ success: false, error: err.message });
      }
    });

    // Launch bot handlers
    userHandler.launch();
   // adminHandler.launch();

    console.log('🏏 IPL Prediction Bot Started!');
    console.log('✅ User handler active');
    console.log('✅ Admin handler active');

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });

    process.on('SIGINT', () => {
      console.log('🛑 Bot shutting down...');
      userHandler.stop();
      adminHandler.stop();
      process.exit(0);
    });

  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

// Start everything
startServer();