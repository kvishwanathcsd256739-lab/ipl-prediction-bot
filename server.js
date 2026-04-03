require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

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