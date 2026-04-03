require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const connectDB = require('../config/database');
const AdminController = require('./controllers/adminController');
const UserController = require('./controllers/userController');

// Initialize bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Connect to database
connectDB();

// Initialize controllers
const adminController = new AdminController(bot);
const userController = new UserController(bot);

// Command handlers
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const user = await userController.getOrCreateUser(msg.from);
  await userController.sendWelcome(chatId, user);
});

bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  await userController.showHelp(chatId);
});

bot.onText(/\/today/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  await userController.getTodayPrediction(chatId, userId);
});

bot.onText(/\/matches/, async (msg) => {
  const chatId = msg.chat.id;
  await userController.showAllMatches(chatId);
});

// Admin commands
bot.onText(/\/addprediction/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  await adminController.startAddPrediction(chatId, userId);
});

bot.onText(/\/save/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  await adminController.savePrediction(chatId, userId);
});

bot.onText(/\/skip/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  await adminController.savePrediction(chatId, userId);
});

bot.onText(/\/predictions/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  await adminController.listPredictions(chatId, userId);
});

bot.onText(/\/stats/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  await adminController.getStats(chatId, userId);
});

// Handle text messages (for admin prediction steps)
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;

  // Skip if it's a command
  if (text && text.startsWith('/')) return;

  // Check if admin is in prediction creation flow
  if (adminController.tempPredictionData[userId]) {
    await adminController.handlePredictionStep(chatId, userId, text);
  }
});

// Callback query handlers
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const data = query.data;

  try {
    // Answer callback query to remove loading state
    await bot.answerCallbackQuery(query.id);

    // Route callbacks
    if (data === 'today') {
      await userController.getTodayPrediction(chatId, userId);
    }
    else if (data === 'all_matches') {
      await userController.showAllMatches(chatId);
    }
    else if (data === 'help') {
      await userController.showHelp(chatId);
    }
    else if (data.startsWith('pay_')) {
      const predictionId = data.split('_')[1];
      await userController.initiatePayment(chatId, userId, predictionId);
    }
    else if (data.startsWith('paid_')) {
      const paymentId = data.split('_')[1];
      await userController.handlePaymentConfirmation(chatId, userId, paymentId);
    }
    else if (data.startsWith('verify_')) {
      const paymentId = data.split('_')[1];
      await userController.verifyPayment(chatId, userId, paymentId);
    }
    else if (data.startsWith('reject_')) {
      const paymentId = data.split('_')[1];
      await bot.sendMessage(chatId, '❌ Payment rejected. User will be notified.');
      // TODO: Notify user about rejection
    }
    else if (data.startsWith('view_')) {
      const predictionId = data.split('_')[1];
      await userController.getTodayPrediction(chatId, userId);
    }
    else if (data === 'cancel_payment') {
      await bot.sendMessage(chatId, '❌ Payment cancelled.');
    }

  } catch (error) {
    console.error('Error handling callback:', error);
    await bot.sendMessage(chatId, '❌ An error occurred. Please try again.');
  }
});

// Error handling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});

console.log('🤖 IPL Prediction Bot is running...');
console.log('📱 Waiting for messages...');

module.exports = bot;
