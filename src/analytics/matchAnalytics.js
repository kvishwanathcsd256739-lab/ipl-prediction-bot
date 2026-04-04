/**
 * Match Analytics Module
 * Provides advanced analytics functions for IPL match predictions,
 * team statistics, player performance, and venue analysis.
 */

const IPL_TEAMS = ['CSK', 'MI', 'RCB', 'DC', 'KKR', 'PBKS', 'RR', 'SRH', 'GT', 'LSG'];

const TEAM_FULL_NAMES = {
  CSK: 'Chennai Super Kings',
  MI: 'Mumbai Indians',
  RCB: 'Royal Challengers Bengaluru',
  DC: 'Delhi Capitals',
  KKR: 'Kolkata Knight Riders',
  PBKS: 'Punjab Kings',
  RR: 'Rajasthan Royals',
  SRH: 'Sunrisers Hyderabad',
  GT: 'Gujarat Titans',
  LSG: 'Lucknow Super Giants',
};

// Historical 2025 season statistics (used as fallback when DB data is unavailable)
const SEASON_STATS_2025 = {
  CSK: { wins: 8, losses: 6, nrr: 0.35, avgScore: 178, avgConceded: 169 },
  MI: { wins: 7, losses: 7, nrr: 0.12, avgScore: 174, avgConceded: 172 },
  RCB: { wins: 9, losses: 5, nrr: 0.52, avgScore: 182, avgConceded: 167 },
  DC: { wins: 6, losses: 8, nrr: -0.22, avgScore: 171, avgConceded: 177 },
  KKR: { wins: 10, losses: 4, nrr: 0.71, avgScore: 185, avgConceded: 163 },
  PBKS: { wins: 5, losses: 9, nrr: -0.45, avgScore: 168, avgConceded: 181 },
  RR: { wins: 8, losses: 6, nrr: 0.28, avgScore: 177, avgConceded: 170 },
  SRH: { wins: 7, losses: 7, nrr: 0.05, avgScore: 175, avgConceded: 173 },
  GT: { wins: 6, losses: 8, nrr: -0.18, avgScore: 170, avgConceded: 176 },
  LSG: { wins: 4, losses: 10, nrr: -0.61, avgScore: 163, avgConceded: 185 },
};

// Head-to-head historical records (2025 season)
const HEAD_TO_HEAD = {
  'CSK-MI': { team1Wins: 20, team2Wins: 12, total: 32 },
  'CSK-RCB': { team1Wins: 18, team2Wins: 14, total: 32 },
  'CSK-DC': { team1Wins: 17, team2Wins: 11, total: 28 },
  'CSK-KKR': { team1Wins: 15, team2Wins: 13, total: 28 },
  'CSK-PBKS': { team1Wins: 16, team2Wins: 10, total: 26 },
  'CSK-RR': { team1Wins: 14, team2Wins: 12, total: 26 },
  'CSK-SRH': { team1Wins: 13, team2Wins: 11, total: 24 },
  'MI-RCB': { team1Wins: 19, team2Wins: 13, total: 32 },
  'MI-DC': { team1Wins: 15, team2Wins: 12, total: 27 },
  'MI-KKR': { team1Wins: 16, team2Wins: 14, total: 30 },
  'RCB-KKR': { team1Wins: 14, team2Wins: 16, total: 30 },
  'KKR-SRH': { team1Wins: 13, team2Wins: 12, total: 25 },
};

// Venue statistics
const VENUE_STATS = {
  Chennai: {
    avgFirstInnings: 178,
    avgSecondInnings: 164,
    chasingWins: 38,
    battingFirstWins: 45,
    homeTeam: 'CSK',
    pitchType: 'Spin-friendly',
  },
  Mumbai: {
    avgFirstInnings: 182,
    avgSecondInnings: 175,
    chasingWins: 42,
    battingFirstWins: 40,
    homeTeam: 'MI',
    pitchType: 'Balanced',
  },
  Bangalore: {
    avgFirstInnings: 188,
    avgSecondInnings: 179,
    chasingWins: 40,
    battingFirstWins: 44,
    homeTeam: 'RCB',
    pitchType: 'Batting paradise',
  },
  Delhi: {
    avgFirstInnings: 175,
    avgSecondInnings: 168,
    chasingWins: 36,
    battingFirstWins: 46,
    homeTeam: 'DC',
    pitchType: 'Moderate pace',
  },
  Kolkata: {
    avgFirstInnings: 176,
    avgSecondInnings: 170,
    chasingWins: 41,
    battingFirstWins: 43,
    homeTeam: 'KKR',
    pitchType: 'Pacers assist',
  },
  Hyderabad: {
    avgFirstInnings: 173,
    avgSecondInnings: 167,
    chasingWins: 39,
    battingFirstWins: 44,
    homeTeam: 'SRH',
    pitchType: 'Hard and bouncy',
  },
  Ahmedabad: {
    avgFirstInnings: 180,
    avgSecondInnings: 172,
    chasingWins: 37,
    battingFirstWins: 47,
    homeTeam: 'GT',
    pitchType: 'Flat',
  },
  Jaipur: {
    avgFirstInnings: 177,
    avgSecondInnings: 169,
    chasingWins: 40,
    battingFirstWins: 42,
    homeTeam: 'RR',
    pitchType: 'Balanced',
  },
  Mohali: {
    avgFirstInnings: 172,
    avgSecondInnings: 166,
    chasingWins: 38,
    battingFirstWins: 44,
    homeTeam: 'PBKS',
    pitchType: 'Swing-friendly',
  },
  Lucknow: {
    avgFirstInnings: 174,
    avgSecondInnings: 168,
    chasingWins: 39,
    battingFirstWins: 43,
    homeTeam: 'LSG',
    pitchType: 'Moderate',
  },
};

// Sample player statistics for demonstration
const SAMPLE_BATTERS = [
  { name: 'Virat Kohli', team: 'RCB', runs: 741, average: 61.75, strikeRate: 154.8, fifties: 5, hundreds: 1 },
  { name: 'Ruturaj Gaikwad', team: 'CSK', runs: 583, average: 48.58, strikeRate: 142.3, fifties: 4, hundreds: 1 },
  { name: 'Shubman Gill', team: 'GT', runs: 521, average: 43.41, strikeRate: 139.6, fifties: 4, hundreds: 0 },
  { name: 'Sanju Samson', team: 'RR', runs: 498, average: 45.27, strikeRate: 148.2, fifties: 3, hundreds: 1 },
  { name: 'Suryakumar Yadav', team: 'MI', runs: 461, average: 38.41, strikeRate: 168.5, fifties: 3, hundreds: 0 },
  { name: 'KL Rahul', team: 'LSG', runs: 443, average: 40.27, strikeRate: 136.9, fifties: 4, hundreds: 0 },
  { name: 'David Warner', team: 'DC', runs: 432, average: 36.0, strikeRate: 149.4, fifties: 3, hundreds: 0 },
  { name: 'Jos Buttler', team: 'RR', runs: 411, average: 37.36, strikeRate: 151.7, fifties: 3, hundreds: 0 },
  { name: 'Rohit Sharma', team: 'MI', runs: 398, average: 33.16, strikeRate: 145.3, fifties: 2, hundreds: 1 },
  { name: 'Venkatesh Iyer', team: 'KKR', runs: 387, average: 38.7, strikeRate: 153.6, fifties: 2, hundreds: 0 },
];

const SAMPLE_BOWLERS = [
  { name: 'Jasprit Bumrah', team: 'MI', wickets: 20, economy: 6.82, average: 18.5, strikeRate: 16.3 },
  { name: 'Yuzvendra Chahal', team: 'RR', wickets: 18, economy: 7.54, average: 21.2, strikeRate: 16.9 },
  { name: 'Mohammed Siraj', team: 'RCB', wickets: 17, economy: 8.12, average: 22.6, strikeRate: 16.7 },
  { name: 'Rashid Khan', team: 'GT', wickets: 16, economy: 6.94, average: 20.1, strikeRate: 17.4 },
  { name: 'Kagiso Rabada', team: 'PBKS', wickets: 15, economy: 8.45, average: 23.8, strikeRate: 16.9 },
  { name: 'Josh Hazlewood', team: 'RCB', wickets: 14, economy: 7.86, average: 22.1, strikeRate: 16.9 },
  { name: 'Mitchell Starc', team: 'KKR', wickets: 14, economy: 8.23, average: 24.5, strikeRate: 17.9 },
  { name: 'Trent Boult', team: 'MI', wickets: 13, economy: 7.61, average: 21.8, strikeRate: 17.2 },
  { name: 'Varun Chakravarthy', team: 'KKR', wickets: 13, economy: 7.32, average: 22.9, strikeRate: 18.8 },
  { name: 'Arshdeep Singh', team: 'PBKS', wickets: 12, economy: 8.94, average: 26.4, strikeRate: 17.7 },
];

/**
 * Calculate win probability based on team statistics
 * @param {string} team1
 * @param {string} team2
 * @param {string} venue
 * @param {string} [tossWinner]
 * @param {string} [tossDecision] - 'bat' or 'bowl'
 * @returns {{ team1Prob: number, team2Prob: number, factors: object }}
 */
function calculateWinProbability(team1, team2, venue, tossWinner, tossDecision) {
  const stats1 = SEASON_STATS_2025[team1] || { wins: 7, losses: 7, nrr: 0 };
  const stats2 = SEASON_STATS_2025[team2] || { wins: 7, losses: 7, nrr: 0 };

  const total1 = stats1.wins + stats1.losses;
  const total2 = stats2.wins + stats2.losses;
  const winRate1 = total1 > 0 ? stats1.wins / total1 : 0.5;
  const winRate2 = total2 > 0 ? stats2.wins / total2 : 0.5;

  // NRR factor
  const nrrFactor1 = 0.5 + Math.tanh(stats1.nrr * 0.5) * 0.1;
  const nrrFactor2 = 0.5 + Math.tanh(stats2.nrr * 0.5) * 0.1;

  // Home advantage
  const venueData = VENUE_STATS[venue] || {};
  let homeBonus1 = 0;
  let homeBonus2 = 0;
  if (venueData.homeTeam === team1) homeBonus1 = 0.07;
  if (venueData.homeTeam === team2) homeBonus2 = 0.07;

  // H2H factor
  const teams = [team1, team2];
  const h2hKey = [...teams].sort().join('-');
  const h2h = HEAD_TO_HEAD[h2hKey] || { team1Wins: 5, team2Wins: 5, total: 10 };
  const isForward = teams.join('-') === h2hKey;
  const h2hWins1 = isForward ? (h2h.team1Wins || 5) : (h2h.team2Wins || 5);
  const h2hWins2 = isForward ? (h2h.team2Wins || 5) : (h2h.team1Wins || 5);
  const h2hRate1 = h2hWins1 / (h2h.total || 10);
  const h2hRate2 = h2hWins2 / (h2h.total || 10);

  // Toss factor
  let tossFactor1 = 0;
  let tossFactor2 = 0;
  if (tossWinner === team1) tossFactor1 = 0.03;
  if (tossWinner === team2) tossFactor2 = 0.03;

  const raw1 = winRate1 * 0.4 + nrrFactor1 * 0.15 + homeBonus1 + h2hRate1 * 0.2 + tossFactor1 + 0.25;
  const raw2 = winRate2 * 0.4 + nrrFactor2 * 0.15 + homeBonus2 + h2hRate2 * 0.2 + tossFactor2 + 0.25;
  const total = raw1 + raw2;

  const prob1 = Math.round((raw1 / total) * 100);
  const prob2 = 100 - prob1;

  return {
    team1Prob: prob1,
    team2Prob: prob2,
    factors: {
      winRate1: Math.round(winRate1 * 100),
      winRate2: Math.round(winRate2 * 100),
      homeAdvantage: venueData.homeTeam || 'Neutral',
      h2hLeader: h2hWins1 >= h2hWins2 ? team1 : team2,
      nrr1: stats1.nrr,
      nrr2: stats2.nrr,
    },
  };
}

/**
 * Get team comparison stats (normalized 0-10 scale)
 * @param {string} team
 * @returns {object}
 */
function getTeamStats(team) {
  const stats = SEASON_STATS_2025[team] || { wins: 7, losses: 7, nrr: 0, avgScore: 174, avgConceded: 174 };
  const winRate = stats.wins / (stats.wins + stats.losses);

  return {
    batting: Math.min(10, Math.round((stats.avgScore - 155) / 4)),
    bowling: Math.min(10, Math.round((185 - stats.avgConceded) / 3)),
    fielding: Math.round(5 + stats.nrr * 2),
    form: Math.round(winRate * 10),
    experience: Math.round(5 + (stats.wins - 7) * 0.3),
    headToHead: 5,
  };
}

/**
 * Get head-to-head stats between two teams
 * @param {string} team1
 * @param {string} team2
 * @returns {{ wins1: number, wins2: number, total: number, draws: number }}
 */
function getHeadToHeadStats(team1, team2) {
  const key = [team1, team2].sort().join('-');
  const h2h = HEAD_TO_HEAD[key];
  if (!h2h) {
    return { wins1: 8, wins2: 7, total: 15, draws: 0 };
  }
  const isForward = [team1, team2].join('-') === key;
  return {
    wins1: isForward ? h2h.team1Wins : h2h.team2Wins,
    wins2: isForward ? h2h.team2Wins : h2h.team1Wins,
    total: h2h.total,
    draws: 0,
  };
}

/**
 * Calculate predicted score range for a team at a venue
 * @param {string} team
 * @param {string} venue
 * @param {boolean} isBattingFirst
 * @returns {{ predicted: number, min: number, max: number, confidence: number }}
 */
function predictScore(team, venue, isBattingFirst) {
  const stats = SEASON_STATS_2025[team] || { avgScore: 174 };
  const venueData = VENUE_STATS[venue] || { avgFirstInnings: 175, avgSecondInnings: 168 };
  const venueAvg = isBattingFirst ? venueData.avgFirstInnings : venueData.avgSecondInnings;
  const predicted = Math.round((stats.avgScore + venueAvg) / 2);
  // Deterministic confidence: teams with more extreme NRR have wider variance
  const nrr = (SEASON_STATS_2025[team] || { nrr: 0 }).nrr;
  const confidence = Math.round(15 + Math.min(10, Math.abs(nrr) * 4));
  return {
    predicted,
    min: predicted - confidence,
    max: predicted + confidence,
    confidence,
  };
}

/**
 * Get venue performance data for all teams
 * @param {string} venue
 * @returns {Array<{team: string, wins: number, avgScore: number}>}
 */
function getVenuePerformance(venue) {
  const venueData = VENUE_STATS[venue];
  if (!venueData) return [];
  return IPL_TEAMS.map((team) => {
    const stats = SEASON_STATS_2025[team] || { wins: 7, avgScore: 174 };
    const homeBonus = venueData.homeTeam === team ? 2 : 0;
    return {
      team,
      wins: Math.max(0, stats.wins + homeBonus - 5),
      avgScore: Math.round((stats.avgScore + venueData.avgFirstInnings) / 2),
    };
  });
}

/**
 * Get season summary statistics for all teams
 * @returns {Array<{team: string, wins: number, losses: number, nrr: number}>}
 */
function getSeasonSummary() {
  return IPL_TEAMS.map((team) => ({
    team,
    ...SEASON_STATS_2025[team],
    fullName: TEAM_FULL_NAMES[team] || team,
  }));
}

/**
 * Get sample batting statistics for scatter plot
 * @param {string} [team] - filter by team, or null for all
 * @returns {Array}
 */
function getBattersData(team) {
  if (team) {
    return SAMPLE_BATTERS.filter((b) => b.team === team);
  }
  return SAMPLE_BATTERS;
}

/**
 * Get sample bowling statistics for scatter plot
 * @param {string} [team] - filter by team, or null for all
 * @returns {Array}
 */
function getBowlersData(team) {
  if (team) {
    return SAMPLE_BOWLERS.filter((b) => b.team === team);
  }
  return SAMPLE_BOWLERS;
}

/**
 * Get sample model performance metrics
 * @returns {Array<{model: string, accuracy: number, precision: number, recall: number}>}
 */
function getModelMetrics() {
  return [
    { model: 'Random Forest', accuracy: 87, precision: 85, recall: 86 },
    { model: 'XGBoost', accuracy: 89, precision: 88, recall: 87 },
    { model: 'Neural Net', accuracy: 85, precision: 84, recall: 83 },
    { model: 'Logistic Reg', accuracy: 78, precision: 77, recall: 76 },
    { model: 'Ensemble', accuracy: 91, precision: 90, recall: 89 },
  ];
}

/**
 * Get team recent form array (1=win, 0=loss) for last N matches
 * @param {string} team
 * @param {number} [n=10]
 * @returns {Array<number>}
 */
function getTeamRecentForm(team, n = 10) {
  const stats = SEASON_STATS_2025[team] || { wins: 7, losses: 7 };
  const total = stats.wins + stats.losses;
  const winRate = total > 0 ? stats.wins / total : 0.5;
  // Build a deterministic alternating pattern based on win rate,
  // ordered most-recent first (index 0 = most recent match).
  // Wins are spread evenly across the last n matches.
  const form = [];
  let winsLeft = Math.round(winRate * n);
  for (let i = 0; i < n; i++) {
    const remaining = n - i;
    if (winsLeft > 0 && (winsLeft / remaining >= 0.5 || winsLeft === remaining)) {
      form.push(1);
      winsLeft--;
    } else {
      form.push(0);
    }
  }
  return form;
}

module.exports = {
  IPL_TEAMS,
  TEAM_FULL_NAMES,
  SEASON_STATS_2025,
  HEAD_TO_HEAD,
  VENUE_STATS,
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
};
