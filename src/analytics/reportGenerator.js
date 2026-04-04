/**
 * reportGenerator.js
 * Generates daily/weekly reports from match analytics data.
 */

'use strict';

const { analyzeMatch } = require('./matchAnalytics');
const { formatMatchSummaryEmbed } = require('./embedFormatter');

/**
 * Generates a daily match-day report for a list of schedule entries.
 * @param {Array<Object>} matches  - Array of schedule entries (team1, team2, venue, date, time)
 * @param {boolean} isToday        - Whether the matches are for today
 * @returns {string} Telegram Markdown-formatted report
 */
function generateDailyReport(matches, isToday = true) {
  if (!matches || matches.length === 0) {
    return '📋 *No matches scheduled.*';
  }

  const header = isToday
    ? '📋 *TODAY\'S MATCH REPORT*'
    : `📋 *UPCOMING MATCH REPORT*`;

  const lines = [
    header,
    '═══════════════════════════════════',
    '',
  ];

  for (const match of matches) {
    const analytics = analyzeMatch(match);
    lines.push(formatMatchSummaryEmbed(analytics));
    lines.push('');
  }

  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push(`_Report generated: ${new Date().toUTCString()}_`);

  return lines.join('\n').trim();
}

/**
 * Generates a weekly summary report from an array of analytics objects.
 * @param {Array<Object>} analyticsArr  - Output of analyzeMatch() for multiple matches
 * @returns {string}
 */
function generateWeeklyReport(analyticsArr) {
  if (!analyticsArr || analyticsArr.length === 0) {
    return '📋 *No data for weekly report.*';
  }

  const lines = [
    '📊 *WEEKLY IPL REPORT*',
    '═══════════════════════════════════',
    '',
    `Total matches analyzed: *${analyticsArr.length}*`,
    '',
  ];

  // Team win frequency
  const winCount = {};
  for (const a of analyticsArr) {
    const w = a.prediction.winner;
    winCount[w] = (winCount[w] || 0) + 1;
  }

  const sorted = Object.entries(winCount).sort((a, b) => b[1] - a[1]);
  lines.push('🏆 *Predicted Winners This Week*');
  for (const [team, count] of sorted) {
    lines.push(`  • ${team}: ${count} match${count !== 1 ? 'es' : ''}`);
  }

  lines.push('');
  lines.push('📅 *Match Schedule*');
  for (const a of analyticsArr) {
    const { team1, team2, date } = a.match;
    lines.push(`  • ${date}: ${team1} vs ${team2} → *${a.prediction.winner}*`);
  }

  lines.push('');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push(`_Report generated: ${new Date().toUTCString()}_`);

  return lines.join('\n').trim();
}

/**
 * Generates a JSON report for the REST API from an array of schedule entries.
 * @param {Array<Object>} matches
 * @returns {Array<Object>}
 */
function generateApiReport(matches) {
  if (!matches || matches.length === 0) return [];
  return matches.map((m) => {
    const a = analyzeMatch(m);
    return {
      match: a.match,
      winner: a.prediction.winner,
      tossWinner: a.prediction.tossWinner,
      confidence: a.prediction.confidence,
      winProbability: a.prediction.winProbability,
      pitchType: a.venueStats.pitchType,
      avgFirstInnings: a.venueStats.avgFirstInnings,
    };
  });
}

module.exports = {
  generateDailyReport,
  generateWeeklyReport,
  generateApiReport,
};
