/**
 * Format free analysis message
 */
function formatFreeAnalysis(prediction) {
  const { team1, team2, freeAnalysis } = prediction;
  
  let message = `🏏 *FREE MATCH ANALYSIS*\n\n`;
  message += `📊 *Match:* ${team1} vs ${team2}\n`;
  message += `📅 *Date:* ${prediction.matchDate.toLocaleDateString('en-IN')}\n\n`;
  
  // Team Form
  if (freeAnalysis.team1Form && freeAnalysis.team2Form) {
    message += `📈 *TEAM FORM (Last 5 Matches)*\n`;
    message += `${team1}: ${freeAnalysis.team1Form.join(' | ')}\n`;
    message += `${team2}: ${freeAnalysis.team2Form.join(' | ')}\n\n`;
  }
  
  // Key Players
  if (freeAnalysis.team1Players && freeAnalysis.team1Players.length > 0) {
    message += `⭐ *KEY PLAYERS FORM*\n`;
    message += `*${team1}:*\n`;
    freeAnalysis.team1Players.forEach(player => {
      message += `• ${player.name} - ${player.form}\n`;
    });
    message += `\n*${team2}:*\n`;
    freeAnalysis.team2Players.forEach(player => {
      message += `• ${player.name} - ${player.form}\n`;
    });
    message += `\n`;
  }
  
  // Pitch Report
  if (freeAnalysis.pitchReport) {
    message += `🏟️ *PITCH REPORT*\n`;
    message += `${freeAnalysis.pitchReport.type}\n`;
    if (freeAnalysis.pitchReport.battingFriendly) {
      message += `• Good for batting\n`;
    }
    if (freeAnalysis.pitchReport.spinnerFriendly) {
      message += `• Spinners may help later\n`;
    }
    message += `\n`;
  }
  
  // Weather
  if (freeAnalysis.weather) {
    message += `🌤️ *WEATHER REPORT*\n`;
    message += `${freeAnalysis.weather.condition}\n`;
    if (freeAnalysis.weather.rainChance > 0) {
      message += `⚠️ Rain chance: ${freeAnalysis.weather.rainChance}%\n`;
    }
    message += `\n`;
  }
  
  // Head to Head
  if (freeAnalysis.headToHead) {
    const h2h = freeAnalysis.headToHead;
    message += `🔄 *HEAD-TO-HEAD*\n`;
    message += `Total matches: ${h2h.totalMatches}\n`;
    message += `${team1} wins: ${h2h.team1Wins}\n`;
    message += `${team2} wins: ${h2h.team2Wins}\n\n`;
  }
  
  // Venue Advantage
  if (freeAnalysis.venueAdvantage) {
    message += `🏟️ *VENUE ADVANTAGE*\n`;
    message += `${freeAnalysis.venueAdvantage}\n\n`;
  }
  
  // Toss Trend
  if (freeAnalysis.tossTrend) {
    message += `🪙 *TOSS TREND*\n`;
    message += `${freeAnalysis.tossTrend}\n\n`;
  }
  
  // Team Strength
  if (freeAnalysis.teamStrength) {
    message += `💪 *TEAM STRENGTH*\n`;
    message += `Batting: ${freeAnalysis.teamStrength.batting}\n`;
    message += `Bowling: ${freeAnalysis.teamStrength.bowling}\n`;
    message += `Balance: ${freeAnalysis.teamStrength.balance}\n\n`;
  }
  
  // Star Players
  if (freeAnalysis.starPlayers && freeAnalysis.starPlayers.length > 0) {
    message += `🌟 *STAR PLAYERS TO WATCH*\n`;
    freeAnalysis.starPlayers.forEach((player, index) => {
      message += `${index + 1}. ${player}\n`;
    });
    message += `\n`;
  }
  
  // Player Predictions
  if (freeAnalysis.playerPredictions && freeAnalysis.playerPredictions.length > 0) {
    message += `🎯 *PLAYER PERFORMANCE PREDICTIONS*\n`;
    freeAnalysis.playerPredictions.forEach(pred => {
      message += `• ${pred}\n`;
    });
    message += `\n`;
  }
  
  // Milestones
  if (freeAnalysis.milestones && freeAnalysis.milestones.length > 0) {
    message += `🏆 *RECORDS / MILESTONES*\n`;
    freeAnalysis.milestones.forEach(milestone => {
      message += `• ${milestone}\n`;
    });
    message += `\n`;
  }
  
  // Match Flow Predictions
  if (freeAnalysis.matchFlowPredictions && freeAnalysis.matchFlowPredictions.length > 0) {
    message += `📊 *MATCH FLOW PREDICTIONS*\n`;
    freeAnalysis.matchFlowPredictions.forEach(flow => {
      message += `• ${flow}\n`;
    });
    message += `\n`;
  }
  
  // Risk Factors
  if (freeAnalysis.riskFactors && freeAnalysis.riskFactors.length > 0) {
    message += `⚠️ *RISK FACTORS*\n`;
    freeAnalysis.riskFactors.forEach(risk => {
      message += `• ${risk}\n`;
    });
    message += `\n`;
  }
  
  // Team Insights
  if (freeAnalysis.teamInsights && freeAnalysis.teamInsights.length > 0) {
    message += `💡 *TEAM INSIGHTS*\n`;
    freeAnalysis.teamInsights.forEach(insight => {
      message += `• ${insight}\n`;
    });
    message += `\n`;
  }
  
  // Bonus Insights
  if (freeAnalysis.bonusInsights && freeAnalysis.bonusInsights.length > 0) {
    message += `🎁 *BONUS INSIGHTS*\n`;
    freeAnalysis.bonusInsights.forEach(insight => {
      message += `• ${insight}\n`;
    });
    message += `\n`;
  }
  
  message += `━━━━━━━━━━━━━━━━━━━\n`;
  message += `🔐 *Want FINAL WINNER, TOSS & 100% CONFIDENT CALL?*\n\n`;
  message += `💰 Pay ₹${process.env.PAYMENT_AMOUNT || 49} to unlock Premium Prediction\n`;
  message += `👇 Click the button below to pay`;
  
  return message;
}

/**
 * Format premium prediction message
 */
function formatPremiumPrediction(prediction) {
  const { team1, team2, premium } = prediction;
  
  let message = `🏆 *PREMIUM PREDICTION*\n\n`;
  message += `📊 *Match:* ${team1} vs ${team2}\n\n`;
  
  message += `━━━━━━━━━━━━━━━━━━━\n`;
  message += `🎯 *WINNER:* ${premium.winner}\n`;
  message += `🪙 *TOSS WINNER:* ${premium.tossWinner}\n`;
  message += `⭐ *KEY PLAYER:* ${premium.keyPlayer}\n`;
  message += `📈 *CONFIDENCE:* ${premium.confidence}%\n`;
  
  if (premium.additionalNotes) {
    message += `\n💬 *Additional Notes:*\n${premium.additionalNotes}\n`;
  }
  
  message += `━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `✅ *Premium prediction unlocked!*\n`;
  message += `Good luck with your bets! 🍀`;
  
  return message;
}

/**
 * Format payment instructions
 */
function formatPaymentInstructions(transactionId, amount) {
  let message = `💳 *PAYMENT INSTRUCTIONS*\n\n`;
  message += `💰 Amount: ₹${amount}\n`;
  message += `🔑 Transaction ID: \`${transactionId}\`\n\n`;
  
  message += `*Steps to Pay:*\n`;
  message += `1️⃣ Scan the QR code with any UPI app\n`;
  message += `2️⃣ Or click "Pay Now" button\n`;
  message += `3️⃣ Complete the payment\n`;
  message += `4️⃣ Click "I Have Paid" button\n\n`;
  
  message += `⏰ This payment link expires in 30 minutes\n\n`;
  message += `⚠️ *Important:* After payment, click "I Have Paid" button and our admin will verify your payment shortly.`;
  
  return message;
}

/**
 * Format admin notification for payment verification
 */
function formatAdminPaymentNotification(user, payment, prediction) {
  let message = `🔔 *NEW PAYMENT TO VERIFY*\n\n`;
  message += `👤 *User:* ${user.firstName || 'Unknown'} (@${user.username || 'no username'})\n`;
  message += `🆔 *User ID:* \`${user.telegramId}\`\n`;
  message += `💰 *Amount:* ₹${payment.amount}\n`;
  message += `🔑 *Transaction ID:* \`${payment.transactionId}\`\n`;
  message += `📊 *Match:* ${prediction.team1} vs ${prediction.team2}\n`;
  message += `⏰ *Time:* ${new Date().toLocaleString('en-IN')}\n\n`;
  message += `Please verify the payment and click the buttons below.`;
  
  return message;
}

module.exports = {
  formatFreeAnalysis,
  formatPremiumPrediction,
  formatPaymentInstructions,
  formatAdminPaymentNotification
};
