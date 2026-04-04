/**
 * chartGenerator.js
 * Generates text/emoji-based chart representations suitable for Telegram messages.
 * No native binary dependencies required.
 */

'use strict';

const BAR_FILLED = '█';
const BAR_EMPTY = '░';
const BAR_WIDTH = 10;

/**
 * Renders a single horizontal bar.
 * @param {number} value  - Current value
 * @param {number} max    - Maximum value (full bar)
 * @param {string} label  - Label shown before the bar
 * @returns {string} Formatted bar string with label, filled/empty blocks, and percentage
 */
function renderBar(value, max, label) {
  const ratio = max > 0 ? Math.min(value / max, 1) : 0;
  const filled = Math.round(ratio * BAR_WIDTH);
  const empty = BAR_WIDTH - filled;
  const bar = BAR_FILLED.repeat(filled) + BAR_EMPTY.repeat(empty);
  const pct = Math.round(ratio * 100);
  const paddedLabel = label.padEnd(6, ' ');
  return `${paddedLabel} ${bar} ${pct}%`;
}

/**
 * Generates a win-probability bar chart for two teams.
 * @param {string} team1
 * @param {string} team2
 * @param {number} team1WinPct  - e.g. 65 (out of 100)
 * @returns {string} Formatted chart string
 */
function generateWinProbabilityChart(team1, team2, team1WinPct) {
  const team2WinPct = 100 - team1WinPct;
  const lines = [
    '📊 *WIN PROBABILITY*',
    '`' + renderBar(team1WinPct, 100, team1.slice(0, 6)) + '`',
    '`' + renderBar(team2WinPct, 100, team2.slice(0, 6)) + '`',
  ];
  return lines.join('\n');
}

/**
 * Generates a head-to-head bar chart.
 * @param {string} team1
 * @param {string} team2
 * @param {number} t1Wins
 * @param {number} t2Wins
 * @returns {string}
 */
function generateH2HChart(team1, team2, t1Wins, t2Wins) {
  const total = t1Wins + t2Wins || 1;
  const lines = [
    '⚔️ *HEAD-TO-HEAD*',
    '`' + renderBar(t1Wins, total, team1.slice(0, 6)) + '  (' + t1Wins + ' wins)`',
    '`' + renderBar(t2Wins, total, team2.slice(0, 6)) + '  (' + t2Wins + ' wins)`',
  ];
  return lines.join('\n');
}

/**
 * Generates a simple score prediction visual.
 * @param {string} range  - e.g. "165-180"
 * @param {number} low    - lower bound
 * @param {number} high   - upper bound
 * @returns {string}
 */
function generateScorePredictionChart(range, low, high) {
  // Visual thermometer: map score onto 100-220 scale
  const min = 100;
  const max = 220;
  const lowFilled = Math.round(((low - min) / (max - min)) * BAR_WIDTH);
  const highFilled = Math.round(((high - min) / (max - min)) * BAR_WIDTH);
  const filled = Math.max(highFilled - lowFilled, 1);
  const before = BAR_EMPTY.repeat(Math.max(lowFilled, 0));
  const middle = BAR_FILLED.repeat(filled);
  const after = BAR_EMPTY.repeat(Math.max(BAR_WIDTH - lowFilled - filled, 0));
  const bar = before + middle + after;
  return `🎯 *PREDICTED TOTAL*\n\`${bar}\` *${range}* runs`;
}

/**
 * Generates a team-strength comparison chart across multiple metrics.
 * @param {string} team1
 * @param {string} team2
 * @param {Object} metrics  - { batting: [t1, t2], bowling: [t1, t2], form: [t1, t2] }
 * @returns {string}
 */
function generateStrengthChart(team1, team2, metrics) {
  const lines = ['💪 *TEAM STRENGTH COMPARISON*', ''];
  const metricLabels = { batting: '🏏 Batting', bowling: '🎳 Bowling', form: '📈 Form' };

  for (const [key, label] of Object.entries(metricLabels)) {
    const [t1Score, t2Score] = metrics[key] || [5, 5];
    const maxScore = Math.max(t1Score, t2Score, 1);
    const t1Label = team1.slice(0, 4).padEnd(4, ' ');
    const t2Label = team2.slice(0, 4).padEnd(4, ' ');
    lines.push(`${label}`);
    lines.push('`' + t1Label + ' ' + renderBar(t1Score, maxScore, '') + '`');
    lines.push('`' + t2Label + ' ' + renderBar(t2Score, maxScore, '') + '`');
    lines.push('');
  }

  return lines.join('\n').trim();
}

module.exports = {
  generateWinProbabilityChart,
  generateH2HChart,
  generateScorePredictionChart,
  generateStrengthChart,
  renderBar,
};
