const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const WIDTH = 800;
const HEIGHT = 500;

const IPL_TEAM_COLORS = {
  CSK: '#F5A623',
  MI: '#004BA0',
  RCB: '#EC1C24',
  DC: '#00008B',
  KKR: '#3A225D',
  PBKS: '#ED1B24',
  RR: '#EA1A85',
  SRH: '#FF822A',
  GT: '#1C1C1C',
  LSG: '#A0D4E8',
  DEFAULT: '#4CAF50',
};

function getTeamColor(team) {
  return IPL_TEAM_COLORS[team] || IPL_TEAM_COLORS.DEFAULT;
}

function createCanvas(width = WIDTH, height = HEIGHT) {
  return new ChartJSNodeCanvas({
    width,
    height,
    backgroundColour: '#1a1a2e',
    chartCallback: (ChartJS) => {
      ChartJS.defaults.color = '#e0e0e0';
      ChartJS.defaults.borderColor = '#333355';
      ChartJS.defaults.font = { family: 'sans-serif', size: 13 };
    },
  });
}

/**
 * Win Probability Pie Chart
 * @param {string} team1
 * @param {number} prob1 - probability 0-100
 * @param {string} team2
 * @param {number} prob2 - probability 0-100
 * @returns {Buffer} PNG buffer
 */
async function generateWinProbabilityChart(team1, prob1, team2, prob2) {
  const canvas = createCanvas(600, 400);
  const config = {
    type: 'pie',
    data: {
      labels: [team1, team2],
      datasets: [
        {
          data: [prob1, prob2],
          backgroundColor: [getTeamColor(team1), getTeamColor(team2)],
          borderColor: ['#ffffff', '#ffffff'],
          borderWidth: 2,
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: `Win Probability: ${team1} vs ${team2}`,
          color: '#ffffff',
          font: { size: 18, weight: 'bold' },
        },
        legend: {
          labels: {
            color: '#e0e0e0',
            font: { size: 14 },
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => ` ${context.label}: ${context.parsed}%`,
          },
        },
      },
    },
  };
  return canvas.renderToBuffer(config);
}

/**
 * Score Predictions Bar Chart with confidence intervals
 * @param {string} team1
 * @param {number} score1 - predicted score
 * @param {number} conf1 - confidence range ±
 * @param {string} team2
 * @param {number} score2 - predicted score
 * @param {number} conf2 - confidence range ±
 * @returns {Buffer} PNG buffer
 */
async function generateScorePredictionChart(team1, score1, conf1, team2, score2, conf2) {
  const canvas = createCanvas();
  const config = {
    type: 'bar',
    data: {
      labels: [team1, team2],
      datasets: [
        {
          label: 'Predicted Score',
          data: [score1, score2],
          backgroundColor: [
            `${getTeamColor(team1)}cc`,
            `${getTeamColor(team2)}cc`,
          ],
          borderColor: [getTeamColor(team1), getTeamColor(team2)],
          borderWidth: 2,
          borderRadius: 8,
        },
        {
          label: 'Confidence Range (±)',
          data: [conf1, conf2],
          backgroundColor: ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.15)'],
          borderColor: ['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.5)'],
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: `Score Predictions: ${team1} vs ${team2}`,
          color: '#ffffff',
          font: { size: 18, weight: 'bold' },
        },
        legend: { labels: { color: '#e0e0e0' } },
      },
      scales: {
        y: {
          beginAtZero: false,
          min: Math.min(score1, score2) - 30,
          title: { display: true, text: 'Runs', color: '#aaaaaa' },
          ticks: { color: '#cccccc' },
          grid: { color: '#333355' },
        },
        x: {
          ticks: { color: '#cccccc' },
          grid: { color: '#333355' },
        },
      },
    },
  };
  return canvas.renderToBuffer(config);
}

/**
 * Team Comparison Radar Chart
 * @param {string} team1
 * @param {string} team2
 * @param {object} team1Stats - { batting, bowling, fielding, form, experience, headToHead }
 * @param {object} team2Stats
 * @returns {Buffer} PNG buffer
 */
async function generateTeamComparisonChart(team1, team2, team1Stats, team2Stats) {
  const canvas = createCanvas();
  const labels = ['Batting', 'Bowling', 'Fielding', 'Form', 'Experience', 'H2H'];
  const config = {
    type: 'radar',
    data: {
      labels,
      datasets: [
        {
          label: team1,
          data: [
            team1Stats.batting,
            team1Stats.bowling,
            team1Stats.fielding,
            team1Stats.form,
            team1Stats.experience,
            team1Stats.headToHead,
          ],
          backgroundColor: `${getTeamColor(team1)}44`,
          borderColor: getTeamColor(team1),
          borderWidth: 2,
          pointBackgroundColor: getTeamColor(team1),
        },
        {
          label: team2,
          data: [
            team2Stats.batting,
            team2Stats.bowling,
            team2Stats.fielding,
            team2Stats.form,
            team2Stats.experience,
            team2Stats.headToHead,
          ],
          backgroundColor: `${getTeamColor(team2)}44`,
          borderColor: getTeamColor(team2),
          borderWidth: 2,
          pointBackgroundColor: getTeamColor(team2),
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: `Team Comparison: ${team1} vs ${team2}`,
          color: '#ffffff',
          font: { size: 18, weight: 'bold' },
        },
        legend: { labels: { color: '#e0e0e0' } },
      },
      scales: {
        r: {
          min: 0,
          max: 10,
          ticks: { color: '#aaaaaa', backdropColor: 'transparent' },
          grid: { color: '#333355' },
          pointLabels: { color: '#cccccc', font: { size: 12 } },
          angleLines: { color: '#333355' },
        },
      },
    },
  };
  return canvas.renderToBuffer(config);
}

/**
 * Head-to-Head Bar Chart
 * @param {string} team1
 * @param {string} team2
 * @param {number} wins1
 * @param {number} wins2
 * @param {number} draws
 * @returns {Buffer} PNG buffer
 */
async function generateHeadToHeadChart(team1, team2, wins1, wins2, draws) {
  const canvas = createCanvas(600, 400);
  const config = {
    type: 'bar',
    data: {
      labels: [team1, team2, 'No Result'],
      datasets: [
        {
          label: 'Matches Won',
          data: [wins1, wins2, draws],
          backgroundColor: [
            `${getTeamColor(team1)}cc`,
            `${getTeamColor(team2)}cc`,
            'rgba(180,180,180,0.6)',
          ],
          borderColor: [getTeamColor(team1), getTeamColor(team2), '#aaaaaa'],
          borderWidth: 2,
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: `Head-to-Head: ${team1} vs ${team2} (${wins1 + wins2 + draws} matches)`,
          color: '#ffffff',
          font: { size: 16, weight: 'bold' },
        },
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Wins', color: '#aaaaaa' },
          ticks: { color: '#cccccc' },
          grid: { color: '#333355' },
        },
        x: {
          ticks: { color: '#cccccc' },
          grid: { color: '#333355' },
        },
      },
    },
  };
  return canvas.renderToBuffer(config);
}

/**
 * Venue Performance Bar Chart
 * @param {string} venue
 * @param {Array<{team: string, wins: number, avgScore: number}>} venueStats
 * @returns {Buffer} PNG buffer
 */
async function generateVenuePerformanceChart(venue, venueStats) {
  const canvas = createCanvas();
  const labels = venueStats.map((s) => s.team);
  const config = {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Wins at Venue',
          data: venueStats.map((s) => s.wins),
          backgroundColor: labels.map((t) => `${getTeamColor(t)}cc`),
          borderColor: labels.map((t) => getTeamColor(t)),
          borderWidth: 2,
          borderRadius: 6,
          yAxisID: 'y',
        },
        {
          label: 'Avg Score at Venue',
          data: venueStats.map((s) => s.avgScore),
          type: 'line',
          borderColor: '#FFD700',
          backgroundColor: 'rgba(255,215,0,0.2)',
          borderWidth: 2,
          pointBackgroundColor: '#FFD700',
          yAxisID: 'y1',
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: `Venue Performance: ${venue}`,
          color: '#ffffff',
          font: { size: 18, weight: 'bold' },
        },
        legend: { labels: { color: '#e0e0e0' } },
      },
      scales: {
        y: {
          beginAtZero: true,
          position: 'left',
          title: { display: true, text: 'Wins', color: '#aaaaaa' },
          ticks: { color: '#cccccc' },
          grid: { color: '#333355' },
        },
        y1: {
          beginAtZero: false,
          position: 'right',
          title: { display: true, text: 'Avg Score', color: '#FFD700' },
          ticks: { color: '#FFD700' },
          grid: { drawOnChartArea: false },
        },
        x: {
          ticks: { color: '#cccccc' },
          grid: { color: '#333355' },
        },
      },
    },
  };
  return canvas.renderToBuffer(config);
}

/**
 * Team Form Line Chart (last N matches)
 * @param {string} team1
 * @param {string} team2
 * @param {Array<number>} form1 - 1=win, 0=loss per match
 * @param {Array<number>} form2
 * @returns {Buffer} PNG buffer
 */
async function generateFormAnalysisChart(team1, team2, form1, form2) {
  const canvas = createCanvas();
  const labels = form1.map((_, i) => `M${i + 1}`);

  const cumSum = (arr) =>
    arr.reduce((acc, v, i) => {
      acc.push((acc[i - 1] || 0) + v);
      return acc;
    }, []);

  const config = {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: `${team1} Cumulative Wins`,
          data: cumSum(form1),
          borderColor: getTeamColor(team1),
          backgroundColor: `${getTeamColor(team1)}33`,
          borderWidth: 3,
          pointBackgroundColor: getTeamColor(team1),
          fill: true,
          tension: 0.3,
        },
        {
          label: `${team2} Cumulative Wins`,
          data: cumSum(form2),
          borderColor: getTeamColor(team2),
          backgroundColor: `${getTeamColor(team2)}33`,
          borderWidth: 3,
          pointBackgroundColor: getTeamColor(team2),
          fill: true,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: 'Recent Form Analysis (Cumulative Wins)',
          color: '#ffffff',
          font: { size: 18, weight: 'bold' },
        },
        legend: { labels: { color: '#e0e0e0' } },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Cumulative Wins', color: '#aaaaaa' },
          ticks: { color: '#cccccc' },
          grid: { color: '#333355' },
        },
        x: {
          ticks: { color: '#cccccc' },
          grid: { color: '#333355' },
        },
      },
    },
  };
  return canvas.renderToBuffer(config);
}

/**
 * Batting Strike Rate vs Average Scatter Plot
 * @param {Array<{name: string, average: number, strikeRate: number, team: string}>} players
 * @returns {Buffer} PNG buffer
 */
async function generateBattingScatterChart(players) {
  const canvas = createCanvas();
  const datasets = [];
  const teamGroups = {};
  players.forEach((p) => {
    if (!teamGroups[p.team]) teamGroups[p.team] = [];
    teamGroups[p.team].push({ x: p.average, y: p.strikeRate, label: p.name });
  });
  for (const [team, pts] of Object.entries(teamGroups)) {
    datasets.push({
      label: team,
      data: pts,
      backgroundColor: `${getTeamColor(team)}99`,
      borderColor: getTeamColor(team),
      borderWidth: 1,
      pointRadius: 7,
    });
  }
  const config = {
    type: 'scatter',
    data: { datasets },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: 'Batting: Strike Rate vs Average',
          color: '#ffffff',
          font: { size: 18, weight: 'bold' },
        },
        legend: { labels: { color: '#e0e0e0' } },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              `${ctx.raw.label} — Avg: ${ctx.raw.x}, SR: ${ctx.raw.y}`,
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: 'Batting Average', color: '#aaaaaa' },
          ticks: { color: '#cccccc' },
          grid: { color: '#333355' },
        },
        y: {
          title: { display: true, text: 'Strike Rate', color: '#aaaaaa' },
          ticks: { color: '#cccccc' },
          grid: { color: '#333355' },
        },
      },
    },
  };
  return canvas.renderToBuffer(config);
}

/**
 * Bowling Economy vs Wickets Scatter Plot
 * @param {Array<{name: string, economy: number, wickets: number, team: string}>} bowlers
 * @returns {Buffer} PNG buffer
 */
async function generateBowlingScatterChart(bowlers) {
  const canvas = createCanvas();
  const teamGroups = {};
  bowlers.forEach((b) => {
    if (!teamGroups[b.team]) teamGroups[b.team] = [];
    teamGroups[b.team].push({ x: b.economy, y: b.wickets, label: b.name });
  });
  const datasets = Object.entries(teamGroups).map(([team, pts]) => ({
    label: team,
    data: pts,
    backgroundColor: `${getTeamColor(team)}99`,
    borderColor: getTeamColor(team),
    borderWidth: 1,
    pointRadius: 7,
  }));
  const config = {
    type: 'scatter',
    data: { datasets },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: 'Bowling: Economy Rate vs Wickets',
          color: '#ffffff',
          font: { size: 18, weight: 'bold' },
        },
        legend: { labels: { color: '#e0e0e0' } },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              `${ctx.raw.label} — Eco: ${ctx.raw.x}, Wkts: ${ctx.raw.y}`,
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: 'Economy Rate', color: '#aaaaaa' },
          ticks: { color: '#cccccc' },
          grid: { color: '#333355' },
        },
        y: {
          title: { display: true, text: 'Wickets', color: '#aaaaaa' },
          ticks: { color: '#cccccc' },
          grid: { color: '#333355' },
        },
      },
    },
  };
  return canvas.renderToBuffer(config);
}

/**
 * Season Win/Loss Distribution Bar Chart
 * @param {Array<{team: string, wins: number, losses: number}>} seasonStats
 * @returns {Buffer} PNG buffer
 */
async function generateSeasonDistributionChart(seasonStats) {
  const canvas = createCanvas();
  const labels = seasonStats.map((s) => s.team);
  const config = {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Wins',
          data: seasonStats.map((s) => s.wins),
          backgroundColor: 'rgba(76,175,80,0.8)',
          borderColor: '#4CAF50',
          borderWidth: 2,
          borderRadius: 6,
          stack: 'stack0',
        },
        {
          label: 'Losses',
          data: seasonStats.map((s) => s.losses),
          backgroundColor: 'rgba(244,67,54,0.8)',
          borderColor: '#F44336',
          borderWidth: 2,
          borderRadius: 6,
          stack: 'stack0',
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: 'IPL 2025 Season Win/Loss Distribution',
          color: '#ffffff',
          font: { size: 18, weight: 'bold' },
        },
        legend: { labels: { color: '#e0e0e0' } },
      },
      scales: {
        y: {
          stacked: true,
          beginAtZero: true,
          title: { display: true, text: 'Matches', color: '#aaaaaa' },
          ticks: { color: '#cccccc' },
          grid: { color: '#333355' },
        },
        x: {
          stacked: true,
          ticks: { color: '#cccccc' },
          grid: { color: '#333355' },
        },
      },
    },
  };
  return canvas.renderToBuffer(config);
}

/**
 * Model Performance Metrics Chart
 * @param {Array<{model: string, accuracy: number, precision: number, recall: number}>} metrics
 * @returns {Buffer} PNG buffer
 */
async function generateModelPerformanceChart(metrics) {
  const canvas = createCanvas();
  const labels = metrics.map((m) => m.model);
  const config = {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Accuracy (%)',
          data: metrics.map((m) => m.accuracy),
          backgroundColor: 'rgba(33,150,243,0.8)',
          borderColor: '#2196F3',
          borderWidth: 2,
          borderRadius: 6,
        },
        {
          label: 'Precision (%)',
          data: metrics.map((m) => m.precision),
          backgroundColor: 'rgba(76,175,80,0.8)',
          borderColor: '#4CAF50',
          borderWidth: 2,
          borderRadius: 6,
        },
        {
          label: 'Recall (%)',
          data: metrics.map((m) => m.recall),
          backgroundColor: 'rgba(255,152,0,0.8)',
          borderColor: '#FF9800',
          borderWidth: 2,
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: 'ML Model Performance Metrics',
          color: '#ffffff',
          font: { size: 18, weight: 'bold' },
        },
        legend: { labels: { color: '#e0e0e0' } },
      },
      scales: {
        y: {
          beginAtZero: false,
          min: 50,
          max: 100,
          title: { display: true, text: 'Score (%)', color: '#aaaaaa' },
          ticks: { color: '#cccccc' },
          grid: { color: '#333355' },
        },
        x: {
          ticks: { color: '#cccccc' },
          grid: { color: '#333355' },
        },
      },
    },
  };
  return canvas.renderToBuffer(config);
}

module.exports = {
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
  getTeamColor,
  IPL_TEAM_COLORS,
};
