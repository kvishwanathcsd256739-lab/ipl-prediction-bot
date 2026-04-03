# 🏏 IPL Prediction Bot

A Telegram bot for IPL cricket match predictions with free analysis and premium predictions. Built with Node.js, MongoDB, and the Telegram Bot API.

## 📋 Features

### Free Features (Available to All Users)
- ✅ Detailed match analysis
- ✅ Team form (last 5 matches)
- ✅ Key players form and stats
- ✅ Pitch report and conditions
- ✅ Weather forecast
- ✅ Head-to-head statistics
- ✅ Venue advantage analysis
- ✅ Toss trends
- ✅ Team strength comparison
- ✅ Star players to watch
- ✅ Player performance predictions
- ✅ Match flow predictions
- ✅ Risk factors
- ✅ Team insights
- ✅ Bonus insights

### Premium Features (₹49 per match)
- 🔐 Expert winner prediction
- 🔐 Toss winner prediction
- 🔐 Key player to watch
- 🔐 Confidence percentage
- 🔐 Additional expert notes

### Admin Features
- 📝 Add daily predictions
- 📊 View bot statistics
- ✅ Verify user payments
- 📋 Manage all predictions

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- Telegram Bot Token (from @BotFather)
- UPI ID for payments

### Step 1: Clone and Install

```bash
cd ipl-prediction-bot
npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
ADMIN_USER_ID=your_telegram_user_id

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ipl_prediction_bot

# Payment Configuration
UPI_ID=yourname@paytm
UPI_NAME=Your Name
PAYMENT_AMOUNT=49
```

### Step 3: Get Your Telegram User ID

1. Start a chat with @userinfobot on Telegram
2. It will send you your user ID
3. Add this ID to `ADMIN_USER_ID` in `.env`

### Step 4: Create Telegram Bot

1. Open Telegram and search for @BotFather
2. Send `/newbot` command
3. Follow instructions to create your bot
4. Copy the bot token
5. Add token to `TELEGRAM_BOT_TOKEN` in `.env`

### Step 5: Start MongoDB

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env with your Atlas connection string
```

### Step 6: Initialize Database (Optional)

```bash
npm run init-db
```

This creates a sample prediction for testing.

### Step 7: Start the Bot

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

You should see:
```
✅ MongoDB connected successfully
🤖 IPL Prediction Bot is running...
📱 Waiting for messages...
```

## 📱 Usage

### For Users

1. **Start the bot**: `/start`
2. **View today's match**: `/today`
3. **View all matches**: `/matches`
4. **Get help**: `/help`

### Payment Flow

1. User views free analysis
2. Click "Unlock Premium" button
3. QR code is generated
4. User scans QR with UPI app and pays
5. User clicks "I Have Paid"
6. Admin receives notification
7. Admin verifies payment
8. User receives premium prediction

### For Admin

1. **Add new prediction**: `/addprediction`
   - Enter match details: `CSK vs RCB, 15-04-2026`
   - Enter premium prediction with winner, toss, key player, confidence
   - Optionally add detailed analysis or use `/skip`
   - Save with `/save`

2. **View all predictions**: `/predictions`

3. **View bot statistics**: `/stats`

4. **Verify payments**: 
   - Receive notification when user pays
   - Click "Verify" or "Reject" button

## 📊 Bot Commands

### User Commands
```
/start - Start the bot and see welcome message
/today - Get today's match prediction
/matches - View all upcoming matches
/help - Show help and instructions
```

### Admin Commands
```
/addprediction - Add new match prediction
/predictions - List all predictions
/stats - View bot statistics
/save - Save current prediction
/skip - Skip analysis and save prediction
```

## 🏗️ Project Structure

```
ipl-prediction-bot/
├── config/
│   └── database.js          # MongoDB configuration
├── models/
│   ├── Prediction.js        # Prediction schema
│   ├── User.js              # User schema
│   └── Payment.js           # Payment schema
├── controllers/
│   ├── adminController.js   # Admin commands handler
│   └── userController.js    # User commands handler
├── utils/
│   ├── payment.js           # Payment & QR code utilities
│   └── messages.js          # Message formatting
├── src/
│   ├── bot.js               # Main bot file
│   └── scripts/
│       └── initDb.js        # Database initialization
├── package.json
├── .env.example
└── README.md
```

## 💾 Database Models

### Prediction
- Match details (teams, date)
- Premium prediction (winner, toss, key player, confidence)
- Free analysis (all statistics and insights)

### User
- Telegram user information
- Payment history
- Weekly subscription status
- Usage statistics

### Payment
- Payment details
- Verification status
- Transaction ID
- Expiry time

## 🔐 Security Notes

1. **Keep your `.env` file secure** - Never commit it to Git
2. **Store bot token safely** - It's like a password
3. **Verify payments manually** - Check UPI transactions before verification
4. **Use strong MongoDB password** - If using cloud database
5. **Regular backups** - Backup your MongoDB database regularly

## 🛠️ Customization

### Change Payment Amount

Edit `.env`:
```env
PAYMENT_AMOUNT=99  # Change to your price
```

### Modify Free Analysis Format

Edit `utils/messages.js` → `formatFreeAnalysis()` function

### Add More Features

1. Weekly subscriptions (already structured in User model)
2. Automated payment verification (integrate payment gateway API)
3. Multiple admin support
4. Analytics dashboard
5. Match result tracking

## 📞 Troubleshooting

### Bot not responding
- Check if bot is running: `ps aux | grep node`
- Check MongoDB connection
- Verify bot token in `.env`
- Check internet connection

### Payment issues
- Verify UPI ID is correct
- Check QR code generation
- Ensure admin ID is correct
- Check payment notification delivery

### Database errors
- Ensure MongoDB is running
- Check connection string
- Verify database permissions

## 🔄 Updates & Maintenance

### Daily Tasks
1. Add new predictions using `/addprediction`
2. Verify payments as they come
3. Monitor user engagement

### Weekly Tasks
1. Review bot statistics
2. Backup database
3. Check for any errors in logs

### Monthly Tasks
1. Update team statistics
2. Review pricing strategy
3. Add new features based on user feedback

## 📈 Scaling

### For High Traffic
1. Use MongoDB Atlas (cloud)
2. Deploy to cloud platform (Heroku, AWS, DigitalOcean)
3. Use PM2 for process management
4. Add Redis for caching
5. Implement rate limiting

### Deployment

```bash
# Install PM2
npm install -g pm2

# Start bot with PM2
pm2 start src/bot.js --name ipl-bot

# Monitor
pm2 status
pm2 logs ipl-bot

# Auto-restart on system reboot
pm2 startup
pm2 save
```

## 📄 License

MIT License - Feel free to use and modify

## 🤝 Support

For issues or questions:
1. Check troubleshooting section
2. Review bot logs
3. Contact admin via Telegram

## 🎯 Roadmap

- [ ] Automated payment verification via Razorpay
- [ ] Weekly subscription system
- [ ] Match result tracking
- [ ] User leaderboard
- [ ] Multiple language support
- [ ] Push notifications for match updates
- [ ] Web dashboard for analytics

---

**Made with ❤️ for IPL fans**

Happy predicting! 🏏
