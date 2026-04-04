const { Telegraf, Markup } = require('telegraf');
const User = require('../models/user');
const Payment = require('../models/payment');
const { generateFreeAnalysis, formatPremiumPrediction, IPL_TEAMS } = require('../utils/analytics');
const { createOrder } = require('../utils/razorpay');
const {
  generateWinProbabilityChart,
  generateScorePredictionChart,
  generateTeamComparisonChart,
  generateHeadToHeadChart,
  generateVenuePerformanceChart,
  generateFormAnalysisChart,
  generateBattingScatterChart,
  generateBowlingScatterChart,
  generateSeasonDistributionChart,
  generateModelPerformanceChart,
} = require('../analytics/chartGenerator');
const {
  calculateWinProbability,
  getTeamStats,
  getHeadToHeadStats,
  predictScore,
  getVenuePerformance,
  getSeasonSummary,
  getBattersData,
  getBowlersData,
  getModelMetrics,
  getTeamRecentForm,
  VENUE_STATS,
  SEASON_STATS_2025,
} = require('../analytics/matchAnalytics');
const {
  formatMatchPredictionEmbed,
  formatTeamStatsEmbed,
  formatHeadToHeadEmbed,
  formatSeasonSummaryEmbed,
  formatPlayerComparisonEmbed,
  formatVenueAnalysisEmbed,
  formatModelMetricsEmbed,
} = require('../analytics/embedFormatter');
const {
  generateMatchDashboard,
  generateSeasonDashboard,
  exportStandingsCSV,
  exportPredictionCSV,
  generateMatchSummaryReport,
} = require('../analytics/reportGenerator');

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

I'm your cricket analytics expert:
✅ I study IPL matches
✅ I give expert predictions
✅ I predict who will win
📊 I generate interactive charts & reports

━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 FREE ANALYSIS for everyone
💎 PREMIUM PREDICTIONS (₹49)
📈 ANALYTICS & VISUALIZATIONS

*Commands:* /predict /teamstats /h2h /season /charts /compare /report /players

Let's predict today's match! 🎯
`;

  await ctx.reply(
    welcomeText,
    Markup.inlineKeyboard([
      [Markup.button.callback('📊 Today\'s Free Analysis', 'free_analysis')],
      [Markup.button.callback('💎 Premium Prediction (₹49)', 'premium_unlock')],
      [Markup.button.callback('📈 Analytics & Charts', 'analytics_menu')],
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

I'm your cricket analytics expert:
✅ Analyze matches in depth
✅ Study team form
✅ Give FREE analysis
✅ Provide PREMIUM predictions
📊 Generate interactive charts
📈 Team & player statistics
🏟️ Venue performance analysis

FREE: 14-point analysis
PREMIUM (₹49): Winner, Toss, Confidence

*Available Commands:*
/predict TEAM1 TEAM2 VENUE
/teamstats TEAM
/h2h TEAM1 TEAM2
/season
/charts
/compare TEAM1 TEAM2
/report TEAM1 TEAM2 VENUE
/players [batting|bowling] [TEAM]
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
      [Markup.button.callback('📈 Analytics & Charts', 'analytics_menu')],
      [Markup.button.callback('ℹ️ About', 'about')],
    ]),
    { parse_mode: 'Markdown' }
  );
});

// ─── ANALYTICS MENU ───────────────────────────────────────────────────────────

bot.action('analytics_menu', async (ctx) => {
  await ctx.editMessageText(
    '📈 *ANALYTICS & VISUALIZATIONS*\n\nChoose a report or chart:',
    Markup.inlineKeyboard([
      [Markup.button.callback('🥧 Win Probability Chart', 'chart_winprob')],
      [Markup.button.callback('📊 Score Predictions Chart', 'chart_scores')],
      [Markup.button.callback('🎯 Team Comparison Radar', 'chart_compare')],
      [Markup.button.callback('⚔️ Head-to-Head Chart', 'chart_h2h')],
      [Markup.button.callback('🏟️ Venue Performance Chart', 'chart_venue')],
      [Markup.button.callback('📋 Form Analysis Chart', 'chart_form')],
      [Markup.button.callback('🏏 Batting Scatter Plot', 'chart_batting')],
      [Markup.button.callback('🎳 Bowling Scatter Plot', 'chart_bowling')],
      [Markup.button.callback('🏆 Season Distribution', 'chart_season')],
      [Markup.button.callback('🤖 Model Metrics Chart', 'chart_models')],
      [Markup.button.callback('📋 Season Standings Text', 'stats_season')],
      [Markup.button.callback('⬅️ Back to Menu', 'back_menu')],
    ]),
    { parse_mode: 'Markdown' }
  );
  await ctx.answerCbQuery();
});

// Helper: send loading message then chart
async function sendChart(ctx, generatorFn, caption) {
  await ctx.answerCbQuery('⏳ Generating chart...');
  try {
    const buffer = await generatorFn();
    await ctx.replyWithPhoto({ source: buffer }, { caption });
  } catch (err) {
    console.error('Chart generation error:', err);
    await ctx.reply('❌ Failed to generate chart. Please try again.');
  }
}

bot.action('chart_winprob', async (ctx) => {
  const { team1WinProb, team2WinProb } = calculateWinProbability('CSK', 'MI', 'Chennai');
  await sendChart(
    ctx,
    () => generateWinProbabilityChart('CSK', team1WinProb, 'MI', team2WinProb),
    `🥧 Win Probability — CSK ${team1WinProb}% vs MI ${team2WinProb}%`
  );
});

bot.action('chart_scores', async (ctx) => {
  const s1 = predictScore('CSK', 'Chennai', true);
  const s2 = predictScore('MI', 'Chennai', false);
  await sendChart(
    ctx,
    () => generateScorePredictionChart('CSK', s1.predicted, s1.confidence, 'MI', s2.predicted, s2.confidence),
    `📊 Score Predictions — CSK: ~${s1.predicted} | MI: ~${s2.predicted}`
  );
});

bot.action('chart_compare', async (ctx) => {
  const stats1 = getTeamStats('CSK');
  const stats2 = getTeamStats('MI');
  await sendChart(
    ctx,
    () => generateTeamComparisonChart('CSK', 'MI', stats1, stats2),
    '🎯 Team Comparison Radar — CSK vs MI'
  );
});

bot.action('chart_h2h', async (ctx) => {
  const h2h = getHeadToHeadStats('CSK', 'MI');
  await sendChart(
    ctx,
    () => generateHeadToHeadChart('CSK', 'MI', h2h.wins1, h2h.wins2, h2h.draws),
    `⚔️ Head-to-Head — CSK: ${h2h.wins1} wins | MI: ${h2h.wins2} wins`
  );
});

bot.action('chart_venue', async (ctx) => {
  const venueStats = getVenuePerformance('Chennai');
  await sendChart(
    ctx,
    () => generateVenuePerformanceChart('Chennai', venueStats),
    '🏟️ Venue Performance at Chennai'
  );
});

bot.action('chart_form', async (ctx) => {
  const form1 = getTeamRecentForm('CSK', 10);
  const form2 = getTeamRecentForm('MI', 10);
  await sendChart(
    ctx,
    () => generateFormAnalysisChart('CSK', 'MI', form1, form2),
    '📋 Recent Form Analysis — CSK vs MI (Last 10 Matches)'
  );
});

bot.action('chart_batting', async (ctx) => {
  const batters = getBattersData();
  await sendChart(
    ctx,
    () => generateBattingScatterChart(batters),
    '🏏 Batting: Strike Rate vs Average (Top Players)'
  );
});

bot.action('chart_bowling', async (ctx) => {
  const bowlers = getBowlersData();
  await sendChart(
    ctx,
    () => generateBowlingScatterChart(bowlers),
    '🎳 Bowling: Economy Rate vs Wickets (Top Players)'
  );
});

bot.action('chart_season', async (ctx) => {
  const summary = getSeasonSummary();
  await sendChart(
    ctx,
    () => generateSeasonDistributionChart(summary),
    '🏆 IPL 2025 Season Win/Loss Distribution'
  );
});

bot.action('chart_models', async (ctx) => {
  const metrics = getModelMetrics();
  await sendChart(
    ctx,
    () => generateModelPerformanceChart(metrics),
    '🤖 ML Model Performance Metrics'
  );
});

bot.action('stats_season', async (ctx) => {
  const summary = getSeasonSummary();
  const text = formatSeasonSummaryEmbed(summary);
  await ctx.reply(text, { parse_mode: 'Markdown' });
  await ctx.answerCbQuery();
});

// ─── TEXT COMMANDS FOR ANALYTICS ──────────────────────────────────────────────

/**
 * /predict <TEAM1> <TEAM2> [VENUE]
 * Generate a full match prediction embed
 */
bot.command('predict', async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);
  const team1 = (args[0] || 'CSK').toUpperCase();
  const team2 = (args[1] || 'MI').toUpperCase();
  const venue = args[2] || 'Chennai';

  if (!IPL_TEAMS.includes(team1) || !IPL_TEAMS.includes(team2)) {
    return ctx.reply(
      `❌ Invalid team name(s). Use: ${IPL_TEAMS.join(', ')}`
    );
  }

  const prob = calculateWinProbability(team1, team2, venue);
  const s1 = predictScore(team1, venue, true);
  const s2 = predictScore(team2, venue, false);
  const h2h = getHeadToHeadStats(team1, team2);
  const form1 = getTeamRecentForm(team1, 5);
  const form2 = getTeamRecentForm(team2, 5);

  const data = {
    team1,
    team2,
    venue,
    date: new Date().toLocaleDateString('en-IN'),
    team1WinProb: prob.team1Prob,
    team2WinProb: prob.team2Prob,
    predictedWinner: prob.team1Prob >= prob.team2Prob ? team1 : team2,
    confidence: Math.max(prob.team1Prob, prob.team2Prob),
    team1Score: s1.predicted,
    team2Score: s2.predicted,
    tossWinner: team1,
    keyPlayer: 'Top performer TBD',
    h2h: { wins1: h2h.wins1, wins2: h2h.wins2, total: h2h.total },
    form1,
    form2,
  };

  const embed = formatMatchPredictionEmbed(data);
  await ctx.reply(embed, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.callback('📊 Win Probability Chart', 'chart_winprob')],
      [Markup.button.callback('🎯 Team Comparison', 'chart_compare')],
    ]),
  });
});

/**
 * /teamstats <TEAM>
 * Show team statistics with progress bars
 */
bot.command('teamstats', async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);
  const team = (args[0] || 'CSK').toUpperCase();

  if (!IPL_TEAMS.includes(team)) {
    return ctx.reply(`❌ Invalid team. Use: ${IPL_TEAMS.join(', ')}`);
  }

  const stats = SEASON_STATS_2025[team] || { wins: 7, losses: 7, nrr: 0, avgScore: 174, avgConceded: 174 };
  const form = getTeamRecentForm(team, 7);
  const text = formatTeamStatsEmbed(team, stats, form);

  await ctx.reply(text, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.callback('📈 Analytics Menu', 'analytics_menu')],
    ]),
  });
});

/**
 * /h2h <TEAM1> <TEAM2> [VENUE]
 * Show head-to-head comparison
 */
bot.command('h2h', async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);
  const team1 = (args[0] || 'CSK').toUpperCase();
  const team2 = (args[1] || 'MI').toUpperCase();
  const venue = args[2] || null;

  if (!IPL_TEAMS.includes(team1) || !IPL_TEAMS.includes(team2)) {
    return ctx.reply(`❌ Invalid team(s). Use: ${IPL_TEAMS.join(', ')}`);
  }

  const h2h = getHeadToHeadStats(team1, team2);
  const venueData = venue ? VENUE_STATS[venue] : null;
  const text = formatHeadToHeadEmbed(team1, team2, h2h, venueData);

  await ctx.reply(text, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.callback('⚔️ H2H Chart', 'chart_h2h')],
    ]),
  });
});

/**
 * /season
 * Show IPL season standings summary
 */
bot.command('season', async (ctx) => {
  const summary = getSeasonSummary();
  const text = formatSeasonSummaryEmbed(summary);
  await ctx.reply(text, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.callback('📊 Season Chart', 'chart_season')],
      [Markup.button.callback('📈 Analytics Menu', 'analytics_menu')],
    ]),
  });
});

/**
 * /charts
 * Show analytics menu
 */
bot.command('charts', async (ctx) => {
  await ctx.reply(
    '📈 *ANALYTICS & VISUALIZATIONS*\n\nChoose a report or chart:',
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🥧 Win Probability Chart', 'chart_winprob')],
        [Markup.button.callback('📊 Score Predictions', 'chart_scores')],
        [Markup.button.callback('🎯 Team Comparison', 'chart_compare')],
        [Markup.button.callback('⚔️ Head-to-Head', 'chart_h2h')],
        [Markup.button.callback('🏟️ Venue Performance', 'chart_venue')],
        [Markup.button.callback('📋 Form Analysis', 'chart_form')],
        [Markup.button.callback('🏏 Batting Stats', 'chart_batting')],
        [Markup.button.callback('🎳 Bowling Stats', 'chart_bowling')],
        [Markup.button.callback('🏆 Season Overview', 'chart_season')],
        [Markup.button.callback('🤖 Model Metrics', 'chart_models')],
        [Markup.button.callback('⬅️ Main Menu', 'back_menu')],
      ]),
    }
  );
});

/**
 * /compare <TEAM1> <TEAM2>
 * Send team comparison radar chart
 */
bot.command('compare', async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);
  const team1 = (args[0] || 'CSK').toUpperCase();
  const team2 = (args[1] || 'MI').toUpperCase();

  if (!IPL_TEAMS.includes(team1) || !IPL_TEAMS.includes(team2)) {
    return ctx.reply(`❌ Invalid team(s). Use: ${IPL_TEAMS.join(', ')}`);
  }

  await ctx.reply('⏳ Generating comparison chart...');
  try {
    const stats1 = getTeamStats(team1);
    const stats2 = getTeamStats(team2);
    const buffer = await generateTeamComparisonChart(team1, team2, stats1, stats2);
    await ctx.replyWithPhoto(
      { source: buffer },
      { caption: `🎯 Team Comparison: ${team1} vs ${team2}` }
    );
  } catch (err) {
    console.error('Compare chart error:', err);
    await ctx.reply('❌ Failed to generate comparison chart.');
  }
});

/**
 * /report <TEAM1> <TEAM2> [VENUE]
 * Generate a text match summary report
 */
bot.command('report', async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);
  const team1 = (args[0] || 'CSK').toUpperCase();
  const team2 = (args[1] || 'MI').toUpperCase();
  const venue = args[2] || 'Chennai';

  if (!IPL_TEAMS.includes(team1) || !IPL_TEAMS.includes(team2)) {
    return ctx.reply(`❌ Invalid team(s). Use: ${IPL_TEAMS.join(', ')}`);
  }

  const prob = calculateWinProbability(team1, team2, venue);
  const s1 = predictScore(team1, venue, true);
  const s2 = predictScore(team2, venue, false);
  const h2h = getHeadToHeadStats(team1, team2);

  const reportText = generateMatchSummaryReport({
    team1,
    team2,
    venue,
    date: new Date().toLocaleDateString('en-IN'),
    team1WinProb: prob.team1Prob,
    team2WinProb: prob.team2Prob,
    predictedWinner: prob.team1Prob >= prob.team2Prob ? team1 : team2,
    confidence: Math.max(prob.team1Prob, prob.team2Prob),
    team1Score: s1.predicted,
    team2Score: s2.predicted,
    tossWinner: team1,
    keyPlayer: 'Top performer TBD',
    h2h: { wins1: h2h.wins1, wins2: h2h.wins2, total: h2h.total },
  });

  await ctx.reply(`\`\`\`\n${reportText}\n\`\`\``, { parse_mode: 'Markdown' });
});

/**
 * /players [batting|bowling] [TEAM]
 * Show player stats comparison
 */
bot.command('players', async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);
  const type = (args[0] || 'batting').toLowerCase();
  const team = args[1] ? args[1].toUpperCase() : null;

  const isBatting = type === 'batting';
  const data = isBatting ? getBattersData(team) : getBowlersData(team);

  if (data.length === 0) {
    return ctx.reply(`❌ No data found for ${team || 'all teams'}.`);
  }

  const text = formatPlayerComparisonEmbed(data.slice(0, 8), isBatting ? 'batting' : 'bowling');
  await ctx.reply(text, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.callback(
        isBatting ? '🏏 Batting Chart' : '🎳 Bowling Chart',
        isBatting ? 'chart_batting' : 'chart_bowling'
      )],
    ]),
  });
});

module.exports = bot;