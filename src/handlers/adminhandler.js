const { Telegraf, Markup } = require('telegraf');
const { IPL_TEAMS, VENUES, CONFIDENCE_LEVELS } = require('../utils/analytics');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

let adminStates = {};

bot.command('admin', async (ctx) => {
  if (ctx.from.id !== parseInt(process.env.ADMIN_USER_ID)) {
    await ctx.reply('❌ Unauthorized access');
    return;
  }

  await ctx.reply(
    '👑 *ADMIN PANEL*',
    Markup.keyboard([
      ['➕ Add New Prediction'],
      ['📊 View Predictions'],
    ]).resize(),
    { parse_mode: 'Markdown' }
  );
});

bot.hears('➕ Add New Prediction', async (ctx) => {
  if (ctx.from.id !== parseInt(process.env.ADMIN_USER_ID)) return;

  adminStates[ctx.from.id] = { step: 1 };
  await ctx.reply('Select Team 1:', Markup.keyboard(IPL_TEAMS.map(t => [t])).resize());
});

bot.on('text', async (ctx) => {
  if (ctx.from.id !== parseInt(process.env.ADMIN_USER_ID)) return;

  const state = adminStates[ctx.from.id];
  if (!state) return;

  const text = ctx.message.text;

  if (state.step === 1) {
    state.team1 = text;
    state.step = 2;
    await ctx.reply(`Team 1: ${text}\n\nSelect Team 2:`, 
      Markup.keyboard(IPL_TEAMS.filter(t => t !== text).map(t => [t])).resize()
    );
  } else if (state.step === 2) {
    state.team2 = text;
    state.step = 3;
    await ctx.reply(`Team 2: ${text}\n\nSelect Venue:`, 
      Markup.keyboard(VENUES.map(v => [v])).resize()
    );
  } else if (state.step === 3) {
    state.venue = text;
    state.step = 4;
    await ctx.reply(`Venue: ${text}\n\nWho will WIN?`, 
      Markup.keyboard([[state.team1], [state.team2]]).resize()
    );
  } else if (state.step === 4) {
    state.winner = text;
    state.step = 5;
    await ctx.reply(`Winner: ${text}\n\nWho will WIN TOSS?`, 
      Markup.keyboard([[state.team1], [state.team2]]).resize()
    );
  } else if (state.step === 5) {
    state.tossWinner = text;
    state.step = 6;
    await ctx.reply('Toss Winner: ' + text + '\n\nKey Player to Watch?');
  } else if (state.step === 6) {
    state.keyPlayer = text;
    state.step = 7;
    await ctx.reply(`Key Player: ${text}\n\nConfidence Level:`, 
      Markup.keyboard(CONFIDENCE_LEVELS.map(c => [c])).resize()
    );
  } else if (state.step === 7) {
    state.confidence = text;
    
    const confirmation = `
✅ *PREDICTION SAVED*

Match: ${state.team1} vs ${state.team2}
Venue: ${state.venue}
Winner: ${state.winner}
Toss: ${state.tossWinner}
Key Player: ${state.keyPlayer}
Confidence: ${state.confidence}
`;

    await ctx.reply(confirmation, { parse_mode: 'Markdown' });
    delete adminStates[ctx.from.id];
  }
});

module.exports = bot;