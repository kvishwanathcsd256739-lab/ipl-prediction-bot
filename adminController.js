const Prediction = require('../models/Prediction');
const User = require('../models/User');

/**
 * Admin controller for managing predictions
 */
class AdminController {
  constructor(bot) {
    this.bot = bot;
    this.adminId = parseInt(process.env.ADMIN_USER_ID);
    this.tempPredictionData = {}; // Store temporary prediction data during creation
  }

  /**
   * Check if user is admin
   */
  isAdmin(userId) {
    return userId === this.adminId;
  }

  /**
   * Start adding new prediction
   */
  async startAddPrediction(chatId, userId) {
    if (!this.isAdmin(userId)) {
      return this.bot.sendMessage(chatId, '❌ You are not authorized to use admin commands.');
    }

    this.tempPredictionData[userId] = {
      step: 'teams',
      data: {}
    };

    const message = `📝 *Add New Prediction - Step 1/3*\n\n` +
                   `Please enter match details in this format:\n` +
                   `\`TEAM1 vs TEAM2, DD-MM-YYYY\`\n\n` +
                   `Example:\n` +
                   `\`CSK vs RCB, 15-04-2026\``;

    await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  }

  /**
   * Handle prediction creation steps
   */
  async handlePredictionStep(chatId, userId, text) {
    if (!this.tempPredictionData[userId]) return;

    const session = this.tempPredictionData[userId];

    try {
      switch (session.step) {
        case 'teams':
          await this.handleTeamsStep(chatId, userId, text);
          break;
        case 'premium':
          await this.handlePremiumStep(chatId, userId, text);
          break;
        case 'analysis':
          await this.handleAnalysisStep(chatId, userId, text);
          break;
      }
    } catch (error) {
      await this.bot.sendMessage(chatId, `❌ Error: ${error.message}`);
      delete this.tempPredictionData[userId];
    }
  }

  /**
   * Handle teams and date input
   */
  async handleTeamsStep(chatId, userId, text) {
    const parts = text.split(',').map(p => p.trim());
    if (parts.length !== 2) {
      return this.bot.sendMessage(chatId, '❌ Invalid format. Use: TEAM1 vs TEAM2, DD-MM-YYYY');
    }

    const teams = parts[0].split('vs').map(t => t.trim());
    if (teams.length !== 2) {
      return this.bot.sendMessage(chatId, '❌ Invalid team format. Use: TEAM1 vs TEAM2');
    }

    const dateParts = parts[1].split('-');
    if (dateParts.length !== 3) {
      return this.bot.sendMessage(chatId, '❌ Invalid date format. Use: DD-MM-YYYY');
    }

    const matchDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
    
    this.tempPredictionData[userId].data.team1 = teams[0];
    this.tempPredictionData[userId].data.team2 = teams[1];
    this.tempPredictionData[userId].data.matchDate = matchDate;
    this.tempPredictionData[userId].step = 'premium';

    const message = `✅ Teams saved: ${teams[0]} vs ${teams[1]}\n` +
                   `📅 Date: ${matchDate.toLocaleDateString('en-IN')}\n\n` +
                   `📝 *Step 2/3 - Premium Prediction*\n\n` +
                   `Enter your prediction in this format:\n` +
                   `\`Winner: TEAM_NAME\`\n` +
                   `\`Toss: TEAM_NAME\`\n` +
                   `\`Key Player: PLAYER_NAME\`\n` +
                   `\`Confidence: 80\`\n` +
                   `\`Notes: Any additional notes (optional)\`\n\n` +
                   `Example:\n` +
                   `\`\`\`\nWinner: CSK\nToss: RCB\nKey Player: MS Dhoni\nConfidence: 85\nNotes: CSK has strong spin attack\`\`\``;

    await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  }

  /**
   * Handle premium prediction input
   */
  async handlePremiumStep(chatId, userId, text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    const premium = {};

    for (const line of lines) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      
      const keyLower = key.trim().toLowerCase();
      if (keyLower === 'winner') premium.winner = value;
      else if (keyLower === 'toss') premium.tossWinner = value;
      else if (keyLower.includes('player')) premium.keyPlayer = value;
      else if (keyLower === 'confidence') premium.confidence = parseInt(value);
      else if (keyLower === 'notes') premium.additionalNotes = value;
    }

    if (!premium.winner || !premium.tossWinner || !premium.keyPlayer) {
      return this.bot.sendMessage(chatId, '❌ Missing required fields. Please include Winner, Toss, and Key Player.');
    }

    this.tempPredictionData[userId].data.premium = premium;
    this.tempPredictionData[userId].step = 'analysis';

    const message = `✅ Premium prediction saved!\n\n` +
                   `📝 *Step 3/3 - Free Analysis (Optional)*\n\n` +
                   `You can now add free analysis data or type /skip to save the prediction.\n\n` +
                   `To add analysis, use /addanalysis command and I'll guide you through it.\n` +
                   `Or type /save to save the prediction now.`;

    await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  }

  /**
   * Save prediction to database
   */
  async savePrediction(chatId, userId) {
    if (!this.tempPredictionData[userId]) {
      return this.bot.sendMessage(chatId, '❌ No prediction data found. Use /addprediction to start.');
    }

    try {
      const data = this.tempPredictionData[userId].data;
      
      // Set default free analysis if not provided
      if (!data.freeAnalysis) {
        data.freeAnalysis = this.getDefaultAnalysis(data.team1, data.team2);
      }

      const prediction = new Prediction({
        ...data,
        createdBy: userId,
        active: true
      });

      await prediction.save();

      delete this.tempPredictionData[userId];

      const message = `✅ *Prediction saved successfully!*\n\n` +
                     `📊 Match: ${data.team1} vs ${data.team2}\n` +
                     `📅 Date: ${data.matchDate.toLocaleDateString('en-IN')}\n` +
                     `🏆 Winner: ${data.premium.winner}\n` +
                     `📈 Confidence: ${data.premium.confidence}%\n\n` +
                     `Users can now access this prediction!`;

      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      await this.bot.sendMessage(chatId, `❌ Error saving prediction: ${error.message}`);
    }
  }

  /**
   * Get default analysis template
   */
  getDefaultAnalysis(team1, team2) {
    return {
      team1Form: ['W', 'L', 'W', 'W', 'L'],
      team2Form: ['L', 'W', 'L', 'W', 'W'],
      team1Players: [],
      team2Players: [],
      pitchReport: {
        type: 'Batting friendly pitch',
        battingFriendly: true,
        spinnerFriendly: false
      },
      weather: {
        condition: 'Clear weather',
        rainChance: 0
      },
      headToHead: {
        totalMatches: 30,
        team1Wins: 15,
        team2Wins: 15
      },
      venueAdvantage: 'Neutral venue',
      tossTrend: 'Teams prefer chasing - 50-50 chance',
      teamStrength: {
        batting: team1,
        bowling: team2,
        balance: team1
      },
      starPlayers: [],
      playerPredictions: [],
      milestones: [],
      matchFlowPredictions: [
        'Powerplay score: 50-60 runs',
        'Total score: 170-190',
        'High scoring match likely'
      ],
      riskFactors: [],
      teamInsights: [],
      bonusInsights: []
    };
  }

  /**
   * List all predictions
   */
  async listPredictions(chatId, userId) {
    if (!this.isAdmin(userId)) {
      return this.bot.sendMessage(chatId, '❌ You are not authorized to use admin commands.');
    }

    try {
      const predictions = await Prediction.find({ active: true })
        .sort({ matchDate: -1 })
        .limit(10);

      if (predictions.length === 0) {
        return this.bot.sendMessage(chatId, '📝 No predictions found.');
      }

      let message = `📋 *Active Predictions*\n\n`;
      
      predictions.forEach((pred, index) => {
        message += `${index + 1}. ${pred.team1} vs ${pred.team2}\n`;
        message += `   📅 ${pred.matchDate.toLocaleDateString('en-IN')}\n`;
        message += `   🏆 Winner: ${pred.premium.winner}\n`;
        message += `   ID: \`${pred._id}\`\n\n`;
      });

      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      await this.bot.sendMessage(chatId, `❌ Error: ${error.message}`);
    }
  }

  /**
   * Get admin stats
   */
  async getStats(chatId, userId) {
    if (!this.isAdmin(userId)) {
      return this.bot.sendMessage(chatId, '❌ You are not authorized to use admin commands.');
    }

    try {
      const totalPredictions = await Prediction.countDocuments();
      const activePredictions = await Prediction.countDocuments({ active: true });
      const totalUsers = await User.countDocuments();
      const paidUsers = await User.countDocuments({ 'payments.0': { $exists: true } });

      const message = `📊 *Bot Statistics*\n\n` +
                     `📝 Total Predictions: ${totalPredictions}\n` +
                     `✅ Active Predictions: ${activePredictions}\n` +
                     `👥 Total Users: ${totalUsers}\n` +
                     `💰 Paid Users: ${paidUsers}\n`;

      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      await this.bot.sendMessage(chatId, `❌ Error: ${error.message}`);
    }
  }
}

module.exports = AdminController;
