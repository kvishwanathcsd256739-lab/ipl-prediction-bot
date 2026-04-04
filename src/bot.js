require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const connectDB = require('../config/database');

// Import models
const User = require('../models/User');
const Prediction = require('../models/Prediction');
const Payment = require('../models/Payment');

// Initialize bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Connect to MongoDB on startup
connectDB();

console.log('🤖 IPL Prediction Bot initialized');

// ============= USER COMMANDS =============

// /start command
bot.start(async (ctx) => {
  const userId = ctx.from.id;
  const firstName = ctx.from.first_name;

  try {
    await User.findOneAndUpdate(
      { telegramId: userId },
      {
        telegramId: userId,
        username: ctx.from.username || '',
        firstName: firstName || 'User',
        lastName: ctx.from.last_name || '',
        'stats.lastActive': new Date()
      },
      { upsert: true }
    );

    const message = `🏏 *WELCOME TO IPL PREDICTION BOT* 🏏\n\n` +
                   `Hi ${firstName}! 👋\n\n` +
                   `I'm your cricket expert teacher:\n` +
                   `✅ I study IPL matches\n` +
                   `✅ I give expert predictions\n` +
                   `✅ I predict who will win\n\n` +
                   `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                   `📊 FREE ANALYSIS for everyone\n` +
                   `💎 PREMIUM PREDICTIONS (₹${(process.env.PAYMENT_AMOUNT || 4900) / 100})\n\n` +
                   `Choose an option below:`;

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('📊 Today\'s Free Analysis', 'today')],
        [Markup.button.callback('💎 Premium Prediction', 'premium')],
        [Markup.button.callback('ℹ️ About', 'about')]
      ])
    });
  } catch (error) {
    console.error('Error in /start:', error);
    await ctx.reply('❌ An error occurred. Please try again.');
  }
});

// /today command
bot.command('today', async (ctx) => {
  try {
    const prediction = await Prediction.findOne({ active: true }).sort({ matchDate: 1 });

    if (!prediction) {
      return ctx.reply('❌ No predictions available right now.');
    }

    const message = `🏏 *TODAY\'S MATCH*\n\n` +
                   `📊 *${prediction.team1} vs ${prediction.team2}*\n` +
                   `📅 ${prediction.matchDate.toLocaleDateString('en-IN')}\n\n` +
                   `Free analysis is available!\n\n` +
                   `💎 Unlock premium for winner prediction.`;

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(`💎 Unlock Premium (₹${(process.env.PAYMENT_AMOUNT || 4900) / 100})`, `pay_${prediction._id}`)]
      ])
    });
  } catch (error) {
    console.error('Error in /today:', error);
    await ctx.reply('❌ Error fetching prediction.');
  }
});

// /help command
bot.help((ctx) => {
  const message = `📚 *HELP & INSTRUCTIONS*\n\n` +
                 `*Available Commands:*\n` +
                 `/start - Start the bot\n` +
                 `/today - Today's match prediction\n` +
                 `/help - Show this help message\n\n` +
                 `*How to Use:*\n` +
                 `1. Click "Today's Free Analysis" for detailed insights\n` +
                 `2. Pay ₹${(process.env.PAYMENT_AMOUNT || 4900) / 100} to unlock premium prediction\n` +
                 `3. Get winner, toss, and key player predictions\n\n` +
                 `Questions? Contact admin.`;

  ctx.reply(message, { parse_mode: 'Markdown' });
});

// ============= BUTTON CALLBACKS =============

bot.action('today', async (ctx) => {
  try {
    const prediction = await Prediction.findOne({ active: true }).sort({ matchDate: 1 });

    if (!prediction) {
      return ctx.answerCbQuery('❌ No predictions available');
    }

    const message = `🏏 *TODAY\'S MATCH*\n\n` +
                   `📊 *${prediction.team1} vs ${prediction.team2}*\n` +
                   `📅 ${prediction.matchDate.toLocaleDateString('en-IN')}\n\n` +
                   `Free analysis is available!\n\n` +
                   `💎 Unlock premium for winner prediction.`;

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(`💎 Unlock Premium (₹${(process.env.PAYMENT_AMOUNT || 4900) / 100})`, `pay_${prediction._id}`)]
      ])
    });
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Error in today callback:', error);
    await ctx.answerCbQuery('❌ Error processing request');
  }
});

bot.action('about', async (ctx) => {
  const aboutMessage = `ℹ️ *ABOUT THIS BOT*\n\n` +
                      `This is your IPL cricket expert teacher!\n\n` +
                      `📊 We provide:\n` +
                      `✅ Free match analysis\n` +
                      `✅ Expert predictions\n` +
                      `✅ Winner predictions\n` +
                      `✅ Toss predictions\n\n` +
                      `💰 Premium cost: ₹${(process.env.PAYMENT_AMOUNT || 4900) / 100}/match\n\n` +
                      `Version: 1.0.0\n` +
                      `Made with ❤️ for cricket fans`;

  await ctx.reply(aboutMessage, { parse_mode: 'Markdown' });
  await ctx.answerCbQuery();
});

// ============= ADMIN COMMANDS =============

// /predictions command
bot.command('predictions', async (ctx) => {
  const userId = ctx.from.id;
  const adminId = parseInt(process.env.ADMIN_USER_ID);

  if (userId !== adminId) {
    return ctx.reply('❌ Admin only command!');
  }

  try {
    const predictions = await Prediction.find({ active: true }).limit(10);

    if (predictions.length === 0) {
      return ctx.reply('❌ No predictions found.');
    }

    let message = `📋 *ACTIVE PREDICTIONS*\n\n`;
    predictions.forEach((pred, index) => {
      message += `${index + 1}. ${pred.team1} vs ${pred.team2}\n`;
      message += `   📅 ${pred.matchDate.toLocaleDateString('en-IN')}\n`;
      message += `   🏆 Winner: ${pred.premium?.winner ?? 'N/A'}\n\n`;
    });

    await ctx.reply(message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error in /predictions:', error);
    await ctx.reply('❌ Error fetching predictions.');
  }
});

// /stats command
bot.command('stats', async (ctx) => {
  const userId = ctx.from.id;
  const adminId = parseInt(process.env.ADMIN_USER_ID);

  if (userId !== adminId) {
    return ctx.reply('❌ Admin only command!');
  }

  try {
    const totalUsers = await User.countDocuments();
    const totalPredictions = await Prediction.countDocuments();
    const totalPayments = await Payment.countDocuments({ status: 'verified' });

    const message = `📊 *BOT STATISTICS*\n\n` +
                   `👥 Total Users: ${totalUsers}\n` +
                   `📝 Total Predictions: ${totalPredictions}\n` +
                   `💰 Verified Payments: ${totalPayments}\n`;

    await ctx.reply(message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error in /stats:', error);
    await ctx.reply('❌ Error fetching statistics.');
  }
});

// ============= ERROR HANDLING =============

bot.catch((err, ctx) => {
  console.error('Bot error:', err);
});

// ============= STARTUP =============

console.log('✅ User handler active');
console.log('✅ Admin handler active');
console.log('🏏 IPL Prediction Bot Started!');
console.log('📱 Waiting for messages...');

module.exports = bot;
