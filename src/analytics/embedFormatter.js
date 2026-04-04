/**
 * Embed Formatter Module
 * Generates beautiful, formatted Telegram messages with:
 * - Animated Unicode progress bars
 * - Color-coded confidence levels
 * - Statistical breakdowns
 * - Historical comparisons
 */

// ─── PROGRESS BAR HELPERS ─────────────────────────────────────────────────────

const BAR_FILLED = '█';
const BAR_EMPTY = '░';
const BAR_WIDTH = 10;

/**
 * Generate a Unicode progress bar
 * @param {number} value - 0 to 100
 * @param {number} [width=10]
 * @returns {string}
 */
function progressBar(value, width = BAR_WIDTH) {
  const filled = Math.round((value / 100) * width);
  const empty = width - filled;
  return BAR_FILLED.repeat(filled) + BAR_EMPTY.repeat(empty);
}

/**
 * Dual progress bar showing two opposing values
 * @param {number} val1 - team1 percentage (0-100)
 * @param {number} val2 - team2 percentage (0-100)
 * @param {number} [width=10]
 * @returns {string}  e.g. "████░░░░░░ | ░░░░░█████"
 */
function dualProgressBar(val1, val2, width = BAR_WIDTH) {
  const f1 = Math.round((val1 / 100) * width);
  const f2 = Math.round((val2 / 100) * width);
  return `${BAR_FILLED.repeat(f1)}${BAR_EMPTY.repeat(width - f1)} | ${BAR_EMPTY.repeat(width - f2)}${BAR_FILLED.repeat(f2)}`;
}

/**
 * Get confidence emoji and label based on percentage
 * @param {number} confidence - 0 to 100
 * @returns {{ emoji: string, label: string, stars: string }}
 */
function getConfidenceIndicator(confidence) {
  if (confidence >= 85) return { emoji: '🟢', label: 'VERY HIGH', stars: '⭐⭐⭐⭐⭐' };
  if (confidence >= 70) return { emoji: '🟡', label: 'HIGH', stars: '⭐⭐⭐⭐' };
  if (confidence >= 55) return { emoji: '🟠', label: 'MODERATE', stars: '⭐⭐⭐' };
  if (confidence >= 40) return { emoji: '🔴', label: 'LOW', stars: '⭐⭐' };
  return { emoji: '⚪', label: 'UNCERTAIN', stars: '⭐' };
}

/**
 * Format a team's form string with emojis
 * @param {Array<number>} formArray - array of 1s (win) and 0s (loss)
 * @returns {string}
 */
function formatFormString(formArray) {
  return formArray.map((r) => (r === 1 ? '✅' : '❌')).join(' ');
}

// ─── EMBED FORMATTERS ─────────────────────────────────────────────────────────

/**
 * Format a comprehensive match prediction embed
 * @param {object} data
 * @param {string} data.team1
 * @param {string} data.team2
 * @param {string} data.venue
 * @param {string} data.date
 * @param {number} data.team1WinProb - 0-100
 * @param {number} data.team2WinProb - 0-100
 * @param {string} data.predictedWinner
 * @param {number} data.confidence - 0-100
 * @param {number} data.team1Score - predicted score
 * @param {number} data.team2Score - predicted score
 * @param {string} data.tossWinner
 * @param {string} data.keyPlayer
 * @param {object} [data.h2h] - { wins1, wins2, total }
 * @param {Array<number>} [data.form1] - recent form
 * @param {Array<number>} [data.form2] - recent form
 * @returns {string} Formatted Telegram Markdown message
 */
function formatMatchPredictionEmbed(data) {
  const conf = getConfidenceIndicator(data.confidence);
  const winBar = dualProgressBar(data.team1WinProb, data.team2WinProb);
  const confBar = progressBar(data.confidence);
  const form1 = data.form1 ? formatFormString(data.form1.slice(-5)) : '✅ ✅ ❌ ✅ ✅';
  const form2 = data.form2 ? formatFormString(data.form2.slice(-5)) : '❌ ✅ ✅ ❌ ✅';

  return (
    `🏏 *MATCH PREDICTION REPORT*\n` +
    `${'═'.repeat(30)}\n\n` +
    `⚔️ *${data.team1}* vs *${data.team2}*\n` +
    `📍 Venue: ${data.venue}\n` +
    `📅 Date: ${data.date || 'TBD'}\n\n` +
    `${'─'.repeat(30)}\n` +
    `🎯 *WIN PROBABILITY*\n` +
    `${data.team1}: ${data.team1WinProb}%  ${data.team2}: ${data.team2WinProb}%\n` +
    `${winBar}\n\n` +
    `${'─'.repeat(30)}\n` +
    `📊 *CONFIDENCE LEVEL*\n` +
    `${conf.emoji} ${conf.label} ${conf.stars}\n` +
    `[${confBar}] ${data.confidence}%\n\n` +
    `${'─'.repeat(30)}\n` +
    `🏆 *PREDICTED WINNER*\n` +
    `🥇 *${data.predictedWinner}*\n\n` +
    `📈 *SCORE PREDICTIONS*\n` +
    `🏏 ${data.team1}: ${data.team1Score} runs\n` +
    `🏏 ${data.team2}: ${data.team2Score} runs\n\n` +
    `🎲 *TOSS PREDICTION*\n` +
    `🪙 Winner: ${data.tossWinner}\n\n` +
    `⭐ *KEY PLAYER TO WATCH*\n` +
    `🌟 ${data.keyPlayer}\n\n` +
    (data.h2h
      ? `${'─'.repeat(30)}\n` +
        `📚 *HEAD-TO-HEAD* (${data.h2h.total} matches)\n` +
        `${data.team1}: ${data.h2h.wins1} wins  |  ${data.team2}: ${data.h2h.wins2} wins\n\n`
      : '') +
    `${'─'.repeat(30)}\n` +
    `📋 *RECENT FORM (Last 5)*\n` +
    `${data.team1}: ${form1}\n` +
    `${data.team2}: ${form2}\n\n` +
    `${'─'.repeat(30)}\n` +
    `💡 *PREDICTION INSIGHT*\n` +
    `${generateInsight(data)}\n\n` +
    `⏰ _Prediction generated at ${new Date().toLocaleTimeString('en-IN')}_`
  );
}

/**
 * Format a team statistics embed
 * @param {string} team
 * @param {object} stats - { wins, losses, nrr, avgScore, avgConceded }
 * @param {Array<number>} [recentForm]
 * @returns {string}
 */
function formatTeamStatsEmbed(team, stats, recentForm) {
  const total = stats.wins + stats.losses;
  const winRate = total > 0 ? Math.round((stats.wins / total) * 100) : 50;
  const formStr = recentForm ? formatFormString(recentForm.slice(-7)) : '';
  const winBar = progressBar(winRate);

  return (
    `📊 *${team} — SEASON STATISTICS*\n` +
    `${'═'.repeat(30)}\n\n` +
    `🏅 *SEASON RECORD*\n` +
    `✅ Wins: ${stats.wins}   ❌ Losses: ${stats.losses}\n` +
    `📊 Win Rate: ${winRate}%\n` +
    `[${winBar}] ${winRate}%\n\n` +
    `📈 *NET RUN RATE*\n` +
    `${stats.nrr >= 0 ? '🟢' : '🔴'} NRR: ${stats.nrr > 0 ? '+' : ''}${stats.nrr.toFixed(3)}\n\n` +
    `🏏 *BATTING STRENGTH*\n` +
    `Avg Score: ${stats.avgScore || 'N/A'} runs\n` +
    `[${progressBar(Math.min(100, ((stats.avgScore || 175) - 155) * 5))}]\n\n` +
    `🎳 *BOWLING STRENGTH*\n` +
    `Avg Conceded: ${stats.avgConceded || 'N/A'} runs\n` +
    `[${progressBar(Math.min(100, (185 - (stats.avgConceded || 175)) * 5))}]\n\n` +
    (formStr
      ? `📋 *RECENT FORM (Last 7)*\n${formStr}\n\n`
      : '') +
    `_Data from IPL 2025 season_`
  );
}

/**
 * Format a head-to-head comparison embed
 * @param {string} team1
 * @param {string} team2
 * @param {object} h2h - { wins1, wins2, total, draws }
 * @param {object} [venueData] - venue statistics
 * @returns {string}
 */
function formatHeadToHeadEmbed(team1, team2, h2h, venueData) {
  const pct1 = Math.round((h2h.wins1 / h2h.total) * 100);
  const pct2 = 100 - pct1;

  return (
    `⚔️ *HEAD-TO-HEAD: ${team1} vs ${team2}*\n` +
    `${'═'.repeat(30)}\n\n` +
    `📊 *OVERALL RECORD* (${h2h.total} matches)\n\n` +
    `🏆 ${team1}: ${h2h.wins1} wins (${pct1}%)\n` +
    `${progressBar(pct1, 20)}\n\n` +
    `🏆 ${team2}: ${h2h.wins2} wins (${pct2}%)\n` +
    `${progressBar(pct2, 20)}\n\n` +
    (h2h.draws > 0 ? `➖ No Results: ${h2h.draws}\n\n` : '') +
    `${'─'.repeat(30)}\n` +
    `📈 *DOMINANCE RATIO*\n` +
    `${dualProgressBar(pct1, pct2, 15)}\n` +
    `${team1} ${' '.repeat(5)} ${team2}\n\n` +
    (venueData
      ? `${'─'.repeat(30)}\n` +
        `🏟️ *VENUE CONTEXT*\n` +
        `Home Team: ${venueData.homeTeam || 'None'}\n` +
        `Pitch: ${venueData.pitchType || 'Balanced'}\n` +
        `Avg 1st Innings: ${venueData.avgFirstInnings} runs\n` +
        `Avg 2nd Innings: ${venueData.avgSecondInnings} runs\n\n`
      : '') +
    `_Historical IPL data_`
  );
}

/**
 * Format a season predictions summary embed
 * @param {Array<{team: string, wins: number, losses: number, nrr: number, fullName: string}>} summary
 * @returns {string}
 */
function formatSeasonSummaryEmbed(summary) {
  const sorted = [...summary].sort((a, b) => b.wins - a.wins || b.nrr - a.nrr);
  const medals = ['🥇', '🥈', '🥉'];

  let table = `🏆 *IPL 2025 SEASON STANDINGS*\n` + `${'═'.repeat(30)}\n\n`;
  sorted.forEach((team, i) => {
    const medal = medals[i] || `${i + 1}.`;
    const total = team.wins + team.losses;
    const winRate = total > 0 ? Math.round((team.wins / total) * 100) : 0;
    const bar = progressBar(winRate, 8);
    const nrrStr = team.nrr >= 0 ? `+${team.nrr.toFixed(3)}` : team.nrr.toFixed(3);
    table += `${medal} *${team.team}*\n`;
    table += `   W:${team.wins} L:${team.losses} | NRR:${nrrStr}\n`;
    table += `   [${bar}] ${winRate}%\n\n`;
  });

  table += `_IPL 2025 final standings_`;
  return table;
}

/**
 * Format a player performance comparison embed
 * @param {Array<{name: string, team: string, runs?: number, average?: number, strikeRate?: number, wickets?: number, economy?: number}>} players
 * @param {'batting'|'bowling'} type
 * @returns {string}
 */
function formatPlayerComparisonEmbed(players, type = 'batting') {
  let msg = `${type === 'batting' ? '🏏' : '🎳'} *${type.toUpperCase()} PERFORMANCE COMPARISON*\n`;
  msg += `${'═'.repeat(30)}\n\n`;

  if (type === 'batting') {
    const maxSR = Math.max(...players.map((p) => p.strikeRate || 0));
    players.forEach((p, i) => {
      const srBar = progressBar(Math.round(((p.strikeRate || 0) / maxSR) * 100), 8);
      msg += `${i + 1}. ⭐ *${p.name}* (${p.team})\n`;
      msg += `   Runs: ${p.runs || 0} | Avg: ${p.average || 0}\n`;
      msg += `   SR: ${p.strikeRate || 0} [${srBar}]\n\n`;
    });
  } else {
    const maxWkts = Math.max(...players.map((p) => p.wickets || 0));
    players.forEach((p, i) => {
      const wktsBar = progressBar(maxWkts > 0 ? Math.round(((p.wickets || 0) / maxWkts) * 100) : 0, 8);
      msg += `${i + 1}. ⭐ *${p.name}* (${p.team})\n`;
      msg += `   Wkts: ${p.wickets || 0} | Eco: ${p.economy || 0}\n`;
      msg += `   [${wktsBar}] ${p.wickets || 0} wkts\n\n`;
    });
  }

  msg += `_IPL 2025 season statistics_`;
  return msg;
}

/**
 * Format venue performance embed
 * @param {string} venue
 * @param {object} venueData - venue statistics
 * @param {Array<{team: string, wins: number, avgScore: number}>} teamStats
 * @returns {string}
 */
function formatVenueAnalysisEmbed(venue, venueData, teamStats) {
  const sorted = [...teamStats].sort((a, b) => b.wins - a.wins);
  const chasingPct = Math.round(
    (venueData.chasingWins / (venueData.chasingWins + venueData.battingFirstWins)) * 100
  );

  let msg =
    `🏟️ *VENUE ANALYSIS: ${venue}*\n` +
    `${'═'.repeat(30)}\n\n` +
    `📊 *PITCH CHARACTERISTICS*\n` +
    `Type: ${venueData.pitchType || 'Balanced'}\n` +
    `Home Team: ${venueData.homeTeam || 'Neutral'}\n\n` +
    `📈 *SCORE STATISTICS*\n` +
    `1st Innings Avg: ${venueData.avgFirstInnings} runs\n` +
    `2nd Innings Avg: ${venueData.avgSecondInnings} runs\n\n` +
    `🎲 *TOSS ANALYSIS*\n` +
    `Batting First Wins: ${venueData.battingFirstWins}\n` +
    `Chasing Wins: ${venueData.chasingWins}\n` +
    `Chase Success: [${progressBar(chasingPct)}] ${chasingPct}%\n\n` +
    `${'─'.repeat(30)}\n` +
    `🏆 *TOP TEAMS AT ${venue}*\n`;

  sorted.slice(0, 5).forEach((s, i) => {
    msg += `${i + 1}. ${s.team}: ${s.wins} wins | Avg ${s.avgScore} runs\n`;
  });

  msg += `\n_Historical venue statistics_`;
  return msg;
}

/**
 * Format model performance metrics embed
 * @param {Array<{model: string, accuracy: number, precision: number, recall: number}>} metrics
 * @returns {string}
 */
function formatModelMetricsEmbed(metrics) {
  let msg =
    `🤖 *ML MODEL PERFORMANCE METRICS*\n` +
    `${'═'.repeat(30)}\n\n`;

  metrics.forEach((m) => {
    msg +=
      `📊 *${m.model}*\n` +
      `Accuracy:  [${progressBar(m.accuracy)}] ${m.accuracy}%\n` +
      `Precision: [${progressBar(m.precision)}] ${m.precision}%\n` +
      `Recall:    [${progressBar(m.recall)}] ${m.recall}%\n\n`;
  });

  const best = metrics.reduce((a, b) => (a.accuracy > b.accuracy ? a : b));
  msg += `${'─'.repeat(30)}\n🏆 Best Model: *${best.model}* (${best.accuracy}% accuracy)`;
  return msg;
}

// ─── HELPER ───────────────────────────────────────────────────────────────────

function generateInsight(data) {
  const winner = data.predictedWinner;
  const loser = winner === data.team1 ? data.team2 : data.team1;
  const margin = Math.abs(data.team1WinProb - data.team2WinProb);

  if (margin > 25) return `${winner} have a dominant advantage. ${loser} face an uphill battle.`;
  if (margin > 10) return `${winner} hold the edge, but ${loser} can't be ruled out.`;
  return `This is a closely contested match. Both teams have near-equal chances.`;
}

module.exports = {
  progressBar,
  dualProgressBar,
  getConfidenceIndicator,
  formatFormString,
  formatMatchPredictionEmbed,
  formatTeamStatsEmbed,
  formatHeadToHeadEmbed,
  formatSeasonSummaryEmbed,
  formatPlayerComparisonEmbed,
  formatVenueAnalysisEmbed,
  formatModelMetricsEmbed,
};
