require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const connectDB = require('./config/database');

// Import models
const User = require('./models/user');
const Prediction = require('./models/Prediction');
const Payment = require('./models/payment');

// Import utilities
const { generateFreeAnalysis, formatPremiumPrediction, IPL_TEAMS, VENUES, CONFIDENCE_LEVELS } = require('./utils/analytics');
const { createOrder } = require('./utils/razorpay');

// Initialize bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Connect to MongoDB on startup
connectDB();

// Admin state machine storage
const adminStates = {};

// Price helpers
const PRICE_PAISE = parseInt(process.env.PAYMENT_AMOUNT) || 4900;
const PRICE_RS = PRICE_PAISE / 100;

// Sample match data for free analysis (used when no DB prediction exists)
const SAMPLE_MATCH = {
  team1: 'CSK',
  team2: 'MI',
  venue: 'Chennai',
  date: new Date().toISOString().slice(0, 10),
  team1Form: '✅ W | ✅ W | ✅ W | ❌ L | ✅ W',
  team2Form: '❌ L | ✅ W | ❌ L | ✅ W | ✅ W',
  team1Stars: 'Ruturaj, Dube, Jadeja',
  team2Stars: 'Rohit, Bumrah, Hardik',
  pitchReport: 'Good batting surface',
  weather: 'Clear ☀️',
  h2hTotal: '32',
  team1H2hWins: '20',
  team2H2hWins: '12',
  venueAdvantage: 'CSK dominates at Chepauk',
  tossTrend: 'Teams prefer chasing',
  battingStrong: 'MI',
  bowlingStrong: 'CSK',
  powPlayScore: '50-65',
  expectedTotal: '170-185',
};

// ============= USER COMMANDS =============

// /start command
bot.start(async (ctx) => {
  const userId = ctx.from.id;
  const firstName = ctx.from.first_name || 'User';

  try {
    await User.findOneAndUpdate(
      { telegramId: userId },
      {
        telegramId: userId,
        username: ctx.from.username || '',
        chatId: ctx.chat.id,
        updatedAt: new Date(),
      },
      { upsert: true }
    );

    const message = `🏏 *WELCOME TO IPL PREDICTION BOT* 🏏\n\n` +
                   `Hi ${firstName}! 👋\n\n` +
                   `I'm your cricket expert:\n` +
                   `✅ I study IPL matches\n` +
                   `✅ I give expert predictions\n` +
                   `✅ I predict who will win\n\n` +
                   `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                   `📊 FREE ANALYSIS for everyone\n` +
                   `💎 PREMIUM PREDICTIONS (₹${PRICE_RS})\n\n` +
                   `Choose an option below:`;

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('📊 Today\'s Free Analysis', 'free_analysis')],
        [Markup.button.callback(`💎 Premium Prediction (₹${PRICE_RS})`, 'premium_unlock')],
        [Markup.button.callback('ℹ️ About', 'about')],
      ]),
    });
  } catch (error) {
    console.error('Error in /start:', error);
    await ctx.reply('❌ An error occurred. Please try again.');
  }
});

// /today command
bot.command('today', async (ctx) => {
  try {
    const prediction = await Prediction.findOne().sort({ createdAt: -1 });

    if (!prediction) {
      return ctx.reply('❌ No predictions available right now. Check back soon!');
    }

    const matchDateStr = prediction.date
      ? new Date(prediction.date).toLocaleDateString('en-IN')
      : 'Today';

    const message = `🏏 *TODAY\'S MATCH*\n\n` +
                   `📊 *${prediction.team1} vs ${prediction.team2}*\n` +
                   `📅 ${matchDateStr}\n\n` +
                   `Free analysis is available!\n\n` +
                   `💎 Unlock premium for winner prediction.`;

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('📊 Free Analysis', 'free_analysis')],
        [Markup.button.callback(`💎 Unlock Premium (₹${PRICE_RS})`, 'premium_unlock')],
      ]),
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
                 `2. Pay ₹${PRICE_RS} to unlock premium prediction\n` +
                 `3. Get winner, toss, and key player predictions\n\n` +
                 `Questions? Contact admin.`;

  ctx.reply(message, { parse_mode: 'Markdown' });
});

// ============= BUTTON CALLBACKS =============

bot.action('free_analysis', async (ctx) => {
  try {
    const prediction = await Prediction.findOne().sort({ createdAt: -1 });
    const matchData = prediction
      ? { ...SAMPLE_MATCH, team1: prediction.team1, team2: prediction.team2, venue: prediction.venue || SAMPLE_MATCH.venue }
      : SAMPLE_MATCH;

    const analysisText = generateFreeAnalysis(matchData);

    await ctx.editMessageText(
      analysisText,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback(`💎 Unlock Premium (₹${PRICE_RS})`, 'premium_unlock')],
          [Markup.button.callback('⬅️ Back to Menu', 'back_menu')],
        ]),
      }
    );
  } catch (error) {
    console.error('Error in free_analysis:', error);
    await ctx.answerCbQuery('❌ Error loading analysis');
  }
});

bot.action('premium_unlock', async (ctx) => {
  try {
    const userId = ctx.from.id;
    const user = await User.findOne({ telegramId: userId });

    if (user && user.isPaid && user.subscriptionExpiry > new Date()) {
      const prediction = await Prediction.findOne().sort({ createdAt: -1 });

      if (!prediction || !prediction.premiumPrediction || !prediction.premiumPrediction.winner) {
        await ctx.editMessageText(
          '⏳ *PREMIUM CONTENT COMING SOON*\n\nPrediction for the next match will be posted shortly.',
          {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
              [Markup.button.callback('⬅️ Back to Menu', 'back_menu')],
            ]),
          }
        );
        return;
      }

      const premiumText = formatPremiumPrediction({
        team1: prediction.team1,
        team2: prediction.team2,
        venue: prediction.venue || 'TBA',
        premiumPrediction: prediction.premiumPrediction,
      });

      await ctx.editMessageText(
        premiumText,
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.callback('⬅️ Back to Menu', 'back_menu')],
          ]),
        }
      );
      return;
    }

    const premiumText = `💎 *PREMIUM PREDICTION UNLOCK*\n\n` +
                       `Get EXPERT ACCURATE PREDICTIONS\n\n` +
                       `✅ Predicted Winner\n` +
                       `✅ Toss Winner\n` +
                       `✅ Confidence Level\n` +
                       `✅ Key Player Analysis\n\n` +
                       `💰 Price: ₹${PRICE_RS} | ⏰ Valid: 7 days`;

    await ctx.editMessageText(
      premiumText,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback(`💳 Pay ₹${PRICE_RS} Now`, 'pay_now')],
          [Markup.button.callback('⬅️ Back to Menu', 'back_menu')],
        ]),
      }
    );
  } catch (error) {
    console.error('Error in premium_unlock:', error);
    await ctx.answerCbQuery('❌ Error processing request');
  }
});

bot.action('pay_now', async (ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username || `User${userId}`;

  try {
    const order = await createOrder(PRICE_PAISE, userId, username);

    if (!order) {
      await ctx.editMessageText(
        '❌ Payment setup failed. Please try again later.',
        {
          ...Markup.inlineKeyboard([
            [Markup.button.callback('⬅️ Back', 'back_menu')],
          ]),
        }
      );
      return;
    }

    await Payment.create({
      telegramId: userId,
      razorpayOrderId: order.id,
      amount: PRICE_PAISE,
      status: 'pending',
    });

    const paymentText = `💳 *PAYMENT READY*\n\n` +
                       `Amount: *₹${PRICE_RS}*\n` +
                       `Order ID: \`${order.id}\`\n\n` +
                       `Tap the button below to pay securely via Razorpay.`;

    await ctx.editMessageText(
      paymentText,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.url('🔗 Pay with Razorpay', `https://rzp.io/p/${order.id}`)],
          [Markup.button.callback('✅ I Paid – Verify', 'verify_payment')],
          [Markup.button.callback('⬅️ Back', 'back_menu')],
        ]),
      }
    );
  } catch (error) {
    console.error('Error in pay_now:', error);
    await ctx.answerCbQuery('❌ Error creating payment order');
  }
});

bot.action('verify_payment', async (ctx) => {
  const userId = ctx.from.id;

  try {
    await ctx.editMessageText('⏳ *VERIFYING PAYMENT*\n\nPlease wait...', {
      parse_mode: 'Markdown',
    });

    const user = await User.findOne({ telegramId: userId });

    if (user && user.isPaid && user.subscriptionExpiry > new Date()) {
      const expiryStr = user.subscriptionExpiry.toLocaleDateString('en-IN');
      const successText = `✅ *PAYMENT VERIFIED!*\n\n🔓 Premium access ACTIVATED!\n\nValid until: ${expiryStr} ✅\n\nLet's predict! 🎯`;

      await ctx.editMessageText(
        successText,
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.callback('🎯 View Prediction', 'premium_unlock')],
            [Markup.button.callback('📊 Back to Menu', 'back_menu')],
          ]),
        }
      );
    } else {
      await ctx.editMessageText(
        '❌ *PAYMENT NOT FOUND*\n\nYour payment has not been verified yet.\n\nIf you just paid, please wait a moment and tap *Try Again*.',
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.callback('🔄 Try Again', 'verify_payment')],
            [Markup.button.callback('⬅️ Back', 'back_menu')],
          ]),
        }
      );
    }
  } catch (error) {
    console.error('Error in verify_payment:', error);
    await ctx.answerCbQuery('❌ Error verifying payment. Try again.');
  }
});

bot.action('about', async (ctx) => {
  try {
    const aboutMessage = `ℹ️ *ABOUT THIS BOT*\n\n` +
                        `This is your IPL cricket expert!\n\n` +
                        `📊 We provide:\n` +
                        `✅ Free match analysis\n` +
                        `✅ Expert predictions\n` +
                        `✅ Winner & toss predictions\n` +
                        `✅ Key player analysis\n\n` +
                        `💰 Premium cost: ₹${PRICE_RS}/match\n\n` +
                        `Version: 1.0.0\n` +
                        `Made with ❤️ for cricket fans`;

    await ctx.editMessageText(
      aboutMessage,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('📊 See Free Analysis', 'free_analysis')],
          [Markup.button.callback('💎 Unlock Premium', 'premium_unlock')],
          [Markup.button.callback('⬅️ Back', 'back_menu')],
        ]),
      }
    );
  } catch (error) {
    console.error('Error in about:', error);
    await ctx.answerCbQuery('❌ Error loading about page');
  }
});

bot.action('back_menu', async (ctx) => {
  try {
    const menuText = `🏏 *MAIN MENU*\n\nWhat would you like?`;

    await ctx.editMessageText(
      menuText,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('📊 Today\'s Free Analysis', 'free_analysis')],
          [Markup.button.callback(`💎 Premium (₹${PRICE_RS})`, 'premium_unlock')],
          [Markup.button.callback('ℹ️ About', 'about')],
        ]),
      }
    );
  } catch (error) {
    console.error('Error in back_menu:', error);
    await ctx.answerCbQuery('❌ Error loading menu');
  }
});

// ============= ADMIN COMMANDS =============

bot.command('admin', async (ctx) => {
  if (ctx.from.id !== parseInt(process.env.ADMIN_USER_ID, 10)) {
    return ctx.reply('❌ Unauthorized access');
  }

  await ctx.reply(
    '👑 *ADMIN PANEL*',
    {
      parse_mode: 'Markdown',
      ...Markup.keyboard([
        ['➕ Add New Prediction'],
        ['📊 View Predictions'],
      ]).resize(),
    }
  );
});

bot.hears('➕ Add New Prediction', async (ctx) => {
  if (ctx.from.id !== parseInt(process.env.ADMIN_USER_ID, 10)) return;

  adminStates[ctx.from.id] = { step: 1 };
  await ctx.reply(
    'Select Team 1:',
    Markup.keyboard(IPL_TEAMS.map((t) => [t])).resize()
  );
});

bot.hears('📊 View Predictions', async (ctx) => {
  if (ctx.from.id !== parseInt(process.env.ADMIN_USER_ID, 10)) return;

  try {
    const predictions = await Prediction.find().sort({ createdAt: -1 }).limit(10);

    if (predictions.length === 0) {
      return ctx.reply('❌ No predictions found.');
    }

    let message = `📋 *RECENT PREDICTIONS*\n\n`;
    predictions.forEach((pred, index) => {
      const dateStr = pred.date ? new Date(pred.date).toLocaleDateString('en-IN') : 'N/A';
      message += `${index + 1}. ${pred.team1} vs ${pred.team2}\n`;
      message += `   📅 ${dateStr}\n`;
      message += `   🏆 Winner: ${pred.premiumPrediction?.winner ?? 'N/A'}\n\n`;
    });

    await ctx.reply(message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error in View Predictions:', error);
    await ctx.reply('❌ Error fetching predictions.');
  }
});

// /predictions command (alias for admins)
bot.command('predictions', async (ctx) => {
  if (ctx.from.id !== parseInt(process.env.ADMIN_USER_ID, 10)) {
    return ctx.reply('❌ Admin only command!');
  }

  try {
    const predictions = await Prediction.find().sort({ createdAt: -1 }).limit(10);

    if (predictions.length === 0) {
      return ctx.reply('❌ No predictions found.');
    }

    let message = `📋 *RECENT PREDICTIONS*\n\n`;
    predictions.forEach((pred, index) => {
      const dateStr = pred.date ? new Date(pred.date).toLocaleDateString('en-IN') : 'N/A';
      message += `${index + 1}. ${pred.team1} vs ${pred.team2}\n`;
      message += `   📅 ${dateStr}\n`;
      message += `   🏆 Winner: ${pred.premiumPrediction?.winner ?? 'N/A'}\n\n`;
    });

    await ctx.reply(message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error in /predictions:', error);
    await ctx.reply('❌ Error fetching predictions.');
  }
});

// /stats command
bot.command('stats', async (ctx) => {
  if (ctx.from.id !== parseInt(process.env.ADMIN_USER_ID, 10)) {
    return ctx.reply('❌ Admin only command!');
  }

  try {
    const totalUsers = await User.countDocuments();
    const totalPredictions = await Prediction.countDocuments();
    const totalPayments = await Payment.countDocuments({ status: 'completed' });

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

// ============= ADMIN STATE MACHINE (text handler) =============
// Must be registered AFTER all command/hears handlers

bot.on('text', async (ctx) => {
  // Only process for the admin while in a multi-step state
  if (ctx.from.id !== parseInt(process.env.ADMIN_USER_ID, 10)) return;

  const state = adminStates[ctx.from.id];
  if (!state) return;

  const text = ctx.message.text;

  try {
    if (state.step === 1) {
      state.team1 = text;
      state.step = 2;
      await ctx.reply(
        `Team 1: ${text}\n\nSelect Team 2:`,
        Markup.keyboard(IPL_TEAMS.filter((t) => t !== text).map((t) => [t])).resize()
      );
    } else if (state.step === 2) {
      state.team2 = text;
      state.step = 3;
      await ctx.reply(
        `Team 2: ${text}\n\nSelect Venue:`,
        Markup.keyboard(VENUES.map((v) => [v])).resize()
      );
    } else if (state.step === 3) {
      state.venue = text;
      state.step = 4;
      await ctx.reply(
        `Venue: ${text}\n\nWho will WIN?`,
        Markup.keyboard([[state.team1], [state.team2]]).resize()
      );
    } else if (state.step === 4) {
      state.winner = text;
      state.step = 5;
      await ctx.reply(
        `Winner: ${text}\n\nWho will WIN the TOSS?`,
        Markup.keyboard([[state.team1], [state.team2]]).resize()
      );
    } else if (state.step === 5) {
      state.tossWinner = text;
      state.step = 6;
      await ctx.reply(
        `Toss Winner: ${text}\n\nKey Player to Watch?`,
        Markup.removeKeyboard()
      );
    } else if (state.step === 6) {
      state.keyPlayer = text;
      state.step = 7;
      await ctx.reply(
        `Key Player: ${text}\n\nConfidence Level:`,
        Markup.keyboard(CONFIDENCE_LEVELS.map((c) => [c])).resize()
      );
    } else if (state.step === 7) {
      state.confidence = text;

      // Save prediction to database
      const matchId = `${state.team1}_${state.team2}_${Date.now()}`;
      await Prediction.create({
        matchId,
        team1: state.team1,
        team2: state.team2,
        venue: state.venue,
        date: new Date(),
        premiumPrediction: {
          winner: state.winner,
          tossWinner: state.tossWinner,
          keyPlayer: state.keyPlayer,
          confidence: state.confidence,
        },
        adminId: ctx.from.id,
      });

      const confirmation = `✅ *PREDICTION SAVED*\n\n` +
                          `Match: ${state.team1} vs ${state.team2}\n` +
                          `Venue: ${state.venue}\n` +
                          `Winner: ${state.winner}\n` +
                          `Toss: ${state.tossWinner}\n` +
                          `Key Player: ${state.keyPlayer}\n` +
                          `Confidence: ${state.confidence}`;

      await ctx.reply(confirmation, {
        parse_mode: 'Markdown',
        ...Markup.keyboard([
          ['➕ Add New Prediction'],
          ['📊 View Predictions'],
        ]).resize(),
      });

      delete adminStates[ctx.from.id];
    }
  } catch (error) {
    console.error('Error in admin state machine:', error);
    await ctx.reply('❌ Error saving prediction. Please try again.');
    delete adminStates[ctx.from.id];
  }
});

// ============= ERROR HANDLING =============

bot.catch((err, ctx) => {
  console.error('Bot error:', err);
});

module.exports = bot;

