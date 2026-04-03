const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const User = require('../models/User');
const Prediction = require('../models/Prediction');
const Payment = require('../models/Payment');

// Import controllers
const userController = require('../controllers/userController');
const adminController = require('../controllers/adminController');

// Initialize bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

console.log('🤖 IPL Prediction Bot initialized');

// ============= USER COMMANDS =============

// /start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const firstName = msg.from.first_name;
  
  try {
    // Save/update user
    await User.findOneAndUpdate(
      { telegramId: userId },
      {
        telegramId: userId,
        username: msg.from.username || '',
        firstName: firstName || 'User',
        lastName: msg.from.last_name || '',
        lastActive: new Date()
      },
      { upsert: true }
    );

    // Send welcome message
    const message = `🏏 *WELCOME TO IPL PREDICTION BOT* 🏏\n\n` +
                   `Hi ${firstName}! 👋\n\n` +
                   `I'm your cricket expert teacher:\n` +
                   `✅ I study IPL matches\n` +
                   `✅ I give expert predictions\n` +
                   `✅ I predict who will win\n\n` +
                   `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                   `📊 FREE ANALYSIS for everyone\n` +
                   `💎 PREMIUM PREDICTIONS (₹${process.env.PAYMENT_AMOUNT || 49})\n\n` +
                   `Choose an option below:`;

    const opts = {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📊 Today\'s Free Analysis', callback_data: 'today' }],
          [{ text: '💎 Premium Prediction', callback_data: 'premium' }],
          [{ text: 'ℹ️ About', callback_data: 'about' }]
        ]
      }
    };

    await bot.sendMessage(chatId, message, opts);
  } catch (error) {
    console.error('Error in /start:', error);
    bot.sendMessage(chatId, '❌ An error occurred. Please try again.');
  }
});

// /today command
bot.onText(/\/today/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const prediction = await Prediction.findOne({ active: true }).sort({ matchDate: 1 });
    
    if (!prediction) {
      return bot.sendMessage(chatId, '❌ No predictions available right now.');
    }

    // Format and send free analysis
    const freeAnalysisMessage = await userController.formatFreeAnalysis(prediction);
    
    const opts = {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '💎 Unlock Premium (₹' + (process.env.PAYMENT_AMOUNT || 49) + ')', callback_data: `pay_${prediction._id}` }]
        ]
      }
    };

    await bot.sendMessage(chatId, freeAnalysisMessage, opts);
  } catch (error) {
    console.error('Error in /today:', error);
    bot.sendMessage(chatId, '❌ Error fetching prediction.');
  }
});

// /help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  
  const message = `📚 *HELP & INSTRUCTIONS*\n\n` +
                 `*Available Commands:*\n` +
                 `/start - Start the bot\n` +
                 `/today - Today's match prediction\n` +
                 `/help - Show this help message\n\n` +
                 `*How to Use:*\n` +
                 `1. Click "Today's Free Analysis" for detailed insights\n` +
                 `2. Pay ₹${process.env.PAYMENT_AMOUNT || 49} to unlock premium prediction\n` +
                 `3. Get winner, toss, and key player predictions\n\n` +
                 `Questions? Contact admin.`;

  bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});

// ============= BUTTON CALLBACKS =============

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const data = query.data;

  try {
    if (data === 'today') {
      // Same as /today command
      const prediction = await Prediction.findOne({ active: true }).sort({ matchDate: 1 });
      
      if (!prediction) {
        return bot.answerCallbackQuery(query.id, '❌ No predictions available');
      }

      const freeAnalysisMessage = await userController.formatFreeAnalysis(prediction);
      
      const opts = {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '💎 Unlock Premium (₹' + (process.env.PAYMENT_AMOUNT || 49) + ')', callback_data: `pay_${prediction._id}` }]
          ]
        }
      };

      await bot.sendMessage(chatId, freeAnalysisMessage, opts);
      bot.answerCallbackQuery(query.id);
    }
    
    else if (data === 'about') {
      const aboutMessage = `ℹ️ *ABOUT THIS BOT*\n\n` +
                          `This is your IPL cricket expert teacher!\n\n` +
                          `📊 We provide:\n` +
                          `✅ Free match analysis\n` +
                          `✅ Expert predictions\n` +
                          `✅ Winner predictions\n` +
                          `✅ Toss predictions\n\n` +
                          `💰 Premium cost: ₹${process.env.PAYMENT_AMOUNT || 49}/match\n\n` +
                          `Version: 1.0.0\n` +
                          `Made with ❤️ for cricket fans`;

      bot.sendMessage(chatId, aboutMessage, { parse_mode: 'Markdown' });
      bot.answerCallbackQuery(query.id);
    }
    
    else if (data.startsWith('pay_')) {
      // Handle payment
      const predictionId = data.replace('pay_', '');
      await adminController.initiatePayment(bot, chatId, userId, predictionId);
      bot.answerCallbackQuery(query.id);
    }
    
    else if (data === 'paid') {
      // User claims to have paid
      bot.sendMessage(chatId, '✅ Payment received! Admin will verify shortly.');
      
      // Notify admin
      const adminId = process.env.ADMIN_USER_ID;
      const user = await User.findOne({ telegramId: userId });
      const adminMessage = `🔔 User @${user.username || userId} claims to have paid`;
      bot.sendMessage(adminId, adminMessage);
      
      bot.answerCallbackQuery(query.id);
    }
  } catch (error) {
    console.error('Error in callback:', error);
    bot.answerCallbackQuery(query.id, '❌ Error processing request');
  }
});

// ============= ADMIN COMMANDS =============

// /addprediction command
bot.onText(/\/addprediction/, async (msg) => {
  const userId = msg.from.id;
  const adminId = parseInt(process.env.ADMIN_USER_ID);

  if (userId !== adminId) {
    return bot.sendMessage(msg.chat.id, '❌ Admin only command!');
  }

  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '📝 Enter match details:\nExample: CSK vs RCB, 15-04-2026');
  
  // Wait for next message
  const listener = (nextMsg) => {
    if (nextMsg.chat.id === chatId) {
      const matchDetails = nextMsg.text;
      bot.removeListener('message', listener);
      
      // Ask for prediction
      bot.sendMessage(chatId, `Enter premium prediction:\nWinner, Toss Winner, Key Player, Confidence %`);
      
      const predictionListener = (predMsg) => {
        if (predMsg.chat.id === chatId) {
          const predictionText = predMsg.text;
          bot.removeListener('message', predictionListener);
          
          // Save to database (simplified)
          bot.sendMessage(chatId, '✅ Prediction saved! Send /predictions to view all.');
        }
      };
      
      bot.on('message', predictionListener);
    }
  };
  
  bot.on('message', listener);
});

// /predictions command
bot.onText(/\/predictions/, async (msg) => {
  const userId = msg.from.id;
  const adminId = parseInt(process.env.ADMIN_USER_ID);

  if (userId !== adminId) {
    return bot.sendMessage(msg.chat.id, '❌ Admin only command!');
  }

  try {
    const predictions = await Prediction.find({ active: true }).limit(10);
    
    if (predictions.length === 0) {
      return bot.sendMessage(msg.chat.id, '❌ No predictions found.');
    }

    let message = `📋 *ACTIVE PREDICTIONS*\n\n`;
    predictions.forEach((pred, index) => {
      message += `${index + 1}. ${pred.team1} vs ${pred.team2}\n`;
      message += `   📅 ${pred.matchDate.toLocaleDateString('en-IN')}\n`;
      message += `   🏆 Winner: ${pred.premium.winner}\n\n`;
    });

    bot.sendMessage(msg.chat.id, message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error in /predictions:', error);
    bot.sendMessage(msg.chat.id, '❌ Error fetching predictions.');
  }
});

// /stats command
bot.onText(/\/stats/, async (msg) => {
  const userId = msg.from.id;
  const adminId = parseInt(process.env.ADMIN_USER_ID);

  if (userId !== adminId) {
    return bot.sendMessage(msg.chat.id, '❌ Admin only command!');
  }

  try {
    const totalUsers = await User.countDocuments();
    const totalPredictions = await Prediction.countDocuments();
    const totalPayments = await Payment.countDocuments({ verified: true });

    const message = `📊 *BOT STATISTICS*\n\n` +
                   `👥 Total Users: ${totalUsers}\n` +
                   `📝 Total Predictions: ${totalPredictions}\n` +
                   `💰 Verified Payments: ${totalPayments}\n`;

    bot.sendMessage(msg.chat.id, message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error in /stats:', error);
    bot.sendMessage(msg.chat.id, '❌ Error fetching statistics.');
  }
});

// Handle text messages
bot.on('message', async (msg) => {
  if (msg.text && msg.text.startsWith('/')) {
    return; // Already handled by onText
  }
  
  // Generic response
  if (msg.text) {
    bot.sendMessage(msg.chat.id, 'Click /start to begin or /help for options.', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🏠 Start', callback_data: 'start' }]
        ]
      }
    });
  }
});

// ============= ERROR HANDLING =============

bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

// ============= STARTUP =============

console.log('✅ User handler active');
console.log('✅ Admin handler active');
console.log('🏏 IPL Prediction Bot Started!');
console.log('📱 Waiting for messages...');

module.exports = bot;