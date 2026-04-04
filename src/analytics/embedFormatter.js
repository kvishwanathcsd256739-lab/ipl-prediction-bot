/**
 * embedFormatter.js
 * Formats analytics data into Telegram-compatible MarkdownV2 / Markdown messages.
 */

'use strict';

const {
  generateWinProbabilityChart,
  generateH2HChart,
  generateScorePredictionChart,
  generateStrengthChart,
} = require('./chartGenerator');

/**
 * Formats a complete analytics embed for a match.
 * @param {Object} analytics  - Output of analyzeMatch()
 * @returns {string} Telegram Markdown-formatted message
 */
function formatMatchAnalyticsEmbed(analytics) {
  const { match, prediction, h2h, strength, venueStats } = analytics;
  const { team1, team2, venue, date, time } = match;

  const winProb = generateWinProbabilityChart(team1, team2, prediction.winProbability);
  const h2hChart = generateH2HChart(team1, team2, h2h.t1Wins, h2h.t2Wins);
  const [scoreLow, scoreHigh] = [venueStats.avgFirstInnings - 8, venueStats.avgFirstInnings + 8];
  const scoreChart = generateScorePredictionChart(
    `${scoreLow}-${scoreHigh}`,
    scoreLow,
    scoreHigh,
  );
  const strengthChart = generateStrengthChart(team1, team2, strength);

  return `
📊 *MATCH ANALYTICS*
═══════════════════════════════════

🏏 *${team1}* vs *${team2}*
📍 ${venue}
📅 ${date} | ⏰ ${time}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${winProb}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${h2hChart}
Total meetings: ${h2h.total}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${scoreChart}
Pitch: ${venueStats.pitchType} | Chasing success: ${venueStats.chasingSuccess}%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${strengthChart}
`.trim();
}

/**
 * Formats a brief summary embed (single line per match).
 * @param {Object} analytics  - Output of analyzeMatch()
 * @returns {string}
 */
function formatMatchSummaryEmbed(analytics) {
  const { match, prediction } = analytics;
  const { team1, team2, venue, date } = match;
  const winEmoji = prediction.winProbability >= 60 ? '🟢' : prediction.winProbability <= 40 ? '🔴' : '🟡';
  return `${winEmoji} *${team1}* vs *${team2}* — Predicted: *${prediction.winner}* (${prediction.confidence}) | ${venue} | ${date}`;
}

/**
 * Formats a JSON-serialisable analytics object for REST API responses.
 * @param {Object} analytics  - Output of analyzeMatch()
 * @returns {Object} Plain object suitable for JSON serialisation in API responses
 */
function formatAnalyticsApiResponse(analytics) {
  const { match, prediction, h2h, venueStats, strength } = analytics;
  return {
    match,
    prediction: {
      winner: prediction.winner,
      tossWinner: prediction.tossWinner,
      confidence: prediction.confidence,
      winProbabilityTeam1: prediction.winProbability,
      winProbabilityTeam2: 100 - prediction.winProbability,
    },
    headToHead: {
      team1Wins: h2h.t1Wins,
      team2Wins: h2h.t2Wins,
      totalMeetings: h2h.total,
    },
    venue: venueStats,
    strength: {
      batting:  { [match.team1]: strength.batting[0],  [match.team2]: strength.batting[1] },
      bowling:  { [match.team1]: strength.bowling[0],  [match.team2]: strength.bowling[1] },
      form:     { [match.team1]: strength.form[0],     [match.team2]: strength.form[1] },
    },
  };
}

module.exports = {
  formatMatchAnalyticsEmbed,
  formatMatchSummaryEmbed,
  formatAnalyticsApiResponse,
};
