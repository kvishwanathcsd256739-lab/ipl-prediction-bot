require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Start Server
const startServer = async () => {
  try {
    // Load the bot (it connects to MongoDB internally via connectDB())
    const bot = require('./src/bot');
    const webhookRoutes = require('./src/routes/webhookRoutes');

    // Routes
    app.use('/webhook', webhookRoutes);

    app.get('/health', (req, res) => {
      res.json({ status: 'Bot is running! 🏏' });
    });

    // Launch single bot instance
    bot.launch();
    console.log('🏏 IPL Prediction Bot Started!');
    console.log('📱 Waiting for messages...');

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });

    process.on('SIGINT', () => {
      console.log('🛑 Bot shutting down...');
      bot.stop('SIGINT');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('🛑 Bot shutting down...');
      bot.stop('SIGTERM');
      process.exit(0);
    });

  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

// Start everything
startServer();
