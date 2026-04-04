/**
 * Utility functions for the /start command's comprehensive today's match analysis.
 */

const DEFAULT_PAYMENT_AMOUNT = 4900; // in paise (100 paise = ₹1, so 4900 paise = ₹49)

/**
 * Returns an emoji confidence indicator based on the confidence value.
 * @param {string|number} confidence - Confidence value like "85%" or 85
 * @returns {string} Emoji indicator
 */
const getConfidenceEmoji = (confidence) => {
  const value = parseInt(String(confidence).replace('%', ''), 10);
  if (value >= 85) return '🟢';
  if (value >= 70) return '🟡';
  return '🔴';
};

/**
 * Returns a confidence label string.
 * @param {string|number} confidence
 * @returns {string}
 */
const getConfidenceLabel = (confidence) => {
  const value = parseInt(String(confidence).replace('%', ''), 10);
  if (value >= 85) return 'HIGH';
  if (value >= 70) return 'MEDIUM';
  return 'LOW';
};

/**
 * Formats a form array like ['W','L','W'] into emoji string.
 * @param {string[]} form
 * @returns {string}
 */
const formatForm = (form) => {
  if (!form || form.length === 0) return 'N/A';
  return form.map(r => (r === 'W' ? '✅' : '❌')).join(' ');
};

/**
 * Builds the summary embed/message for all today's matches.
 * @param {Array} predictions - Array of Prediction documents for today
 * @param {string} firstName - User's first name
 * @returns {string} Formatted message
 */
const buildTodayMatchesSummary = (predictions, firstName) => {
  const dateStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  let msg = `🏏 *WELCOME, ${firstName}!* 🏏\n\n`;
  msg += `📅 *TODAY'S IPL ANALYSIS*\n`;
  msg += `🗓 ${dateStr}\n`;
  msg += `═══════════════════════════════════\n\n`;
  msg += `🎯 *${predictions.length} Match${predictions.length !== 1 ? 'es' : ''} Today*\n\n`;

  predictions.forEach((pred, idx) => {
    const conf = pred.premiumPrediction?.confidence || pred.freeAnalysis?.confidence || '70%';
    const confEmoji = getConfidenceEmoji(conf);
    const confLabel = getConfidenceLabel(conf);

    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🏟 *MATCH ${idx + 1}*\n`;
    msg += `⚔️  *${pred.team1} vs ${pred.team2}*\n`;
    if (pred.venue) msg += `📍 Venue: ${pred.venue}\n`;

    if (pred.date) {
      const matchTime = new Date(pred.date).toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', hour12: true
      });
      msg += `⏰ Time: ${matchTime} IST\n`;

      const now = new Date();
      const matchDate = new Date(pred.date);
      const diffMs = matchDate - now;
      if (diffMs > 0) {
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        if (diffHrs > 0) {
          msg += `⏳ Starts in: ${diffHrs}h ${diffMins}m\n`;
        } else if (diffMins > 0) {
          msg += `⏳ Starts in: ${diffMins} mins\n`;
        } else {
          msg += `🔴 *LIVE NOW!*\n`;
        }
      }
    }

    msg += `\n${confEmoji} *Prediction Confidence: ${conf} (${confLabel})*\n`;

    if (pred.premiumPrediction?.winner) {
      msg += `🏆 *Predicted Winner: ${pred.premiumPrediction.winner}*\n`;
    }

    const h2h = pred.freeAnalysis?.headToHead;
    if (h2h) {
      msg += `📊 H2H: ${pred.team1} ${h2h.team1Wins || 0}W - ${h2h.team2Wins || 0}W `;
      msg += `(${h2h.totalMatches || 0} matches)\n`;
    }

    msg += `\n📲 Tap button below for full analysis\n`;
  });

  msg += `\n═══════════════════════════════════\n`;
  msg += `💎 Unlock premium for winner predictions!\n`;
  msg += `📊 FREE analysis for every match!\n`;

  return msg;
};

/**
 * Builds a detailed analysis message for a single match prediction.
 * @param {Object} pred - Prediction document
 * @param {number} matchIndex - 0-based index
 * @returns {string} Formatted detailed message
 */
const buildMatchDetailMessage = (pred, matchIndex) => {
  const conf = pred.premiumPrediction?.confidence || pred.freeAnalysis?.confidence || '70%';
  const confEmoji = getConfidenceEmoji(conf);
  const confLabel = getConfidenceLabel(conf);
  const fa = pred.freeAnalysis || {};

  let msg = `🏏 *MATCH ${matchIndex + 1} DETAILED ANALYSIS*\n`;
  msg += `═══════════════════════════════════\n\n`;
  msg += `⚔️  *${pred.team1} vs ${pred.team2}*\n`;
  if (pred.venue) msg += `📍 *Venue:* ${pred.venue}\n`;
  if (pred.date) {
    const matchTime = new Date(pred.date).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });
    const matchDateStr = new Date(pred.date).toLocaleDateString('en-IN');
    msg += `📅 *Date:* ${matchDateStr} at ${matchTime} IST\n`;
  }
  msg += `\n`;

  // Prediction analysis
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📊 *PREDICTION ANALYSIS*\n\n`;
  msg += `${confEmoji} *Confidence: ${conf} (${confLabel})*\n`;

  if (pred.premiumPrediction?.winner) {
    msg += `🏆 *Predicted Winner: ${pred.premiumPrediction.winner}*\n`;
  }
  if (pred.premiumPrediction?.tossWinner) {
    msg += `🎲 *Toss Winner: ${pred.premiumPrediction.tossWinner}*\n`;
  }
  if (pred.premiumPrediction?.keyPlayer) {
    msg += `⭐ *Key Player: ${pred.premiumPrediction.keyPlayer}*\n`;
  }
  msg += `\n`;

  // Team form
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📈 *TEAM FORM (Last 5 Matches)*\n\n`;
  if (fa.team1Form && fa.team1Form.length > 0) {
    msg += `${pred.team1}: ${formatForm(fa.team1Form)}\n`;
  }
  if (fa.team2Form && fa.team2Form.length > 0) {
    msg += `${pred.team2}: ${formatForm(fa.team2Form)}\n`;
  }
  if ((!fa.team1Form || fa.team1Form.length === 0) && (!fa.team2Form || fa.team2Form.length === 0)) {
    msg += `Form data not available\n`;
  }
  msg += `\n`;

  // Head-to-head
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `🤝 *HEAD-TO-HEAD RECORD*\n\n`;
  const h2h = fa.headToHead;
  if (h2h) {
    msg += `📊 Total Matches: ${h2h.totalMatches || 0}\n`;
    msg += `🏅 ${pred.team1} Wins: ${h2h.team1Wins || 0}\n`;
    msg += `🏅 ${pred.team2} Wins: ${h2h.team2Wins || 0}\n`;
  } else {
    msg += `Head-to-head data not available\n`;
  }
  msg += `\n`;

  // Key players
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `⭐ *KEY PLAYERS TO WATCH*\n\n`;
  const team1Players = fa.team1Players || [];
  const team2Players = fa.team2Players || [];
  const allStarPlayers = fa.starPlayers || [];

  if (team1Players.length > 0) {
    msg += `🔵 *${pred.team1}:*\n`;
    team1Players.forEach(p => {
      const formEmoji = p.form === 'Excellent' ? '🔥' : p.form === 'Good' ? '✅' : '⚠️';
      msg += `   ${formEmoji} ${p.name} (${p.role || 'Player'})\n`;
    });
    msg += `\n`;
  }
  if (team2Players.length > 0) {
    msg += `🔴 *${pred.team2}:*\n`;
    team2Players.forEach(p => {
      const formEmoji = p.form === 'Excellent' ? '🔥' : p.form === 'Good' ? '✅' : '⚠️';
      msg += `   ${formEmoji} ${p.name} (${p.role || 'Player'})\n`;
    });
    msg += `\n`;
  }
  if (allStarPlayers.length > 0 && team1Players.length === 0 && team2Players.length === 0) {
    allStarPlayers.forEach(p => { msg += `   ⭐ ${p}\n`; });
    msg += `\n`;
  }

  // Pitch & Weather
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `🏟 *VENUE & CONDITIONS*\n\n`;
  if (fa.pitchReport) {
    const pitchIcon = fa.pitchReport.battingFriendly ? '🏏 Batting-friendly' : '🎯 Bowling-friendly';
    msg += `🌱 *Pitch:* ${pitchIcon}\n`;
    msg += `   ${fa.pitchReport.type || fa.pitchReport}\n`;
  }
  if (fa.weather) {
    msg += `☁️ *Weather:* ${fa.weather.condition || fa.weather}`;
    if (fa.weather.rainChance !== undefined && fa.weather.rainChance !== null) {
      msg += ` (Rain: ${fa.weather.rainChance}%)`;
    }
    msg += `\n`;
  }
  if (fa.venueAdvantage) {
    msg += `🏠 *Venue Advantage:* ${fa.venueAdvantage}\n`;
  }
  msg += `\n`;

  // Team strengths
  if (fa.teamStrength) {
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `💪 *TEAM STRENGTHS*\n\n`;
    if (fa.teamStrength.batting) msg += `🏏 Batting: *${fa.teamStrength.batting}*\n`;
    if (fa.teamStrength.bowling) msg += `🎯 Bowling: *${fa.teamStrength.bowling}*\n`;
    if (fa.teamStrength.balance) msg += `⚖️ Balance: *${fa.teamStrength.balance}*\n`;
    msg += `\n`;
  }

  // Toss trend
  if (fa.tossTrend) {
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🎲 *TOSS TREND*\n`;
    msg += `${fa.tossTrend}\n\n`;
  }

  // Match flow predictions
  if (fa.matchFlowPredictions && fa.matchFlowPredictions.length > 0) {
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🔮 *MATCH FLOW PREDICTIONS*\n\n`;
    fa.matchFlowPredictions.forEach(f => { msg += `   • ${f}\n`; });
    msg += `\n`;
  }

  // Risk factors
  if (fa.riskFactors && fa.riskFactors.length > 0) {
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `⚠️ *RISK FACTORS*\n\n`;
    fa.riskFactors.forEach(r => { msg += `   • ${r}\n`; });
    msg += `\n`;
  }

  // Key insights
  if (fa.teamInsights && fa.teamInsights.length > 0) {
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `💡 *KEY INSIGHTS*\n\n`;
    fa.teamInsights.forEach(i => { msg += `   • ${i}\n`; });
    msg += `\n`;
  }

  msg += `═══════════════════════════════════\n`;
  msg += `💎 *WANT THE WINNER PREDICTION?*\n`;
  msg += `✅ Predicted Winner  ✅ Toss  ✅ Key Player\n`;
  msg += `💰 Unlock Premium for ₹${(process.env.PAYMENT_AMOUNT || DEFAULT_PAYMENT_AMOUNT) / 100}\n`;

  return msg;
};

/**
 * Builds the "no matches today" message including the next upcoming match if available.
 * @param {Object|null} nextPrediction - Next upcoming prediction or null
 * @returns {string} Formatted message
 */
const buildNoMatchesTodayMessage = (nextPrediction) => {
  const dateStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  let msg = `🏏 *IPL PREDICTION BOT* 🏏\n\n`;
  msg += `📅 ${dateStr}\n\n`;
  msg += `😴 *No IPL matches scheduled for today.*\n\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  if (nextPrediction) {
    const nextDate = new Date(nextPrediction.date);
    const nextDateStr = nextDate.toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const nextTime = nextDate.toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });

    const now = new Date();
    const diffMs = nextDate - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    msg += `📢 *NEXT MATCH COMING UP!*\n\n`;
    msg += `⚔️  *${nextPrediction.team1} vs ${nextPrediction.team2}*\n`;
    if (nextPrediction.venue) msg += `📍 Venue: ${nextPrediction.venue}\n`;
    msg += `📅 Date: ${nextDateStr}\n`;
    msg += `⏰ Time: ${nextTime} IST\n`;

    if (diffDays > 0) {
      msg += `⏳ Countdown: ${diffDays} day${diffDays !== 1 ? 's' : ''} and ${diffHrs} hour${diffHrs !== 1 ? 's' : ''}\n`;
    } else if (diffHrs > 0) {
      msg += `⏳ Countdown: ${diffHrs} hour${diffHrs !== 1 ? 's' : ''}\n`;
    }

    msg += `\n💡 Set a reminder and come back for full analysis!\n`;
  } else {
    msg += `📋 Check the official IPL schedule for upcoming matches:\n`;
    msg += `🔗 https://www.iplt20.com/matches/schedule\n\n`;
    msg += `💡 Come back on match day for full predictions!\n`;
  }

  msg += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📊 FREE analysis available on match days\n`;
  msg += `💎 Premium predictions for every match\n`;

  return msg;
};

module.exports = {
  getConfidenceEmoji,
  getConfidenceLabel,
  formatForm,
  buildTodayMatchesSummary,
  buildMatchDetailMessage,
  buildNoMatchesTodayMessage,
};
