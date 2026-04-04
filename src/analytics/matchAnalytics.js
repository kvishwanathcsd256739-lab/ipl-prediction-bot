/**
 * matchAnalytics.js
 * Core analytics calculations for IPL match predictions.
 */

'use strict';

// Team ranking (lower = stronger) used for prediction scoring
const TEAM_RANK = {
  CSK: 1, MI: 2, RCB: 3, KKR: 4, SRH: 5,
  RR: 6, GT: 7, DC: 8, PBKS: 9, LSG: 10,
};

// Probability bounds: capped to keep predictions within a credible range (never 100% certain)
const MIN_WIN_PROBABILITY = 30;
const MAX_WIN_PROBABILITY = 70;

// Historical head-to-head records { t1Wins, t2Wins, total }
const H2H_RECORDS = {
  'CSK-MI':   { t1: 20, t2: 12, total: 32 },
  'CSK-RCB':  { t1: 21, t2: 11, total: 32 },
  'MI-RCB':   { t1: 19, t2: 12, total: 31 },
  'KKR-CSK':  { t1: 14, t2: 17, total: 31 },
  'SRH-RCB':  { t1: 13, t2: 12, total: 25 },
  'RR-MI':    { t1: 13, t2: 15, total: 28 },
  'DC-MI':    { t1: 11, t2: 15, total: 26 },
  'GT-LSG':   { t1: 3,  t2: 2,  total: 5  },
};

/**
 * Retrieves H2H record relative to team1 and team2.
 * @param {string} team1
 * @param {string} team2
 * @returns {{ t1Wins: number, t2Wins: number, total: number }}
 */
function getH2HRecord(team1, team2) {
  const key1 = `${team1}-${team2}`;
  const key2 = `${team2}-${team1}`;
  if (H2H_RECORDS[key1]) {
    const r = H2H_RECORDS[key1];
    return { t1Wins: r.t1, t2Wins: r.t2, total: r.total };
  }
  if (H2H_RECORDS[key2]) {
    const r = H2H_RECORDS[key2];
    return { t1Wins: r.t2, t2Wins: r.t1, total: r.total };
  }
  return { t1Wins: 10, t2Wins: 10, total: 20 };
}

/**
 * Calculates win probability for team1 (0-100).
 * Considers team rank and H2H record.
 * @param {string} team1
 * @param {string} team2
 * @returns {number} team1 win probability percentage
 */
function calculateWinProbability(team1, team2) {
  const rank1 = TEAM_RANK[team1] || 5;
  const rank2 = TEAM_RANK[team2] || 5;
  const h2h = getH2HRecord(team1, team2);

  // Base probability from rank (inverted: lower rank = higher probability)
  const totalRank = rank1 + rank2;
  let prob = ((totalRank - rank1) / totalRank) * 100;

  // Adjust by H2H record (±5 points max)
  if (h2h.total > 0) {
    const h2hAdj = ((h2h.t1Wins / h2h.total) - 0.5) * 10;
    prob += h2hAdj;
  }

  return Math.min(Math.max(Math.round(prob), MIN_WIN_PROBABILITY), MAX_WIN_PROBABILITY);
}

/**
 * Calculates confidence level based on rank difference and H2H.
 * @param {string} team1
 * @param {string} team2
 * @returns {string} e.g. "75%"
 */
function calculateConfidence(team1, team2) {
  const rank1 = TEAM_RANK[team1] || 5;
  const rank2 = TEAM_RANK[team2] || 5;
  const diff = Math.abs(rank1 - rank2);
  if (diff >= 4) return '85%';
  if (diff >= 2) return '75%';
  return '65%';
}

/**
 * Predicts the match winner and related details.
 * @param {string} team1
 * @param {string} team2
 * @returns {{ winner: string, tossWinner: string, confidence: string, winProbability: number }}
 */
function predictMatch(team1, team2) {
  const prob = calculateWinProbability(team1, team2);
  const winner = prob >= 50 ? team1 : team2;
  const tossWinner = prob >= 50 ? team2 : team1; // heuristic: underdog slightly more likely to win toss
  const confidence = calculateConfidence(team1, team2);
  return { winner, tossWinner, confidence, winProbability: prob };
}

/**
 * Returns team strength scores (out of 10) for batting, bowling, and form.
 * @param {string} team1
 * @param {string} team2
 * @returns {{ batting: [number, number], bowling: [number, number], form: [number, number] }}
 */
function getTeamStrengthMetrics(team1, team2) {
  function strengthScore(team, aspect) {
    const rank = TEAM_RANK[team] || 5;
    const base = 11 - rank; // 10 for rank-1, 1 for rank-10
    const variance = { batting: 0, bowling: 0, form: 0 };
    // Slight variations per team/aspect
    if (aspect === 'batting') {
      if (['RCB', 'MI', 'CSK'].includes(team)) variance.batting = 1;
    } else if (aspect === 'bowling') {
      if (['MI', 'CSK', 'SRH'].includes(team)) variance.bowling = 1;
    } else if (aspect === 'form') {
      if (['GT', 'KKR'].includes(team)) variance.form = 1;
    }
    return Math.min(base + variance[aspect], 10);
  }

  return {
    batting: [strengthScore(team1, 'batting'), strengthScore(team2, 'batting')],
    bowling: [strengthScore(team1, 'bowling'), strengthScore(team2, 'bowling')],
    form:    [strengthScore(team1, 'form'),    strengthScore(team2, 'form')],
  };
}

/**
 * Returns venue-based pitch analytics.
 * @param {string} venue
 * @returns {{ pitchType: string, avgFirstInnings: number, chasingSuccess: number, description: string }}
 */
function getVenueAnalytics(venue) {
  const v = venue.toLowerCase();
  if (v.includes('chennai') || v.includes('chidambaram')) {
    return { pitchType: 'Spin-friendly', avgFirstInnings: 165, chasingSuccess: 45, description: 'Slower surface, assists spinners' };
  }
  if (v.includes('mumbai') || v.includes('wankhede')) {
    return { pitchType: 'Pace-friendly', avgFirstInnings: 170, chasingSuccess: 48, description: 'Pacers get early movement' };
  }
  if (v.includes('bangalore') || v.includes('chinnaswamy')) {
    return { pitchType: 'Batting paradise', avgFirstInnings: 190, chasingSuccess: 52, description: 'High-scoring ground, short boundaries' };
  }
  if (v.includes('hyderabad') || v.includes('rajiv')) {
    return { pitchType: 'Balanced', avgFirstInnings: 170, chasingSuccess: 50, description: 'Good surface for all types' };
  }
  if (v.includes('kolkata') || v.includes('eden')) {
    return { pitchType: 'Dew-affected', avgFirstInnings: 175, chasingSuccess: 54, description: 'Dew in evening, better for chasing' };
  }
  if (v.includes('ahmedabad') || v.includes('narendra')) {
    return { pitchType: 'Bowler-friendly', avgFirstInnings: 162, chasingSuccess: 46, description: 'Large ground, bowlers get help' };
  }
  return { pitchType: 'Balanced', avgFirstInnings: 170, chasingSuccess: 50, description: 'Standard T20 surface' };
}

/**
 * Aggregates all analytics for a given match entry.
 * @param {{ team1: string, team2: string, venue: string, date: string, time: string }} matchEntry
 * @returns {Object} Full analytics object
 */
function analyzeMatch(matchEntry) {
  const { team1, team2, venue, date, time } = matchEntry;
  const prediction = predictMatch(team1, team2);
  const h2h = getH2HRecord(team1, team2);
  const strength = getTeamStrengthMetrics(team1, team2);
  const venueStats = getVenueAnalytics(venue);

  return {
    match: { team1, team2, venue, date, time },
    prediction,
    h2h,
    strength,
    venueStats,
  };
}

module.exports = {
  analyzeMatch,
  calculateWinProbability,
  calculateConfidence,
  predictMatch,
  getTeamStrengthMetrics,
  getVenueAnalytics,
  getH2HRecord,
  TEAM_RANK,
};
