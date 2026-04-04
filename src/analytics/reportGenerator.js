/**
 * Report Generator Module
 * Generates HTML dashboards, CSV exports, and text-based match summary reports.
 */

const fs = require('fs');
const path = require('path');

// ─── HTML DASHBOARD ───────────────────────────────────────────────────────────

/**
 * Generate an HTML dashboard for a match prediction
 * @param {object} data
 * @param {string} data.team1
 * @param {string} data.team2
 * @param {string} data.venue
 * @param {string} data.date
 * @param {number} data.team1WinProb
 * @param {number} data.team2WinProb
 * @param {string} data.predictedWinner
 * @param {number} data.confidence
 * @param {number} data.team1Score
 * @param {number} data.team2Score
 * @param {string} data.tossWinner
 * @param {string} data.keyPlayer
 * @param {object} [data.h2h]
 * @returns {string} HTML string
 */
function generateMatchDashboard(data) {
  const team1Color = getTeamHexColor(data.team1);
  const team2Color = getTeamHexColor(data.team2);
  const confColor = getConfidenceColor(data.confidence);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>IPL Match Prediction — ${data.team1} vs ${data.team2}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #0f0f1a;
      color: #e0e0e0;
      min-height: 100vh;
      padding: 24px;
    }
    .container { max-width: 900px; margin: 0 auto; }
    h1 {
      text-align: center;
      font-size: 2rem;
      color: #FFD700;
      margin-bottom: 8px;
      text-shadow: 0 0 20px rgba(255,215,0,0.3);
    }
    .subtitle { text-align: center; color: #aaa; margin-bottom: 32px; font-size: 1.1rem; }
    .card {
      background: #1a1a2e;
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 20px;
      border: 1px solid #333355;
      box-shadow: 0 4px 24px rgba(0,0,0,0.4);
    }
    .card-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #FFD700;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .teams-row {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 16px;
      text-align: center;
    }
    .team-box { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .team-name {
      font-size: 2rem;
      font-weight: 800;
      text-shadow: 0 0 16px rgba(255,255,255,0.2);
    }
    .vs-badge {
      font-size: 1.5rem;
      color: #aaa;
      font-weight: 700;
    }
    .prob-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 8px; }
    .prob-box { background: #0f0f1a; border-radius: 12px; padding: 16px; text-align: center; }
    .prob-value { font-size: 2.5rem; font-weight: 800; }
    .prob-label { color: #aaa; font-size: 0.9rem; margin-top: 4px; }
    .progress-bar-bg {
      background: #2a2a4a;
      border-radius: 999px;
      height: 18px;
      overflow: hidden;
      margin-top: 8px;
    }
    .progress-bar-fill {
      height: 100%;
      border-radius: 999px;
      transition: width 1s ease;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 8px;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .stat-item { background: #0f0f1a; border-radius: 12px; padding: 16px; text-align: center; }
    .stat-value { font-size: 1.8rem; font-weight: 800; color: #FFD700; }
    .stat-label { color: #aaa; font-size: 0.85rem; margin-top: 4px; }
    .winner-badge {
      background: linear-gradient(135deg, #FFD700, #FF9800);
      color: #1a1a1a;
      border-radius: 12px;
      padding: 16px 24px;
      text-align: center;
      font-size: 1.5rem;
      font-weight: 800;
      margin: 16px 0;
    }
    .h2h-bar { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
    .h2h-fill { border-radius: 999px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; }
    .footer { text-align: center; color: #555; font-size: 0.85rem; margin-top: 32px; }
    @media (max-width: 600px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .prob-row { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🏏 IPL Match Prediction</h1>
    <p class="subtitle">📅 ${data.date || 'Upcoming Match'} &nbsp;|&nbsp; 📍 ${data.venue}</p>

    <!-- Teams -->
    <div class="card">
      <div class="teams-row">
        <div class="team-box">
          <div class="team-name" style="color: ${team1Color}">${data.team1}</div>
          <div style="color: #aaa">Home</div>
        </div>
        <div class="vs-badge">VS</div>
        <div class="team-box">
          <div class="team-name" style="color: ${team2Color}">${data.team2}</div>
          <div style="color: #aaa">Away</div>
        </div>
      </div>
    </div>

    <!-- Win Probability -->
    <div class="card">
      <div class="card-title">🎯 Win Probability</div>
      <div class="prob-row">
        <div class="prob-box">
          <div class="prob-value" style="color: ${team1Color}">${data.team1WinProb}%</div>
          <div class="prob-label">${data.team1}</div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width:${data.team1WinProb}%; background:${team1Color}">
              ${data.team1WinProb}%
            </div>
          </div>
        </div>
        <div class="prob-box">
          <div class="prob-value" style="color: ${team2Color}">${data.team2WinProb}%</div>
          <div class="prob-label">${data.team2}</div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width:${data.team2WinProb}%; background:${team2Color}">
              ${data.team2WinProb}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Predicted Winner -->
    <div class="card">
      <div class="card-title">🏆 Prediction</div>
      <div class="winner-badge">🥇 ${data.predictedWinner} WINS</div>
      <div class="stats-grid" style="margin-top:16px">
        <div class="stat-item">
          <div class="stat-value" style="color:${confColor}">${data.confidence}%</div>
          <div class="stat-label">Confidence</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${data.team1Score}</div>
          <div class="stat-label">${data.team1} Score</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${data.team2Score}</div>
          <div class="stat-label">${data.team2} Score</div>
        </div>
      </div>
    </div>

    <!-- Key Info -->
    <div class="card">
      <div class="card-title">📋 Key Information</div>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value" style="font-size:1.2rem">${data.tossWinner}</div>
          <div class="stat-label">Toss Winner</div>
        </div>
        <div class="stat-item">
          <div class="stat-value" style="font-size:1.2rem">⭐</div>
          <div class="stat-label">Key Player: ${data.keyPlayer}</div>
        </div>
        <div class="stat-item">
          <div class="stat-value" style="font-size:1.2rem">📍</div>
          <div class="stat-label">${data.venue}</div>
        </div>
      </div>
    </div>

    ${
      data.h2h
        ? `<!-- Head to Head -->
    <div class="card">
      <div class="card-title">⚔️ Head-to-Head (${data.h2h.total} matches)</div>
      <div style="display:flex; align-items:center; gap:12px; margin-top:8px">
        <span style="color:${team1Color}; font-weight:700; min-width:40px">${data.team1}</span>
        <div style="flex:1">
          <div class="h2h-bar">
            <div class="h2h-fill" style="width:${(data.h2h.wins1 / data.h2h.total) * 100}%; background:${team1Color}; flex-shrink:0; min-width:30px">
              ${data.h2h.wins1}
            </div>
            <div class="h2h-fill" style="width:${(data.h2h.wins2 / data.h2h.total) * 100}%; background:${team2Color}; flex-shrink:0; min-width:30px">
              ${data.h2h.wins2}
            </div>
          </div>
        </div>
        <span style="color:${team2Color}; font-weight:700; min-width:40px; text-align:right">${data.team2}</span>
      </div>
    </div>`
        : ''
    }

    <div class="footer">
      Generated by IPL Prediction Bot &bull; ${new Date().toLocaleString('en-IN')}
    </div>
  </div>
</body>
</html>`;
}

/**
 * Generate HTML season standings dashboard
 * @param {Array<{team: string, wins: number, losses: number, nrr: number, avgScore: number}>} standings
 * @returns {string} HTML string
 */
function generateSeasonDashboard(standings) {
  const sorted = [...standings].sort((a, b) => b.wins - a.wins || b.nrr - a.nrr);

  const rows = sorted
    .map((t, i) => {
      const total = t.wins + t.losses;
      const winRate = total > 0 ? Math.round((t.wins / total) * 100) : 0;
      const color = getTeamHexColor(t.team);
      return `
      <tr>
        <td style="text-align:center; font-weight:700; color:#FFD700">${i + 1}</td>
        <td style="font-weight:700; color:${color}">${t.team}</td>
        <td style="color:#4CAF50; text-align:center">${t.wins}</td>
        <td style="color:#F44336; text-align:center">${t.losses}</td>
        <td style="text-align:center">${total}</td>
        <td style="color:${t.nrr >= 0 ? '#4CAF50' : '#F44336'}; text-align:center">${t.nrr >= 0 ? '+' : ''}${t.nrr.toFixed(3)}</td>
        <td style="text-align:center">${t.avgScore || 'N/A'}</td>
        <td>
          <div style="background:#2a2a4a; border-radius:999px; height:14px; overflow:hidden; width:100px">
            <div style="width:${winRate}%; height:100%; background:${color}; border-radius:999px"></div>
          </div>
        </td>
      </tr>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>IPL 2025 Season Standings</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #0f0f1a; color: #e0e0e0; padding: 24px; }
    h1 { text-align:center; color:#FFD700; margin-bottom:24px; font-size:2rem; }
    table { width:100%; border-collapse:collapse; background:#1a1a2e; border-radius:16px; overflow:hidden; }
    th { background:#16213e; color:#FFD700; padding:12px 16px; text-align:left; font-size:0.9rem; }
    td { padding:12px 16px; border-bottom:1px solid #333355; font-size:0.95rem; }
    tr:hover td { background:#16213e; }
    .footer { text-align:center; color:#555; margin-top:24px; font-size:0.85rem; }
  </style>
</head>
<body>
  <h1>🏆 IPL 2025 Season Standings</h1>
  <table>
    <thead>
      <tr>
        <th>#</th><th>Team</th><th>W</th><th>L</th><th>M</th><th>NRR</th><th>Avg Score</th><th>Win Rate</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">IPL Prediction Bot &bull; ${new Date().toLocaleString('en-IN')}</div>
</body>
</html>`;
}

// ─── CSV EXPORT ───────────────────────────────────────────────────────────────

/**
 * Convert an array of objects to CSV string
 * @param {Array<object>} data
 * @returns {string}
 */
function toCSV(data) {
  if (!data || data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => {
      const val = row[h] == null ? '' : String(row[h]);
      return val.includes(',') ? `"${val}"` : val;
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

/**
 * Generate CSV export for season standings
 * @param {Array} standings
 * @returns {string}
 */
function exportStandingsCSV(standings) {
  const data = standings.map((t) => ({
    Team: t.team,
    Wins: t.wins,
    Losses: t.losses,
    Matches: t.wins + t.losses,
    NRR: t.nrr,
    AvgScore: t.avgScore || '',
    AvgConceded: t.avgConceded || '',
  }));
  return toCSV(data);
}

/**
 * Generate CSV export for match prediction
 * @param {object} prediction
 * @returns {string}
 */
function exportPredictionCSV(prediction) {
  return toCSV([
    {
      Team1: prediction.team1,
      Team2: prediction.team2,
      Venue: prediction.venue,
      Date: prediction.date || '',
      PredictedWinner: prediction.predictedWinner,
      Team1WinProb: prediction.team1WinProb,
      Team2WinProb: prediction.team2WinProb,
      Confidence: prediction.confidence,
      Team1Score: prediction.team1Score,
      Team2Score: prediction.team2Score,
      TossWinner: prediction.tossWinner,
      KeyPlayer: prediction.keyPlayer,
    },
  ]);
}

// ─── TEXT REPORT ──────────────────────────────────────────────────────────────

/**
 * Generate a plain-text match summary report
 * @param {object} data
 * @returns {string}
 */
function generateMatchSummaryReport(data) {
  const divider = '='.repeat(50);
  const sep = '-'.repeat(50);
  return [
    divider,
    '           IPL MATCH PREDICTION REPORT',
    divider,
    `Match    : ${data.team1} vs ${data.team2}`,
    `Venue    : ${data.venue}`,
    `Date     : ${data.date || 'TBD'}`,
    sep,
    'WIN PROBABILITY',
    `  ${data.team1.padEnd(8)}: ${String(data.team1WinProb).padStart(3)}%`,
    `  ${data.team2.padEnd(8)}: ${String(data.team2WinProb).padStart(3)}%`,
    sep,
    'PREDICTION',
    `  Winner     : ${data.predictedWinner}`,
    `  Confidence : ${data.confidence}%`,
    `  ${data.team1} Score : ${data.team1Score} runs`,
    `  ${data.team2} Score : ${data.team2Score} runs`,
    sep,
    'KEY INFO',
    `  Toss Winner : ${data.tossWinner}`,
    `  Key Player  : ${data.keyPlayer}`,
    ...(data.h2h
      ? [
          sep,
          'HEAD-TO-HEAD',
          `  Total Matches : ${data.h2h.total}`,
          `  ${data.team1.padEnd(8)} Wins : ${data.h2h.wins1}`,
          `  ${data.team2.padEnd(8)} Wins : ${data.h2h.wins2}`,
        ]
      : []),
    divider,
    `Generated: ${new Date().toLocaleString('en-IN')}`,
    divider,
  ].join('\n');
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const TEAM_HEX = {
  CSK: '#F5A623',
  MI: '#1E90FF',
  RCB: '#EC1C24',
  DC: '#4169E1',
  KKR: '#9B59B6',
  PBKS: '#ED1B24',
  RR: '#EA1A85',
  SRH: '#FF8C00',
  GT: '#6C757D',
  LSG: '#17A2B8',
};

function getTeamHexColor(team) {
  return TEAM_HEX[team] || '#4CAF50';
}

function getConfidenceColor(confidence) {
  if (confidence >= 85) return '#4CAF50';
  if (confidence >= 70) return '#FFD700';
  if (confidence >= 55) return '#FF9800';
  return '#F44336';
}

module.exports = {
  generateMatchDashboard,
  generateSeasonDashboard,
  exportStandingsCSV,
  exportPredictionCSV,
  generateMatchSummaryReport,
  toCSV,
};
