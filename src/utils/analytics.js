const generateFreeAnalysis = (matchData) => {
  return `
📊 *FREE MATCH ANALYSIS*
═══════════════════════════════════

🎯 *MATCH DETAILS*
• ${matchData.team1} vs ${matchData.team2}
• Venue: ${matchData.venue}
• Date: ${matchData.date}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ *TEAM FORM (Last 5 Matches)*
${matchData.team1} Stats:
${matchData.team1Form || '✅ W | ✅ W | ✅ W | ❌ L | ✅ W'}

${matchData.team2} Stats:
${matchData.team2Form || '❌ L | ✅ W | ❌ L | ✅ W | ✅ W'}

2️⃣ *KEY PLAYERS IN FORM*
🟢 ${matchData.team1} Stars:
   ${matchData.team1Stars || 'Elite batters and bowlers'}

🔵 ${matchData.team2} Stars:
   ${matchData.team2Stars || 'Elite batters and bowlers'}

3️⃣ *PITCH REPORT*
${matchData.pitchReport || 'Good batting pitch'}

4️⃣ *WEATHER REPORT*
${matchData.weather || 'Clear weather ☀️'}

5️⃣ *HEAD-TO-HEAD HISTORY*
📈 Total Matches: ${matchData.h2hTotal || '20'}
   ${matchData.team1} Wins: ${matchData.team1H2hWins || '12'}
   ${matchData.team2} Wins: ${matchData.team2H2hWins || '8'}

6️⃣ *VENUE ADVANTAGE*
${matchData.venueAdvantage || 'Balanced ground'}

7️⃣ *TOSS TREND*
${matchData.tossTrend || 'Teams prefer chasing'}

8️⃣ *TEAM STRENGTH*
Batting: ${matchData.battingStrong || 'Team 1'}
Bowling: ${matchData.bowlingStrong || 'Team 2'}

9️⃣ *STAR PLAYERS TO WATCH* ⭐
🌟 Virat Kohli
🌟 Ruturaj Gaikwad
🌟 Jasprit Bumrah
🌟 Ravindra Jadeja
🌟 Shivam Dube
🌟 MS Dhoni

🔟 *PLAYER PERFORMANCE PREDICTIONS*
${matchData.playerPredictions || '• Kohli 40+ runs • Ruturaj 35+ runs • Dube 2+ sixes'}

1️⃣1️⃣ *RECORDS & MILESTONES*
${matchData.milestones || '• Possible centuries • Quick 30s'}

1️⃣2️⃣ *MATCH FLOW PREDICTIONS*
Powerplay: ${matchData.powPlayScore || '45-60'} runs
Total Expected: ${matchData.expectedTotal || '160-185'} runs

1️⃣3️⃣ *RISK FACTORS* ⚠️
${matchData.riskFactors || '• Collapse risk • Weather uncertainty'}

1️⃣4️⃣ *TEAM INSIGHTS* 💡
${matchData.insights || '• Balanced squads • Key players crucial'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💎 *WANT FINAL ANSWER?*
✅ Predicted Winner
✅ Toss Winner
✅ Confidence Level
✅ Key Player Analysis

💰 Pay ₹49 to UNLOCK!
`;
};

const formatPremiumPrediction = (prediction) => {
  return `
🏆 *PREMIUM PREDICTION - UNLOCKED!* 🏆
═══════════════════════════════════

🎯 *MATCH*
${prediction.team1} vs ${prediction.team2}
📍 Venue: ${prediction.venue}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ *PREDICTED WINNER*
🏅 *${prediction.premiumPrediction.winner}*

✅ *PREDICTED TOSS WINNER*
🎲 *${prediction.premiumPrediction.tossWinner}*

✅ *CONFIDENCE LEVEL*
📊 *${prediction.premiumPrediction.confidence} CONFIDENT*

✅ *KEY PLAYER TO WATCH*
⭐ *${prediction.premiumPrediction.keyPlayer}*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ Valid for 7 days
🔄 Get updates for all upcoming matches
💎 Premium subscriber benefits activated

Good luck! 🏏
`;
};

const IPL_TEAMS = ["CSK", "MI", "RCB", "DC", "KKR", "PBKS", "RR", "SRH", "GT", "LSG"];

const VENUES = [
  "Chennai", "Mumbai", "Bangalore", "Delhi", "Kolkata",
  "Mohali", "Jaipur", "Hyderabad", "Ahmedabad", "Lucknow"
];

const CONFIDENCE_LEVELS = ["50%", "60%", "70%", "80%", "90%", "100%"];

module.exports = {
  generateFreeAnalysis,
  formatPremiumPrediction,
  IPL_TEAMS,
  VENUES,
  CONFIDENCE_LEVELS,
};