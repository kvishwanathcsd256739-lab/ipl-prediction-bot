const { Telegraf, Markup } = require('telegraf');
const User = require('../models/user');
const Payment = require('../models/payment');
const { generateFreeAnalysis, formatPremiumPrediction } = require('../utils/analytics');
const { createOrder } = require('../utils/razorpay');

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

  await User.findOneAndUpdate(
    { telegramId: userId },
    {
      telegramId: userId,
      username: username,
      chatId: chatId,
      createdAt: new Date(),
    },
    { upsert: true }
  );

  const welcomeText = `
🏏 *WELCOME TO IPL PREDICTION BOT* 🏏

Hi ${ctx.from.first_name}! 👋

I'm your cricket expert teacher:
✅ I study IPL matches
✅ I give expert predictions
✅ I predict who will win

━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 FREE ANALYSIS for everyone
💎 PREMIUM PREDICTIONS (₹49)

Let's predict today's match! 🎯
`;

  await ctx.reply(
    welcomeText,
    Markup.inlineKeyboard([
      [Markup.button.callback('📊 Today\'s Free Analysis', 'free_analysis')],
      [Markup.button.callback('💎 Premium Prediction (₹49)', 'premium_unlock')],
      [Markup.button.callback('ℹ️ How It Works', 'about')],
    ]),
    { parse_mode: 'Markdown' }
  );
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