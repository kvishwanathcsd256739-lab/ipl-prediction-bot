const Prediction = require('../models/Prediction');
const User = require('../models/User');
const Payment = require('../models/Payment');
const { generatePaymentQR, generateTransactionId, generateUPILink } = require('../utils/payment');
const { formatFreeAnalysis, formatPremiumPrediction, formatPaymentInstructions, formatAdminPaymentNotification } = require('../utils/messages');

/**
 * User controller for handling user interactions
 */
class UserController {
  constructor(bot) {
    this.bot = bot;
    this.adminId = parseInt(process.env.ADMIN_USER_ID);
  }

  /**
   * Get or create user
   */
  async getOrCreateUser(telegramUser) {
    let user = await User.findOne({ telegramId: telegramUser.id });

    if (!user) {
      user = new User({
        telegramId: telegramUser.id,
        username: telegramUser.username,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        stats: {
          totalPredictionsViewed: 0,
          totalPayments: 0,
          lastActive: new Date()
        }
      });
      await user.save();
    } else {
      user.stats.lastActive = new Date();
      await user.save();
    }

    return user;
  }

  /**
   * Send welcome message
   */
  async sendWelcome(chatId, user) {
    const message = `🏏 *Welcome to IPL Prediction Bot!*\n\n` +
                   `Hi ${user.firstName}! I'm your cricket expert assistant.\n\n` +
                   `*What I can do:*\n` +
                   `✅ Detailed match analysis (FREE)\n` +
                   `✅ Team form & player stats (FREE)\n` +
                   `✅ Pitch & weather reports (FREE)\n` +
                   `🔐 Expert predictions (₹49)\n` +
                   `🔐 Winner, toss & key players (₹49)\n\n` +
                   `*Commands:*\n` +
                   `/today - Get today's match prediction\n` +
                   `/help - Show all commands\n\n` +
                   `Let's get started! Use /today to see today's match.`;

    const keyboard = {
      inline_keyboard: [
        [{ text: '🏏 Today\'s Match', callback_data: 'today' }],
        [{ text: '📊 All Matches', callback_data: 'all_matches' }],
        [{ text: 'ℹ️ Help', callback_data: 'help' }]
      ]
    };

    await this.bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  }

  /**
   * Get today's prediction
   */
  async getTodayPrediction(chatId, userId) {
    try {
      const user = await User.findOne({ telegramId: userId });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const prediction = await Prediction.findOne({
        matchDate: { $gte: today, $lt: tomorrow },
        active: true
      });

      if (!prediction) {
        return this.bot.sendMessage(chatId, '📝 No match scheduled for today. Check back later!');
      }

      const freeMessage = formatFreeAnalysis(prediction);

      const keyboard = {
        inline_keyboard: [
          [{ text: '🔓 Unlock Premium (₹49)', callback_data: `pay_${prediction._id}` }],
          [{ text: '📅 View Other Matches', callback_data: 'all_matches' }]
        ]
      };

      await this.bot.sendMessage(chatId, freeMessage, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });

      if (user) {
        user.stats.totalPredictionsViewed += 1;
        await user.save();
      }

    } catch (error) {
      console.error('Error getting today prediction:', error);
      await this.bot.sendMessage(chatId, '❌ Error fetching prediction. Please try again.');
    }
  }

  /**
   * Initiate payment for premium prediction
   */
  async initiatePayment(chatId, userId, predictionId) {
    try {
      const user = await User.findOne({ telegramId: userId });
      const prediction = await Prediction.findById(predictionId);

      if (!prediction) {
        return this.bot.sendMessage(chatId, '❌ Prediction not found.');
      }

      if (user && user.hasPremiumAccess(predictionId)) {
        return this.showPremiumPrediction(chatId, userId, predictionId);
      }

      const transactionId = generateTransactionId();
      const amount = parseInt(process.env.PAYMENT_AMOUNT) || 49;

      const qrBuffer = await generatePaymentQR(
        amount,
        transactionId,
        process.env.UPI_ID,
        process.env.UPI_NAME
      );

      const payment = new Payment({
        userId,
        predictionId,
        amount,
        type: 'single',
        transactionId,
        status: 'pending'
      });
      await payment.save();

      const message = formatPaymentInstructions(transactionId, amount);
      const upiLink = generateUPILink(amount, transactionId, process.env.UPI_ID, process.env.UPI_NAME);

      const keyboard = {
        inline_keyboard: [
          [{ text: '💳 Pay Now', url: upiLink }],
          [{ text: '✅ I Have Paid', callback_data: `paid_${payment._id}` }],
          [{ text: '❌ Cancel', callback_data: 'cancel_payment' }]
        ]
      };

      await this.bot.sendPhoto(chatId, qrBuffer, {
        caption: message,
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });

    } catch (error) {
      console.error('Error initiating payment:', error);
      await this.bot.sendMessage(chatId, '❌ Error processing payment. Please try again.');
    }
  }

  /**
   * Handle payment confirmation
   */
  async handlePaymentConfirmation(chatId, userId, paymentId) {
    try {
      const payment = await Payment.findById(paymentId);

      if (!payment) {
        return this.bot.sendMessage(chatId, '❌ Payment not found.');
      }

      if (payment.status === 'verified') {
        return this.bot.sendMessage(chatId, '✅ Payment already verified!');
      }

      await this.bot.sendMessage(chatId,
        `✅ *Payment Submitted!*\n\n` +
        `Your payment is being verified by our admin.\n` +
        `You'll receive the premium prediction within a few minutes.\n\n` +
        `Transaction ID: \`${payment.transactionId}\``,
        { parse_mode: 'Markdown' }
      );

      await this.notifyAdminForVerification(payment);

    } catch (error) {
      console.error('Error handling payment confirmation:', error);
      await this.bot.sendMessage(chatId, '❌ Error processing confirmation. Please contact support.');
    }
  }

  /**
   * Notify admin for payment verification
   */
  async notifyAdminForVerification(payment) {
    try {
      const user = await User.findOne({ telegramId: payment.userId });
      const prediction = await Prediction.findById(payment.predictionId);

      const message = formatAdminPaymentNotification(user, payment, prediction);

      const keyboard = {
        inline_keyboard: [
          [
            { text: '✅ Verify', callback_data: `verify_${payment._id}` },
            { text: '❌ Reject', callback_data: `reject_${payment._id}` }
          ]
        ]
      };

      await this.bot.sendMessage(this.adminId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error notifying admin:', error);
    }
  }

  /**
   * Verify payment (admin only)
   */
  async verifyPayment(chatId, userId, paymentId) {
    if (userId !== this.adminId) {
      return this.bot.sendMessage(chatId, '❌ Unauthorized.');
    }

    try {
      const payment = await Payment.findById(paymentId);

      if (!payment) {
        return this.bot.sendMessage(chatId, '❌ Payment not found.');
      }

      payment.status = 'verified';
      await payment.save();

      const user = await User.findOne({ telegramId: payment.userId });
      user.payments.push({
        predictionId: payment.predictionId,
        amount: payment.amount,
        paymentDate: new Date(),
        transactionId: payment.transactionId,
        verified: true
      });
      user.stats.totalPayments += 1;
      await user.save();

      const prediction = await Prediction.findById(payment.predictionId);
      const premiumMessage = formatPremiumPrediction(prediction);

      await this.bot.sendMessage(payment.userId,
        `🎉 *Payment Verified!*\n\n` +
        `Your payment has been verified. Here's your premium prediction:\n\n` +
        premiumMessage,
        { parse_mode: 'Markdown' }
      );

      await this.bot.sendMessage(chatId,
        `✅ Payment verified for user ${user.firstName} (${user.telegramId})`,
        { parse_mode: 'Markdown' }
      );

    } catch (error) {
      console.error('Error verifying payment:', error);
      await this.bot.sendMessage(chatId, '❌ Error verifying payment.');
    }
  }

  /**
   * Show premium prediction
   */
  async showPremiumPrediction(chatId, userId, predictionId) {
    try {
      const user = await User.findOne({ telegramId: userId });
      const prediction = await Prediction.findById(predictionId);

      if (!prediction) {
        return this.bot.sendMessage(chatId, '❌ Prediction not found.');
      }

      if (!user || !user.hasPremiumAccess(predictionId)) {
        return this.bot.sendMessage(chatId, '❌ You need to purchase this prediction first.');
      }

      const message = formatPremiumPrediction(prediction);
      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

    } catch (error) {
      console.error('Error showing premium prediction:', error);
      await this.bot.sendMessage(chatId, '❌ Error fetching prediction.');
    }
  }

  /**
   * Show all available matches
   */
  async showAllMatches(chatId) {
    try {
      const predictions = await Prediction.find({ active: true })
        .sort({ matchDate: 1 })
        .limit(10);

      if (predictions.length === 0) {
        return this.bot.sendMessage(chatId, '📝 No upcoming matches available.');
      }

      let message = `🏏 *Upcoming Matches*\n\n`;

      const buttons = [];
      predictions.forEach((pred, index) => {
        message += `${index + 1}. ${pred.team1} vs ${pred.team2}\n`;
        message += `   📅 ${pred.matchDate.toLocaleDateString('en-IN')}\n\n`;

        buttons.push([{
          text: `${pred.team1} vs ${pred.team2}`,
          callback_data: `view_${pred._id}`
        }]);
      });

      const keyboard = { inline_keyboard: buttons };

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });

    } catch (error) {
      console.error('Error showing matches:', error);
      await this.bot.sendMessage(chatId, '❌ Error fetching matches.');
    }
  }

  /**
   * Show help message
   */
  async showHelp(chatId) {
    const message = `ℹ️ *Help & Commands*\n\n` +
                   `*User Commands:*\n` +
                   `/start - Start the bot\n` +
                   `/today - Get today's match prediction\n` +
                   `/matches - View all upcoming matches\n` +
                   `/help - Show this help message\n\n` +
                   `*How it works:*\n` +
                   `1️⃣ Get free detailed analysis\n` +
                   `2️⃣ Pay ₹49 for premium prediction\n` +
                   `3️⃣ Get winner, toss & key player picks\n\n` +
                   `*Payment:*\n` +
                   `• Scan QR code with any UPI app\n` +
                   `• Or use the payment link\n` +
                   `• Admin verifies within minutes\n\n` +
                   `Need help? Contact admin!`;

    await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  }
}

module.exports = UserController;
