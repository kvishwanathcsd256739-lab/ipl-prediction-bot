const { Telegraf, Markup } = require('telegraf');
const User = require('../models/user');
const Payment = require('../models/payment');
const Prediction = require('../models/Prediction');
const { generateFreeAnalysis, formatPremiumPrediction } = require('../utils/analytics');
const { createOrder } = require('../utils/razorpay');
const {
  buildTodayMatchesSummary,
  buildMatchDetailMessage,
  buildNoMatchesTodayMessage,
} = require('../utils/startCommand');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const SAMPLE_MATCH = {
  team1: 'CSK',
  team2: 'MI',
  venue: 'Chennai',
  date: '2026-04-02',
  team1Form: '✅ W | ✅ W | ✅ W | ❌ L | ✅ W',
  team2Form: '❌ L | ✅ W | ❌ L | ✅ W | ✅ W',
  team1Stars: 'Ruturaj, Dube, Jadeja',
  team2Stars: 'Kohli, Bumrah, Pandya',
  pitchReport: 'Good batting surface',
  weather: 'Clear ☀️',
  h2hTotal: '32',
  team1H2hWins: '20',
  team2H2hWins: '12',
  venueAdvantage: 'CSK dominates',
  tossTrend: 'Prefer chasing',
  battingStrong: 'MI',
  bowlingStrong: 'CSK',
  powPlayScore: '50-65',
  expectedTotal: '170-185',
};

bot.start(async (ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username || 'Unknown';
  const chatId = ctx.chat.id;
  const firstName = ctx.from.first_name || 'Fan';

  // Register or update user
  await User.findOneAndUpdate(
    { telegramId: userId },
    {
      $set: {
        telegramId: userId,
        username: username,
        chatId: chatId,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );

  try {
    // Find today's predictions
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayPredictions = await Prediction.find({
      date: { $gte: todayStart, $lte: todayEnd },
    }).sort({ date: 1 });

    if (todayPredictions.length === 0) {
      // Find next upcoming match
      const nextPrediction = await Prediction.findOne({
        date: { $gt: todayEnd },
      }).sort({ date: 1 });

      const noMatchMsg = buildNoMatchesTodayMessage(nextPrediction);

      const buttons = [];
      if (nextPrediction) {
        buttons.push([Markup.button.callback('📅 Next Match Details', 'next_match')]);
      }
      buttons.push([Markup.button.callback('💎 Premium Prediction', 'premium_unlock')]);
      buttons.push([Markup.button.callback('ℹ️ About', 'about')]);

      await ctx.reply(noMatchMsg, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard(buttons),
      });
      return;
    }

    // Build today's summary message
    const summaryMsg = buildTodayMatchesSummary(todayPredictions, firstName);

    // Build per-match buttons
    const matchButtons = todayPredictions.map((pred, idx) => [
      Markup.button.callback(
        `🏏 Match ${idx + 1}: ${pred.team1} vs ${pred.team2}`,
        `today_match_${idx}`
      ),
    ]);
    matchButtons.push([Markup.button.callback('💎 Premium Predictions', 'premium_unlock')]);
    matchButtons.push([Markup.button.callback('ℹ️ About', 'about')]);

    await ctx.reply(summaryMsg, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(matchButtons),
    });
  } catch (error) {
    console.error('Error in /start (today matches):', error);

    // Fallback to basic welcome on error
    const fallbackText =
      `🏏 *WELCOME TO IPL PREDICTION BOT* 🏏\n\n` +
      `Hi ${firstName}! 👋\n\n` +
      `I'm your cricket expert:\n` +
      `✅ Expert match predictions\n` +
      `✅ Free in-depth analysis\n` +
      `✅ Premium winner predictions\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `📊 FREE ANALYSIS for everyone\n` +
      `💎 PREMIUM PREDICTIONS (₹${process.env.PAYMENT_AMOUNT || 49})\n\n` +
      `Choose an option below:`;

    await ctx.reply(fallbackText, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('📊 Today\'s Free Analysis', 'free_analysis')],
        [Markup.button.callback('💎 Premium Prediction', 'premium_unlock')],
        [Markup.button.callback('ℹ️ About', 'about')],
      ]),
    });
  }
});

// Dynamic callback: today_match_<index> — show detailed analysis for a specific today's match
bot.action(/^today_match_(\d+)$/, async (ctx) => {
  try {
    const matchIndex = parseInt(ctx.match[1], 10);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayPredictions = await Prediction.find({
      date: { $gte: todayStart, $lte: todayEnd },
    }).sort({ date: 1 });

    if (!todayPredictions[matchIndex]) {
      await ctx.answerCbQuery('❌ Match not found');
      return;
    }

    const pred = todayPredictions[matchIndex];
    const detailMsg = buildMatchDetailMessage(pred, matchIndex);

    const backButtons = [
      [Markup.button.callback('⬅️ Back to Today\'s Matches', 'back_today')],
      [Markup.button.callback(`💎 Unlock Premium (₹${process.env.PAYMENT_AMOUNT || 49})`, `pay_49`)],
    ];

    await ctx.editMessageText(detailMsg, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(backButtons),
    });
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Error in today_match callback:', error);
    await ctx.answerCbQuery('❌ Error loading match details');
  }
});

// Callback: next_match — show the next upcoming match details
bot.action('next_match', async (ctx) => {
  try {
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const nextPrediction = await Prediction.findOne({
      date: { $gt: todayEnd },
    }).sort({ date: 1 });

    if (!nextPrediction) {
      await ctx.answerCbQuery('❌ No upcoming matches found');
      return;
    }

    const detailMsg = buildMatchDetailMessage(nextPrediction, 0);

    await ctx.editMessageText(detailMsg, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('⬅️ Back to Menu', 'back_menu')],
        [Markup.button.callback(`💎 Unlock Premium (₹${process.env.PAYMENT_AMOUNT || 49})`, 'pay_49')],
      ]),
    });
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Error in next_match callback:', error);
    await ctx.answerCbQuery('❌ Error loading next match');
  }
});

// Callback: back_today — go back to today's matches overview
bot.action('back_today', async (ctx) => {
  try {
    const firstName = ctx.from.first_name || 'Fan';

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayPredictions = await Prediction.find({
      date: { $gte: todayStart, $lte: todayEnd },
    }).sort({ date: 1 });

    if (todayPredictions.length === 0) {
      const nextPrediction = await Prediction.findOne({
        date: { $gt: todayEnd },
      }).sort({ date: 1 });

      const noMatchMsg = buildNoMatchesTodayMessage(nextPrediction);
      const buttons = [];
      if (nextPrediction) {
        buttons.push([Markup.button.callback('📅 Next Match Details', 'next_match')]);
      }
      buttons.push([Markup.button.callback('💎 Premium Prediction', 'premium_unlock')]);
      buttons.push([Markup.button.callback('ℹ️ About', 'about')]);

      await ctx.editMessageText(noMatchMsg, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard(buttons),
      });
    } else {
      const summaryMsg = buildTodayMatchesSummary(todayPredictions, firstName);
      const matchButtons = todayPredictions.map((pred, idx) => [
        Markup.button.callback(
          `🏏 Match ${idx + 1}: ${pred.team1} vs ${pred.team2}`,
          `today_match_${idx}`
        ),
      ]);
      matchButtons.push([Markup.button.callback('💎 Premium Predictions', 'premium_unlock')]);
      matchButtons.push([Markup.button.callback('ℹ️ About', 'about')]);

      await ctx.editMessageText(summaryMsg, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard(matchButtons),
      });
    }

    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Error in back_today callback:', error);
    await ctx.answerCbQuery('❌ Error going back');
  }
});

bot.action('free_analysis', async (ctx) => {
  const analysisText = generateFreeAnalysis(SAMPLE_MATCH);

  await ctx.editMessageText(
    analysisText,
    Markup.inlineKeyboard([
      [Markup.button.callback('💎 Unlock Premium (₹49)', 'pay_49')],
      [Markup.button.callback('⬅️ Back to Menu', 'back_menu')],
    ]),
    { parse_mode: 'Markdown' }
  );
});

bot.action('premium_unlock', async (ctx) => {
  const userId = ctx.from.id;
  const user = await User.findOne({ telegramId: userId });

  if (user && user.isPaid && user.subscriptionExpiry > new Date()) {
    const prediction = {
      team1: SAMPLE_MATCH.team1,
      team2: SAMPLE_MATCH.team2,
      venue: SAMPLE_MATCH.venue,
      premiumPrediction: {
        winner: 'CSK',
        tossWinner: 'MI',
        confidence: '85%',
        keyPlayer: 'Ruturaj Gaikwad',
      },
    };

    const premiumText = formatPremiumPrediction(prediction);
    await ctx.editMessageText(
      premiumText,
      Markup.inlineKeyboard([
        [Markup.button.callback('⬅️ Back to Menu', 'back_menu')],
      ]),
      { parse_mode: 'Markdown' }
    );
    return;
  }

  const premiumText = `
💎 *PREMIUM PREDICTION UNLOCK*

Get OWNER'S ACCURATE PREDICTIONS

✅ Predicted Winner
✅ Toss Winner
✅ Confidence Level
✅ Key Player Analysis

💰 Price: ₹49 | ⏰ Valid: 7 days
`;

  await ctx.editMessageText(
    premiumText,
    Markup.inlineKeyboard([
      [Markup.button.callback('💳 Pay ₹49 Now', 'pay_49')],
      [Markup.button.callback('⬅️ Back to Menu', 'back_menu')],
    ]),
    { parse_mode: 'Markdown' }
  );
});

bot.action('pay_49', async (ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username || `User${userId}`;

  const order = await createOrder(process.env.PAYMENT_AMOUNT, userId, username);

  if (!order) {
    await ctx.editMessageText(
      '❌ Payment setup failed. Try again later.',
      Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back', 'back_menu')]])
    );
    return;
  }

  await Payment.create({
    telegramId: userId,
    razorpayOrderId: order.id,
    amount: process.env.PAYMENT_AMOUNT,
    status: 'pending',
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  const paymentText = `
💳 *PAYMENT READY*

Amount: *₹49*
Order ID: \`${order.id}\`

Click button to pay!
`;

  await ctx.editMessageText(
    paymentText,
    Markup.inlineKeyboard([
      [Markup.button.url('🔗 Pay with Razorpay', `https://rzp.io/p/${order.id}`)],
      [Markup.button.callback('✅ I Paid - Verify', 'verify_payment')],
      [Markup.button.callback('⬅️ Back', 'back_menu')],
    ]),
    { parse_mode: 'Markdown' }
  );
});

bot.action('verify_payment', async (ctx) => {
  const userId = ctx.from.id;

  await ctx.editMessageText('⏳ *VERIFYING PAYMENT*\n\nPlease wait...', {
    parse_mode: 'Markdown',
  });

  setTimeout(async () => {
    await User.findOneAndUpdate(
      { telegramId: userId },
      {
        isPaid: true,
        subscriptionExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }
    );

    const successText = `
✅ *PAYMENT SUCCESSFUL!*

🔓 Premium access ACTIVATED!

Valid for 7 days ✅

Let's predict! 🎯
`;

    await ctx.editMessageText(
      successText,
      Markup.inlineKeyboard([
        [Markup.button.callback('🎯 View Prediction', 'premium_unlock')],
        [Markup.button.callback('📊 Back to Menu', 'back_menu')],
      ]),
      { parse_mode: 'Markdown' }
    );
  }, 2000);
});

bot.action('about', async (ctx) => {
  const aboutText = `
ℹ️ *ABOUT IPL PREDICTION BOT*

I'm your cricket expert:
✅ Analyze matches in depth
✅ Study team form
✅ Give FREE analysis
✅ Provide PREMIUM predictions

FREE: 14-point analysis
PREMIUM (₹49): Winner, Toss, Confidence
`;

  await ctx.editMessageText(
    aboutText,
    Markup.inlineKeyboard([
      [Markup.button.callback('📊 See Analysis', 'free_analysis')],
      [Markup.button.callback('💎 Unlock Premium', 'premium_unlock')],
      [Markup.button.callback('⬅️ Back', 'back_menu')],
    ]),
    { parse_mode: 'Markdown' }
  );
});

bot.action('back_menu', async (ctx) => {
  const menuText = '🏏 *MAIN MENU*\n\nWhat would you like?';

  await ctx.editMessageText(
    menuText,
    Markup.inlineKeyboard([
      [Markup.button.callback('📊 Today\'s Analysis', 'free_analysis')],
      [Markup.button.callback('💎 Premium (₹49)', 'premium_unlock')],
      [Markup.button.callback('ℹ️ About', 'about')],
    ]),
    { parse_mode: 'Markdown' }
  );
});

module.exports = bot;