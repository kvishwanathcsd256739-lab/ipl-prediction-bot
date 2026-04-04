/**
 * src/analytics/index.js
 * Entry point for the analytics module.
 * Re-exports all public APIs for convenient import.
 */

'use strict';

const chartGenerator = require('./chartGenerator');
const matchAnalytics = require('./matchAnalytics');
const embedFormatter = require('./embedFormatter');
const reportGenerator = require('./reportGenerator');

module.exports = {
  // Chart generation
  generateWinProbabilityChart: chartGenerator.generateWinProbabilityChart,
  generateH2HChart: chartGenerator.generateH2HChart,
  generateScorePredictionChart: chartGenerator.generateScorePredictionChart,
  generateStrengthChart: chartGenerator.generateStrengthChart,

  // Match analytics
  analyzeMatch: matchAnalytics.analyzeMatch,
  calculateWinProbability: matchAnalytics.calculateWinProbability,
  calculateConfidence: matchAnalytics.calculateConfidence,
  predictMatch: matchAnalytics.predictMatch,
  getTeamStrengthMetrics: matchAnalytics.getTeamStrengthMetrics,
  getVenueAnalytics: matchAnalytics.getVenueAnalytics,
  getH2HRecord: matchAnalytics.getH2HRecord,

  // Embed formatting
  formatMatchAnalyticsEmbed: embedFormatter.formatMatchAnalyticsEmbed,
  formatMatchSummaryEmbed: embedFormatter.formatMatchSummaryEmbed,
  formatAnalyticsApiResponse: embedFormatter.formatAnalyticsApiResponse,

  // Report generation
  generateDailyReport: reportGenerator.generateDailyReport,
  generateWeeklyReport: reportGenerator.generateWeeklyReport,
  generateApiReport: reportGenerator.generateApiReport,
};
