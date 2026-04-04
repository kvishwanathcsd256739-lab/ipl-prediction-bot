/**
 * Analytics Module — Public API
 * Aggregates all analytics submodules for easy import.
 */

const chartGenerator = require('./chartGenerator');
const matchAnalytics = require('./matchAnalytics');
const embedFormatter = require('./embedFormatter');
const reportGenerator = require('./reportGenerator');

module.exports = {
  ...chartGenerator,
  ...matchAnalytics,
  ...embedFormatter,
  ...reportGenerator,
  charts: chartGenerator,
  analytics: matchAnalytics,
  formatter: embedFormatter,
  reports: reportGenerator,
};
