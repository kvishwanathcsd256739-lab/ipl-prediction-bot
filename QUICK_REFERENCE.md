# 🏏 IPL Prediction Bot - Quick Reference Card

## 🚀 Installation (One-Time Setup)

```bash
cd ipl-prediction-bot
./install.sh              # Auto-install
npm run setup             # Configure bot
npm start                 # Start bot
```

## 📱 Get Started

### 1. Create Telegram Bot
- Search: `@BotFather`
- Send: `/newbot`
- Copy bot token

### 2. Get Your User ID
- Search: `@userinfobot`
- Copy your user ID

### 3. Configure
```bash
npm run setup
# Enter bot token, user ID, UPI details
```

### 4. Start
```bash
npm start
```

## 💻 Commands

### User Commands
```
/start    - Welcome
/today    - Today's match
/matches  - All matches
/help     - Help guide
```

### Admin Commands
```
/addprediction  - Add prediction
/predictions    - List all
/stats          - Statistics
/save           - Save prediction
```

## 📝 Adding Prediction (Admin)

```
1. /addprediction
2. Enter: CSK vs RCB, 15-04-2026
3. Enter:
   Winner: CSK
   Toss: RCB
   Key Player: MS Dhoni
   Confidence: 85
   Notes: Optional notes
4. /save
```

## 💰 Payment Flow

```
User → /today
User → Click "Unlock Premium"
User → Scan QR code
User → Pay ₹49
User → Click "I Have Paid"
Admin → Verify payment
User → Gets premium prediction
```

## 🛠️ Useful Commands

```bash
# Setup & Config
npm run setup          # Interactive setup
npm run check-setup    # Verify config

# Database
npm run init-db        # Sample data

# Running
npm start              # Production
npm run dev            # Development

# Production (PM2)
pm2 start src/bot.js --name ipl-bot
pm2 logs ipl-bot
pm2 restart ipl-bot
```

## 📊 Files Structure

```
START_HERE.md       - Start here!
QUICKSTART.md       - 5-min guide
README.md           - Full docs
EXAMPLES.md         - Customize
DEPLOYMENT.md       - Deploy
.env                - Config
src/bot.js          - Main file
```

## 🔧 Configuration (.env)

```env
TELEGRAM_BOT_TOKEN=your_token
ADMIN_USER_ID=your_id
MONGODB_URI=mongodb://...
UPI_ID=name@bank
UPI_NAME=Your Name
PAYMENT_AMOUNT=49
```

## ⚡ Quick Troubleshooting

**Bot not responding?**
```bash
pm2 logs ipl-bot    # Check logs
npm run check-setup # Verify config
```

**Database error?**
```bash
mongod              # Start MongoDB
# Or use MongoDB Atlas
```

**Payment issue?**
- Check UPI ID format
- Verify admin user ID

## 📈 Pricing

- Single: ₹49/match
- Weekly: ₹299/7 days
- Change in .env file

## 🎯 First Steps

1. ✅ Install: `./install.sh`
2. ✅ Setup: `npm run setup`
3. ✅ Test: `npm run init-db`
4. ✅ Start: `npm start`
5. ✅ Open Telegram → Search bot
6. ✅ Send `/start`

## 📚 Documentation

- **New?** → QUICKSTART.md
- **Details?** → README.md
- **Customize?** → EXAMPLES.md
- **Deploy?** → DEPLOYMENT.md

---

**Print this card and keep it handy!** 📎
