# 🏏 IPL Prediction Bot

<div align="center">

![IPL Prediction Bot](https://img.shields.io/badge/IPL-Prediction%20Bot-blue?style=for-the-badge&logo=cricket&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green?style=for-the-badge&logo=mongodb&logoColor=white)
![Telegram](https://img.shields.io/badge/Telegram-Bot-blue?style=for-the-badge&logo=telegram&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-yellow?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge)

**A professional Telegram bot that delivers expert IPL cricket match predictions with a freemium monetisation model powered by Razorpay.**

[Quick Start](#-quick-start) • [Features](#-features) • [Installation](#-installation-guide) • [Usage](#-usage-examples) • [API Docs](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 📖 Project Overview

The **IPL Prediction Bot** is a full-stack Telegram bot application built with Node.js, MongoDB, and the Telegraf framework. It acts as a "cricket expert teacher" — delivering rich, data-driven IPL match analysis for free while offering expert premium predictions (winner, toss, key player, confidence score) behind a ₹49/match paywall powered by Razorpay UPI payments. The bot uses a freemium monetization model that is easy to configure and deploy.

The bot provides:

- 📊 **Detailed free analysis** for every upcoming IPL match (team form, pitch, weather, head-to-head, venue advantage, toss trends, player form, and more)
- 🔐 **Premium predictions** (expert winner pick, toss call, man-of-the-match candidate, confidence %) unlocked after a one-time payment
- 💰 **Flexible pricing** — single match (₹49) or weekly subscription (₹299 / 7 days)
- 🛠 **Admin dashboard** inside Telegram for adding/managing predictions and verifying payments
- 🚀 **Production-ready** with PM2 process management and support for VPS, Heroku, and Railway deployments

---

## ✨ Features

### 👤 User Features

#### Free (Available to Everyone)
| Feature | Description |
|---|---|
| 📋 Team Form | Last 5 match results for both teams |
| 🌟 Key Players | Star players and their current form |
| 🏟️ Pitch Report | Surface type, expected behaviour |
| ☀️ Weather Forecast | Conditions on match day |
| 📊 Head-to-Head | Historical win/loss records |
| 🏠 Venue Advantage | Which team dominates the ground |
| 🪙 Toss Trends | Toss impact and chasing/defending patterns |
| ⚖️ Team Strength Comparison | Batting, bowling, and balance index |
| 🎯 Powerplay Prediction | Expected powerplay score range |
| 📈 Total Score Prediction | Expected match total |
| ⚠️ Risk Factors | Key uncertainties for each team |
| 💡 Bonus Insights | Dew factor, captain decisions, tactical notes |

#### Premium (₹49/match · ₹299/week)
| Feature | Description |
|---|---|
| 🏆 Winner Prediction | Expert pick with reasoning |
| 🪙 Toss Prediction | Expected toss winner |
| ⭐ Key Player Pick | Man-of-the-match candidate |
| 📊 Confidence Score | How confident the expert is (0–100%) |
| 📝 Expert Notes | Additional strategy and reasoning |

#### User Bot Commands
```
/start    – Welcome message and menu
/today    – Get today's match prediction
/matches  – View all upcoming matches
/help     – Show help and instructions
```

---

### 🔑 Admin Features

| Feature | Description |
|---|---|
| ➕ Add Predictions | 3-step guided process to add a new prediction |
| 📋 List Predictions | View all active predictions |
| ✅ Verify Payments | Manually verify user payments and unlock premium |
| 📊 Bot Statistics | Users, payments, active predictions at a glance |
| 💬 Payment Notifications | Real-time alert when a user claims payment |
| 🔄 Update/Delete | Manage existing predictions |

#### Admin Bot Commands
```
/addprediction  – Add a new match prediction (guided 3-step)
/predictions    – List all predictions
/stats          – View bot statistics
/save           – Save current in-progress prediction
/skip           – Skip optional analysis fields and save
```

---

## 🛠 Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js | v18+ |
| Bot Framework | Telegraf | ^4.16.3 |
| Web Server | Express | ^4.18.2 |
| Database | MongoDB (Atlas or local) | ^7.1.1 |
| ODM | Mongoose | ^7.5.0 |
| Payments | Razorpay | ^2.9.1 |
| QR Code Generation | qrcode | ^1.5.4 |
| HTTP Client | axios | ^1.5.0 |
| Environment | dotenv | ^16.3.1 |
| Date Handling | moment.js | ^2.29.4 |
| Dev Server | nodemon | ^3.0.1 |
| Process Manager | PM2 | latest |

---

## 📁 Project Structure

```
ipl-prediction-bot/
│
├── src/                         # Core application source code
│   ├── bot.js                   # Legacy bot entrypoint (Telegraf)
│   ├── config/
│   │   └── database.js          # MongoDB connection helper
│   ├── handlers/
│   │   ├── userhandler.js       # All user-facing bot commands & flows
│   │   └── adminhandler.js      # Admin commands & management flows
│   ├── models/
│   │   ├── user.js              # Mongoose User schema (payments, subs)
│   │   ├── Prediction.js        # Mongoose Prediction schema
│   │   └── payment.js           # Mongoose Payment schema
│   ├── routes/
│   │   └── webhookRoutes.js     # Express webhook endpoint
│   ├── scripts/
│   │   └── checkSetup.js        # Config validation script
│   └── utils/
│       ├── analytics.js         # Free analysis & premium formatting
│       └── razorpay.js          # Razorpay order creation helper
│
├── config/
│   └── database.js              # Top-level DB connection (server.js)
│
├── models/                      # Top-level model aliases
│   ├── User.js
│   ├── Prediction.js
│   └── Payment.js
│
├── controllers/
│   ├── adminController.js       # REST admin controller
│   └── userController.js        # REST user controller
│
├── utils/
│   └── messages.js              # Shared message templates
│
├── server.js                    # Express server + bot launcher
├── initDb.js                    # Sample data seeder
├── setupWizard.js               # Interactive first-time setup CLI
├── install.sh                   # Auto-install shell script
├── package.json
├── .env.example                 # Environment variable template
├── .gitignore
│
├── README.md                    # This file
├── QUICKSTART.md                # 5-minute setup guide
├── QUICK_REFERENCE.md           # Printable command reference card
├── START_HERE.md                # Onboarding guide for new users
├── DEPLOYMENT.md                # Production deployment guide
├── EXAMPLES.md                  # Customisation examples
└── PROJECT_OVERVIEW.md          # Detailed architecture overview
```

---

## 🔧 Installation Guide

### Prerequisites

| Requirement | Version | Check |
|---|---|---|
| Node.js | v18+ | `node --version` |
| npm | v9+ | `npm --version` |
| MongoDB | v6+ (local) **or** MongoDB Atlas (cloud) | `mongod --version` |
| Telegram Account | Any | — |

> 💡 **Tip:** MongoDB Atlas (free cloud tier) is the easiest option — no local installation needed.

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/kvishwanathcsd256739-lab/ipl-prediction-bot.git
cd ipl-prediction-bot
```

### Step 2 — Install Dependencies

```bash
npm install
```

### Step 3 — Create Your Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Send `/newbot`
3. Enter a display name (e.g., `My IPL Predictor`)
4. Enter a username ending in `bot` (e.g., `myiplpredictorbot`)
5. **Copy the bot token** — you'll need it in the next step

### Step 4 — Get Your Telegram User ID

1. Search Telegram for **@userinfobot**
2. Send `/start`
3. **Copy your numeric User ID** (e.g., `123456789`) — this becomes your admin ID

### Step 5 — Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
# ── Telegram ────────────────────────────────────────
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# ── MongoDB ─────────────────────────────────────────
# Option A: MongoDB Atlas (cloud)
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
# Option B: Local MongoDB
# MONGODB_URI=mongodb://localhost:27017/ipl-prediction-bot

# ── Admin ────────────────────────────────────────────
ADMIN_USER_ID=123456789          # Your Telegram user ID

# ── Payments (Razorpay) ──────────────────────────────
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key

# ── UPI (for QR code generation) ────────────────────
UPI_ID=yourname@paytm
UPI_NAME=Your Full Name

# ── Pricing ──────────────────────────────────────────
PAYMENT_AMOUNT=4900              # Amount in paise (4900 = ₹49)
PAYMENT_CURRENCY=INR

# ── Server ───────────────────────────────────────────
PORT=8000
NODE_ENV=development

# ── Webhook (production only) ────────────────────────
WEBHOOK_URL=https://yourdomain.com
```

### Step 6 — (Optional) Seed Sample Data

```bash
npm run init-db
```

This inserts a sample CSK vs MI prediction so you can test the bot right away.

### Step 7 — Verify Configuration

```bash
npm run check-setup
```

This script validates that all required environment variables are present and that MongoDB is reachable.

---

## 🚀 Quick Start

### Run in Development Mode

```bash
npm run dev
```

You should see:
```
✅ MongoDB connected successfully!
🏏 IPL Prediction Bot Started!
✅ User handler active
✅ Admin handler active
✅ Server running on port 8000
```

### Test the Bot

1. Open Telegram and search for your bot username
2. Send `/start` — you should receive a welcome message
3. Send `/today` — you'll see the free analysis for today's match

### Add Your First Prediction (Admin)

```
1. In the bot, send /addprediction
2. Enter:  CSK vs RCB, 15-04-2026
3. Enter:  Winner: CSK
           Toss: RCB
           Key Player: MS Dhoni
           Confidence: 85
           Notes: CSK strong at home, Dhoni magic expected
4. Send:   /save
```

Done! Users can now unlock this prediction for ₹49.

---

## 📱 Usage Examples

### User Flow — Free Analysis

```
User:  /today

Bot:   🏏 CSK vs MI — 15 April 2026

       📋 TEAM FORM
       CSK: ✅W ✅W ❌L ✅W ✅W  (4/5)
       MI:  ✅W ❌L ✅W ❌L ✅W  (3/5)

       🌟 KEY PLAYERS
       CSK: Ruturaj Gaikwad, MS Dhoni, Ravindra Jadeja
       MI:  Rohit Sharma, Jasprit Bumrah, Suryakumar Yadav

       🏟️ PITCH: Batting-friendly surface, pace gets help early
       ☀️ WEATHER: Clear skies, hot and humid
       📊 H2H: CSK 20 – MI 12 (32 matches)
       🏠 VENUE: CSK dominates at Chepauk

       ─────────────────────────────
       💎 UNLOCK PREMIUM PREDICTIONS — ₹49
       [Unlock Now 🔐]
```

### User Flow — Unlock Premium

```
User:  [Clicks "Unlock Now 🔐"]

Bot:   💰 PAYMENT DETAILS
       Amount: ₹49
       [QR Code Image]
       UPI ID: yourname@paytm
       
       After paying, tap the button below:
       [I Have Paid ✅]

Admin: 💬 Payment claim received!
       User: @username (ID: 123456789)
       [Verify ✅]  [Reject ❌]

User:  (after admin verification)
       🏆 PREMIUM PREDICTION
       Winner: CSK 🏆
       Toss:   RCB (field first)
       Key Player: MS Dhoni ⭐
       Confidence: 85%
       Notes: CSK historically dominant at Chepauk.
              Dhoni's finishing ability is unmatched.
```

### Admin — View Statistics

```
Admin:  /stats

Bot:    📊 BOT STATISTICS
        👥 Total Users:      1,243
        💎 Paid Users:         387
        📅 Active Predictions:   3
        💰 Revenue Today:     ₹1,813
        💰 Revenue (7 days):  ₹8,967
```

### Webhook Health Check

```bash
curl http://localhost:8000/health
# {"status":"Bot is running! 🏏"}
```

---

## 📚 API Documentation

### Key Modules

#### `src/handlers/userhandler.js`
The main user-facing bot instance. Handles all user commands and conversation flows.

| Function / Command | Description |
|---|---|
| `bot.start()` | Registers new user in MongoDB, sends welcome message |
| `bot.command('today')` | Shows free analysis + premium unlock button for today's match |
| `bot.command('matches')` | Lists all upcoming matches with dates |
| `bot.command('help')` | Shows user help guide |
| `bot.action('unlock_*')` | Handles premium unlock button — generates QR & payment request |
| `bot.action('paid_*')` | User claims payment — notifies admin for verification |
| `bot.launch()` | Starts long-polling or webhook listener |

#### `src/handlers/adminhandler.js`
Admin-only bot instance for managing the prediction service.

| Function / Command | Description |
|---|---|
| `bot.command('addprediction')` | Step 1: collects match info (teams, date, venue) |
| `bot.command('predictions')` | Lists all active predictions |
| `bot.command('stats')` | Shows bot statistics |
| `bot.command('save')` | Saves the in-progress prediction to MongoDB |
| `bot.command('skip')` | Skips optional analysis and saves |
| `bot.action('verify_*')` | Verifies user payment and sends premium to user |
| `bot.action('reject_*')` | Rejects payment claim |

#### `src/utils/analytics.js`

| Function | Signature | Description |
|---|---|---|
| `generateFreeAnalysis` | `(match) → string` | Builds the full free analysis Markdown message |
| `formatPremiumPrediction` | `(prediction) → string` | Formats premium prediction for delivery to user |

#### `src/utils/razorpay.js`

| Function | Signature | Description |
|---|---|---|
| `createOrder` | `(amount, currency) → order` | Creates a Razorpay order object |

#### `config/database.js`

| Function | Signature | Description |
|---|---|---|
| `connectDB` | `() → Promise<boolean>` | Establishes MongoDB connection; returns true on success |

---

### MongoDB Schemas

#### User Schema (`src/models/user.js`)
```js
{
  telegramId:          Number,   // Unique Telegram user ID (indexed)
  username:            String,   // Telegram @username
  firstName:           String,
  lastName:            String,
  chatId:              Number,
  payments: [{
    predictionId:      ObjectId, // ref: Prediction
    amount:            Number,
    paymentDate:       Date,
    transactionId:     String,
    verified:          Boolean
  }],
  weeklySubscription: {
    active:            Boolean,
    startDate:         Date,
    endDate:           Date,
    amount:            Number
  },
  stats: {
    lastActive:        Date
  }
}
```

#### Prediction Schema (`src/models/Prediction.js`)
```js
{
  matchDate:           Date,     // indexed
  team1:               String,
  team2:               String,
  premium: {
    winner:            String,
    tossWinner:        String,
    keyPlayer:         String,
    confidence:        Number,   // 0–100
    additionalNotes:   String
  },
  freeAnalysis: {
    team1Form:         [String],
    team2Form:         [String],
    team1Players:      [{ name, role, form }],
    team2Players:      [{ name, role, form }],
    pitchReport:       String,
    weather:           String,
    headToHead:        { total, team1Wins, team2Wins },
    venue:             String,
    venueAdvantage:    String,
    tossTrend:         String
  },
  isActive:            Boolean
}
```

---

## ⚙️ Configuration

### Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `TELEGRAM_BOT_TOKEN` | ✅ | — | Bot token from @BotFather |
| `MONGODB_URI` | ✅ | — | MongoDB connection string |
| `ADMIN_USER_ID` | ✅ | — | Your Telegram numeric user ID |
| `RAZORPAY_KEY_ID` | ✅ (live) | — | Razorpay live key |
| `RAZORPAY_KEY_SECRET` | ✅ (live) | — | Razorpay secret key |
| `UPI_ID` | ✅ | — | UPI ID for QR code (e.g., `name@paytm`) |
| `UPI_NAME` | ✅ | — | Display name on payment screen |
| `PAYMENT_AMOUNT` | ✅ | `4900` | Single match price in **paise** (4900 = ₹49) |
| `PAYMENT_CURRENCY` | — | `INR` | Currency code |
| `PORT` | — | `8000` | Express server port |
| `NODE_ENV` | — | `development` | `development` or `production` |
| `WEBHOOK_URL` | Production | — | Public HTTPS URL for Telegram webhook |

### Changing the Price

```env
PAYMENT_AMOUNT=9900    # ₹99 per match
```

> All amounts are in **paise** (1 INR = 100 paise).

---

## 🔍 Features Breakdown

### How Predictions Work

```
Admin adds prediction
      ↓
User sends /today
      ↓
Bot shows FREE analysis (team form, pitch, players, head-to-head, venue)
      ↓
User clicks "Unlock Premium"
      ↓
Bot generates UPI QR code + payment link (via Razorpay)
      ↓
User pays ₹49
      ↓
User taps "I Have Paid"
      ↓
Admin receives notification and clicks "Verify"
      ↓
User instantly receives expert prediction (winner, toss, key player, confidence)
```

### Free Analysis Components

The `generateFreeAnalysis()` utility assembles 15+ data points into a rich Telegram Markdown message:

1. **Team Form** — Win/Loss results for last 5 matches
2. **Key Players** — Star names and roles
3. **Pitch Report** — Surface characteristics
4. **Weather** — Expected conditions
5. **Head-to-Head** — All-time record
6. **Venue Advantage** — Home-ground analysis
7. **Toss Trends** — Impact and preference
8. **Batting vs Bowling Strength** — Comparative rating
9. **Powerplay Score Prediction** — Expected 6-over range
10. **Expected Match Total** — Scoring projection
11. **Risk Factors** — Key uncertainties
12. **Team Insights** — Strategic notes for each side
13. **Star Player Records** — Milestones to watch
14. **Bonus Insights** — Dew factor, captaincy tactics

### Analytics Dashboard (Admin)

The `/stats` command provides a real-time snapshot:
- Total registered users
- Total paying users
- Number of active predictions
- Daily and weekly revenue totals

---

## 📊 Data Requirements

The bot is **data-driven by admin input** — there are no CSV files or ML training pipelines required. Instead, the admin provides match data through the guided `/addprediction` flow directly in Telegram.

To pre-populate the database with sample data for testing:

```bash
npm run init-db
```

This seeds a sample **CSK vs MI** prediction with full free analysis and premium picks.

---

## 🚢 Deployment

For full deployment instructions see [DEPLOYMENT.md](./DEPLOYMENT.md). A summary of options:

### PM2 (VPS/Cloud — Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start bot
pm2 start src/bot.js --name ipl-bot

# Save process list
pm2 save
pm2 startup

# Monitor logs
pm2 logs ipl-bot
pm2 status
```

### Heroku

```bash
heroku create your-ipl-bot
heroku config:set TELEGRAM_BOT_TOKEN=xxx MONGODB_URI=xxx ADMIN_USER_ID=xxx
git push heroku main
```

### Railway / Render

1. Connect GitHub repository
2. Add all environment variables from `.env`
3. Set start command: `npm start`
4. Deploy

> ⚠️ **Security:** Never commit `.env` to version control. The file is already listed in `.gitignore`.

---

## 🔧 Troubleshooting

| Problem | Likely Cause | Solution |
|---|---|---|
| Bot not responding | Wrong token or bot not started | Double-check `TELEGRAM_BOT_TOKEN` and restart |
| `MongoDB connection error` | URI missing or unreachable | Verify `MONGODB_URI`; check Atlas IP whitelist |
| QR code not generated | Missing UPI settings | Set `UPI_ID` and `UPI_NAME` in `.env` |
| Admin commands not working | Wrong admin ID | Ensure `ADMIN_USER_ID` matches your Telegram ID exactly |
| `Error: no test specified` | No test suite | Expected; run `npm run check-setup` instead |
| Port already in use | Another process on port 8000 | Change `PORT` in `.env` or stop conflicting process |
| Payment verification fails | User ID mismatch | Check bot logs; ensure user clicked "I Have Paid" |

### Debug Mode

```bash
# Enable verbose Telegraf logging
DEBUG=telegraf:* npm run dev
```

### Check Setup

```bash
npm run check-setup
```

---

## 🔄 Maintenance

### Retrain / Update Predictions

Predictions are managed in real-time through the admin Telegram interface — no code changes or redeployments required:

```
/addprediction   – Add prediction for new match
/predictions     – View and manage existing predictions
```

### Update Node.js Dependencies

```bash
npm outdated        # Check for outdated packages
npm update          # Update within semver ranges
```

### Backup MongoDB

```bash
# Dump database
mongodump --uri="$MONGODB_URI" --out=./backups/$(date +%Y%m%d)

# Restore
mongorestore --uri="$MONGODB_URI" ./backups/20260401/
```

### Monitor in Production

```bash
pm2 logs ipl-bot --lines 100    # Recent logs
pm2 monit                        # Live CPU/memory dashboard
```

---

## 📈 Results & Accuracy

The prediction accuracy depends entirely on the quality of the expert analysis provided by the admin. The bot is designed to communicate the admin's confidence level transparently:

| Confidence Range | Indicator | Typical Scenario |
|---|---|---|
| 90–100% | 🔥 Very High | Strong favourite, good conditions |
| 75–89% | ✅ High | Clear form advantage |
| 60–74% | 📊 Moderate | Competitive match, some uncertainty |
| Below 60% | ⚠️ Low | Unpredictable contest |

The confidence score (0–100) is set by the admin when adding a prediction and displayed to the user as part of the premium unlock.

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** following the existing code style
4. **Test thoroughly** — ensure the bot commands work end-to-end
5. **Commit** with a descriptive message
   ```bash
   git commit -m "feat: add weekly subscription reminder"
   ```
6. **Push** and **open a Pull Request** against `main`

### Areas for Improvement

- [ ] Automated ML model integration for score predictions
- [ ] Admin web dashboard (Express + React)
- [ ] Multi-language support (Hindi, Tamil, Telugu)
- [ ] Push notifications for match day reminders
- [ ] Automated payment verification via Razorpay webhooks
- [ ] Leaderboard for prediction accuracy tracking
- [ ] CSV import for bulk prediction upload
- [ ] Group chat support

---

## 🆘 Support & Contact

- **Issues:** [GitHub Issues](https://github.com/kvishwanathcsd256739-lab/ipl-prediction-bot/issues)
- **Documentation:** See [START_HERE.md](./START_HERE.md), [QUICKSTART.md](./QUICKSTART.md), [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Quick Reference:** [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) — printable command card

---

## 📄 License & Disclaimer

This project is licensed under the **ISC License** — see the `license` field in `package.json`.

> **Disclaimer:** This bot is for **entertainment and informational purposes only**. IPL match predictions are based on historical data, expert analysis, and statistical patterns. They are not guaranteed to be accurate and should not be used as the sole basis for financial decisions. Cricket is inherently unpredictable — upsets happen!
>
> Ensure compliance with applicable laws regarding online payment collection and sports prediction services in your jurisdiction before deploying this bot commercially.

---

<div align="center">

Made with ❤️ for cricket fans · Go Cricket! 🏏

</div>
