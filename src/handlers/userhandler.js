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
const { getTodaysMatches, formatDate, formatTime } = require('../utils/schedule');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// ── Team metadata ────────────────────────────────────────────────────────────

const TEAM_INFO = {
  CSK:  { stars: 'Ruturaj Gaikwad, Shivam Dube, Ravindra Jadeja', keyPlayer: 'Ruturaj Gaikwad',  rank: 1 },
  MI:   { stars: 'Rohit Sharma, Suryakumar Yadav, Jasprit Bumrah',  keyPlayer: 'Jasprit Bumrah',   rank: 2 },
  RCB:  { stars: 'Virat Kohli, Faf du Plessis, Mohammed Siraj',     keyPlayer: 'Virat Kohli',      rank: 3 },
  KKR:  { stars: 'Shreyas Iyer, Sunil Narine, Andre Russell',       keyPlayer: 'Sunil Narine',     rank: 4 },
  SRH:  { stars: 'Pat Cummins, Abhishek Sharma, Travis Head',       keyPlayer: 'Pat Cummins',      rank: 5 },
  RR:   { stars: 'Sanju Samson, Jos Buttler, Yashasvi Jaiswal',     keyPlayer: 'Yashasvi Jaiswal', rank: 6 },
  GT:   { stars: 'Shubman Gill, Hardik Pandya, Rashid Khan',        keyPlayer: 'Rashid Khan',      rank: 7 },
  DC:   { stars: 'David Warner, Rishabh Pant, Axar Patel',          keyPlayer: 'Rishabh Pant',     rank: 8 },
  PBKS: { stars: 'Shikhar Dhawan, Liam Livingstone, Sam Curran',    keyPlayer: 'Liam Livingstone', rank: 9 },
  LSG:  { stars: 'KL Rahul, Quinton de Kock, Ravi Bishnoi',        keyPlayer: 'KL Rahul',         rank: 10 },
};

const DEFAULT_TEAM_INFO = { stars: 'Star Players', keyPlayer: 'Key Player', rank: 5 };

// H2H head-to-head records (team1 wins, team2 wins, total)
const H2H = {
  'CSK-MI':   { t1: 20, t2: 12, total: 32 },
  'CSK-RCB':  { t1: 21, t2: 11, total: 32 },
  'MI-RCB':   { t1: 19, t2: 12, total: 31 },
  'KKR-CSK':  { t1: 14, t2: 17, total: 31 },
  'SRH-RCB':  { t1: 13, t2: 12, total: 25 },
  'RR-MI':    { t1: 13, t2: 15, total: 28 },
  'DC-MI':    { t1: 11, t2: 15, total: 26 },
  'GT-LSG':   { t1: 3,  t2: 2,  total: 5  },
};

function getH2H(team1, team2) {
  const key1 = `${team1}-${team2}`;
  const key2 = `${team2}-${team1}`;
  if (H2H[key1]) return { t1Wins: H2H[key1].t1, t2Wins: H2H[key1].t2, total: H2H[key1].total };
  if (H2H[key2]) return { t1Wins: H2H[key2].t2, t2Wins: H2H[key2].t1, total: H2H[key2].total };
  return { t1Wins: 10, t2Wins: 10, total: 20 };
}

// Build match data object expected by generateFreeAnalysis / formatPremiumPrediction
function buildMatchData(scheduleEntry) {
  const { team1, team2, venue, date, time } = scheduleEntry;
  const t1 = TEAM_INFO[team1] || DEFAULT_TEAM_INFO;
  const t2 = TEAM_INFO[team2] || DEFAULT_TEAM_INFO;
  const h2h = getH2H(team1, team2);

  // Prediction: lower rank number = stronger team; h2h record breaks ties
  const t1Score = t1.rank + (h2h.t2Wins - h2h.t1Wins) * 0.1;
  const t2Score = t2.rank + (h2h.t1Wins - h2h.t2Wins) * 0.1;
  const winner = t1Score <= t2Score ? team1 : team2;
  const tossWinner = t1Score <= t2Score ? team2 : team1;
  const rankDiff = Math.abs(t1.rank - t2.rank);
  const confidence = rankDiff >= 4 ? '85%' : rankDiff >= 2 ? '75%' : '65%';
  const keyPlayer = t1Score <= t2Score ? t1.keyPlayer : t2.keyPlayer;

  // Venue-based pitch and score estimates
  const venueLower = venue.toLowerCase();
  let pitchReport = 'Good batting surface, expect high scores';
  let powPlayScore = '52-62';
  let expectedTotal = '170-185';
  if (venueLower.includes('chennai') || venueLower.includes('chidambaram')) {
    pitchReport = 'Spin-friendly surface, slower in 2nd innings';
    powPlayScore = '48-58'; expectedTotal = '160-175';
  } else if (venueLower.includes('mumbai') || venueLower.includes('wankhede')) {
    pitchReport = 'Pace-friendly, good for bowlers early on';
    powPlayScore = '50-60'; expectedTotal = '165-180';
  } else if (venueLower.includes('bangalore') || venueLower.includes('chinnaswamy')) {
    pitchReport = 'Batting paradise, high-scoring ground';
    powPlayScore = '58-70'; expectedTotal = '185-205';
  } else if (venueLower.includes('hyderabad') || venueLower.includes('rajiv')) {
    pitchReport = 'Balanced surface, spinners get help later';
    powPlayScore = '50-62'; expectedTotal = '165-180';
  } else if (venueLower.includes('kolkata') || venueLower.includes('eden')) {
    pitchReport = 'Dew factor in evening, good for chasing';
    powPlayScore = '54-65'; expectedTotal = '175-190';
  } else if (venueLower.includes('ahmedabad') || venueLower.includes('narendra')) {
    pitchReport = 'Large ground, bowlers benefit from dimensions';
    powPlayScore = '48-58'; expectedTotal = '160-175';
  }

  // Form strings vary by team rank (top teams have better recent form)
  function formString(rank) {
    if (rank <= 2) return '✅ W | ✅ W | ✅ W | ✅ W | ❌ L';
    if (rank <= 4) return '✅ W | ✅ W | ❌ L | ✅ W | ✅ W';
    if (rank <= 6) return '✅ W | ❌ L | ✅ W | ❌ L | ✅ W';
    return '❌ L | ✅ W | ❌ L | ✅ W | ❌ L';
  }

  return {
    team1,
    team2,
    venue,
    date: `${formatDate(date)} at ${formatTime(time)}`,
    team1Form: formString(t1.rank),
    team2Form: formString(t2.rank),
    team1Stars: t1.stars,
    team2Stars: t2.stars,
    pitchReport,
    weather: 'Clear ☀️ (check local forecast)',
    h2hTotal: String(h2h.total),
    team1H2hWins: String(h2h.t1Wins),
    team2H2hWins: String(h2h.t2Wins),
    venueAdvantage: `${winner} historically stronger here`,
    tossTrend: 'Teams prefer chasing at this venue',
    battingStrong: t1.rank <= t2.rank ? team1 : team2,
    bowlingStrong: t1.rank <= t2.rank ? team2 : team1,
    powPlayScore,
    expectedTotal,
    premiumPrediction: { winner, tossWinner, confidence, keyPlayer },
  };
}

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
    // Get today's matches from schedule (not database)
    const { matches, isToday, nextMatchDate } = getTodaysMatches();

    if (matches.length === 0) {
      const noMatchMsg =
        `🏏 *IPL PREDICTION BOT* 🏏\n\n` +
        `😴 *No IPL matches scheduled today.*\n\n` +
        (nextMatchDate ? `📅 Next match: *${formatDate(nextMatchDate)}*\n\n` : '') +
        `Check back on match day for full predictions!`;

      await ctx.reply(noMatchMsg, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('💎 Premium Prediction', 'premium_unlock')],
          [Markup.button.callback('ℹ️ About', 'about')],
        ]),
      });
      return;
    }

    // Build today's summary message from schedule
    const dateLabel = isToday ? "TODAY'S IPL MATCHES" : `NEXT MATCHES — ${formatDate(matches[0].date)}`;
    let summaryMsg = `🏏 *WELCOME, ${firstName}!* 🏏\n\n📅 *${dateLabel}*\n\n🎯 *${matches.length} Match${matches.length !== 1 ? 'es' : ''}*\n\n`;
    matches.forEach((match, idx) => {
      summaryMsg += `━━━━━━━━━━━━━━━━━━━━━\n`;
      summaryMsg += `🏟 *MATCH ${idx + 1}*\n`;
      summaryMsg += `⚔️  *${match.team1} vs ${match.team2}*\n`;
      summaryMsg += `📍 ${match.venue}\n`;
      summaryMsg += `⏰ ${formatTime(match.time)}\n\n`;
    });

    const matchButtons = matches.map((match, idx) => [
      Markup.button.callback(
        `🏏 Match ${idx + 1}: ${match.team1} vs ${match.team2}`,
        `today_match_${idx}`
      ),
    ]);
    matchButtons.push([Markup.button.callback('📊 Free Analysis', 'free_analysis')]);
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
    const { matches } = getTodaysMatches();

    if (!matches[matchIndex]) {
      await ctx.answerCbQuery('❌ Match not found');
      return;
    }

    const match = matches[matchIndex];
    const matchData = buildMatchData(match);
    const detailMsg = generateFreeAnalysis(matchData);

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
    const { matches, isToday, nextMatchDate } = getTodaysMatches();

    if (matches.length === 0) {
      await ctx.answerCbQuery('❌ No upcoming matches found');
      return;
    }

    const match = matches[0];
    const matchData = buildMatchData(match);
    let detailMsg = generateFreeAnalysis(matchData);
    if (!isToday && nextMatchDate) {
      detailMsg = `📅 *Next match: ${formatDate(nextMatchDate)}*\n\n` + detailMsg;
    }

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
    const { matches, isToday, nextMatchDate } = getTodaysMatches();

    if (matches.length === 0) {
      const noMatchMsg =
        `🏏 *IPL PREDICTION BOT* 🏏\n\n` +
        `😴 *No IPL matches scheduled today.*\n\n` +
        (nextMatchDate ? `📅 Next match: *${formatDate(nextMatchDate)}*\n\n` : '') +
        `Check back on match day for full predictions!`;

      const buttons = [];
      if (nextMatchDate) {
        buttons.push([Markup.button.callback('📅 Next Match Details', 'next_match')]);
      }
      buttons.push([Markup.button.callback('💎 Premium Prediction', 'premium_unlock')]);
      buttons.push([Markup.button.callback('ℹ️ About', 'about')]);

      await ctx.editMessageText(noMatchMsg, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard(buttons),
      });
    } else {
      const dateLabel = isToday ? "TODAY'S IPL MATCHES" : `NEXT MATCHES — ${formatDate(matches[0].date)}`;
      let summaryMsg = `🏏 *WELCOME, ${firstName}!* 🏏\n\n📅 *${dateLabel}*\n\n🎯 *${matches.length} Match${matches.length !== 1 ? 'es' : ''}*\n\n`;
      matches.forEach((match, idx) => {
        summaryMsg += `━━━━━━━━━━━━━━━━━━━━━\n`;
        summaryMsg += `🏟 *MATCH ${idx + 1}*\n`;
        summaryMsg += `⚔️  *${match.team1} vs ${match.team2}*\n`;
        summaryMsg += `📍 ${match.venue}\n`;
        summaryMsg += `⏰ ${formatTime(match.time)}\n\n`;
      });

      const matchButtons = matches.map((match, idx) => [
        Markup.button.callback(
          `🏏 Match ${idx + 1}: ${match.team1} vs ${match.team2}`,
          `today_match_${idx}`
        ),
      ]);
      matchButtons.push([Markup.button.callback('📊 Free Analysis', 'free_analysis')]);
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
  const { matches, isToday, nextMatchDate } = getTodaysMatches();

  if (matches.length === 0) {
    await ctx.editMessageText(
      '❌ No matches scheduled at the moment. Check back soon!',
      Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back to Menu', 'back_menu')]])
    );
    return;
  }

  // Show analysis for the first match; if multiple today, list all at bottom
  const matchData = buildMatchData(matches[0]);
  let analysisText = generateFreeAnalysis(matchData);

  if (matches.length > 1) {
    const extraMatches = matches.slice(1).map((m) => `🏏 ${m.team1} vs ${m.team2} at ${formatTime(m.time)}`).join('\n');
    analysisText += `\n\n📅 *Also today:*\n${extraMatches}`;
  }

  if (!isToday && nextMatchDate) {
    analysisText = `📅 *Next match: ${formatDate(nextMatchDate)}*\n\n` + analysisText;
  }

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
    const { matches, isToday, nextMatchDate } = getTodaysMatches();

    if (matches.length === 0) {
      await ctx.editMessageText(
        '❌ No upcoming matches found.',
        Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back to Menu', 'back_menu')]])
      );
      return;
    }

    // Show premium predictions for all today's matches
    let premiumText = '';
    for (const match of matches) {
      const matchData = buildMatchData(match);
      premiumText += formatPremiumPrediction(matchData) + '\n\n';
    }

    if (!isToday && nextMatchDate) {
      premiumText = `📅 *Next match: ${formatDate(nextMatchDate)}*\n\n` + premiumText;
    }

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

💰 Price: ₹${process.env.PAYMENT_AMOUNT || 49} | ⏰ Valid: 7 days
`;

  await ctx.editMessageText(
    premiumText,
    Markup.inlineKeyboard([
      [Markup.button.callback(`💳 Pay ₹${process.env.PAYMENT_AMOUNT || 49} Now`, 'pay_49')],
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