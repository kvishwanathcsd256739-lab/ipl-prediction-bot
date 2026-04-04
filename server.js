require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const {
  generateMatchDashboard,
  generateSeasonDashboard,
  exportStandingsCSV,
  exportPredictionCSV,
} = require('./src/analytics/reportGenerator');
const {
  calculateWinProbability,
  predictScore,
  getHeadToHeadStats,
  getSeasonSummary,
  IPL_TEAMS,
  VENUE_STATS,
} = require('./src/analytics/matchAnalytics');

const ALLOWED_TEAMS = new Set(IPL_TEAMS);
const ALLOWED_VENUES = new Set(Object.keys(VENUE_STATS));

/**
 * Sanitize an HTML string by escaping special characters to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Validate and return a safe team name from query params.
 * Falls back to defaultValue if the provided value is not in ALLOWED_TEAMS.
 * @param {string|undefined} value
 * @param {string} defaultValue
 * @returns {string}
 */
function safeTeam(value, defaultValue) {
  const upper = value ? String(value).toUpperCase() : defaultValue;
  return ALLOWED_TEAMS.has(upper) ? upper : defaultValue;
}

/**
 * Validate and return a safe venue name from query params.
 * Falls back to defaultValue if the provided value is not in ALLOWED_VENUES.
 * @param {string|undefined} value
 * @param {string} defaultValue
 * @returns {string}
 */
function safeVenue(value, defaultValue) {
  if (!value) return defaultValue;
  const sanitized = String(value);
  return ALLOWED_VENUES.has(sanitized) ? sanitized : defaultValue;
}

/**
 * Validate and return a safe date string for display.
 * Accepts YYYY-MM-DD format only. Falls back to current date otherwise.
 * @param {string|undefined} value
 * @returns {string}
 */
function safeDate(value) {
  if (!value) return new Date().toLocaleDateString('en-IN');
  const str = String(value).trim();
  // Accept only YYYY-MM-DD format and validate as a real date
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const parsed = new Date(str);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('en-IN');
    }
  }
  return new Date().toLocaleDateString('en-IN');
}

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

// ─── ANALYTICS API ROUTES ────────────────────────────────────────────────────

/**
 * GET /analytics/dashboard?team1=CSK&team2=MI&venue=Chennai
 * Returns an HTML match prediction dashboard
 */
app.get('/analytics/dashboard', (req, res) => {
  const team1 = safeTeam(req.query.team1, 'CSK');
  const team2 = safeTeam(req.query.team2, 'MI');
  const venue = safeVenue(req.query.venue, 'Chennai');
  const date = safeDate(req.query.date);

  const prob = calculateWinProbability(team1, team2, venue);
  const s1 = predictScore(team1, venue, true);
  const s2 = predictScore(team2, venue, false);
  const h2h = getHeadToHeadStats(team1, team2);

  const html = generateMatchDashboard({
    team1: escapeHtml(team1),
    team2: escapeHtml(team2),
    venue: escapeHtml(venue),
    date: escapeHtml(date),
    team1WinProb: prob.team1Prob,
    team2WinProb: prob.team2Prob,
    predictedWinner: escapeHtml(prob.team1Prob >= prob.team2Prob ? team1 : team2),
    confidence: Math.max(prob.team1Prob, prob.team2Prob),
    team1Score: s1.predicted,
    team2Score: s2.predicted,
    tossWinner: escapeHtml(team1),
    keyPlayer: 'Top performer TBD',
    h2h: { wins1: h2h.wins1, wins2: h2h.wins2, total: h2h.total },
  });

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

/**
 * GET /analytics/season
 * Returns an HTML season standings dashboard
 */
app.get('/analytics/season', (req, res) => {
  const standings = getSeasonSummary();
  const html = generateSeasonDashboard(standings);
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

/**
 * GET /analytics/export/standings
 * Returns CSV export of season standings
 */
app.get('/analytics/export/standings', (req, res) => {
  const standings = getSeasonSummary();
  const csv = exportStandingsCSV(standings);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="ipl_2025_standings.csv"');
  res.send(csv);
});

/**
 * GET /analytics/export/prediction?team1=CSK&team2=MI&venue=Chennai
 * Returns CSV export of a match prediction
 */
app.get('/analytics/export/prediction', (req, res) => {
  const team1 = safeTeam(req.query.team1, 'CSK');
  const team2 = safeTeam(req.query.team2, 'MI');
  const venue = safeVenue(req.query.venue, 'Chennai');
  const date = safeDate(req.query.date);

  const prob = calculateWinProbability(team1, team2, venue);
  const s1 = predictScore(team1, venue, true);
  const s2 = predictScore(team2, venue, false);

  const csv = exportPredictionCSV({
    team1,
    team2,
    venue,
    date,
    team1WinProb: prob.team1Prob,
    team2WinProb: prob.team2Prob,
    predictedWinner: prob.team1Prob >= prob.team2Prob ? team1 : team2,
    confidence: Math.max(prob.team1Prob, prob.team2Prob),
    team1Score: s1.predicted,
    team2Score: s2.predicted,
    tossWinner: team1,
    keyPlayer: 'Top performer TBD',
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${team1}_vs_${team2}_prediction.csv"`
  );
  res.send(csv);
});

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

    // Launch bot handlers
    userHandler.launch();
   // adminHandler.launch();

    console.log('🏏 IPL Prediction Bot Started!');
    console.log('✅ User handler active');
    console.log('✅ Admin handler active');
    console.log('📊 Analytics endpoints: /analytics/dashboard, /analytics/season');

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