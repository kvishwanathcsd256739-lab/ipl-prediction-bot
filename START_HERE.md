# 🏏 Welcome to IPL Prediction Bot!

> **A complete Telegram bot for IPL match predictions with payments**

## 🚀 Quick Start (Choose Your Path)

### 🎯 Option 1: Super Fast (5 minutes)
```bash
./install.sh          # Run installation script
npm run setup         # Interactive configuration wizard
npm start             # Start the bot
```

### 📚 Option 2: Step-by-Step
1. Read: `QUICKSTART.md`
2. Follow the 5-minute guide
3. You're done!

### 🔧 Option 3: Full Control
1. Read: `README.md` (complete documentation)
2. Configure everything manually
3. Deploy to production

---

## 📖 Documentation Guide

Start here based on what you need:

| Document | What It's For | Read Time |
|----------|---------------|-----------|
| **QUICKSTART.md** | Get bot running fast | 5 min |
| **README.md** | Complete documentation | 20 min |
| **PROJECT_OVERVIEW.md** | Understand the project | 10 min |
| **EXAMPLES.md** | Customization guide | 15 min |
| **DEPLOYMENT.md** | Production deployment | 20 min |

---

## 🎯 What This Bot Does

### Free Analysis (All Users)
- ✅ Team form, players, pitch, weather
- ✅ Head-to-head stats, venue advantage
- ✅ 35+ data points and insights

### Premium Predictions (₹49)
- 🔐 Winner prediction
- 🔐 Toss winner
- 🔐 Key player
- 🔐 Confidence %

---

## 📦 What's Included

```
✅ Complete Telegram bot code
✅ MongoDB database integration
✅ UPI payment system with QR codes
✅ Admin panel for predictions
✅ User management
✅ Payment verification system
✅ Sample data for testing
✅ Setup scripts and validators
✅ Comprehensive documentation
```

---

## 🛠️ Prerequisites

Before starting, make sure you have:

1. ✅ **Node.js** (v18 or higher)
   - Check: `node --version`
   - Get it: https://nodejs.org

2. ✅ **MongoDB** (v6 or higher)
   - Check: `mongod --version`
   - Get it: https://www.mongodb.com
   - Or use MongoDB Atlas (cloud)

3. ✅ **Telegram Account**
   - Create bot with @BotFather
   - Get your user ID from @userinfobot

4. ✅ **UPI ID** for receiving payments

---

## 🎯 First-Time Setup

### Method 1: Automated (Recommended)

```bash
# 1. Run installation script
./install.sh

# 2. Run setup wizard
npm run setup

# 3. Verify configuration
npm run check-setup

# 4. Start bot
npm start
```

### Method 2: Manual

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env

# 3. Edit .env with your details
nano .env

# 4. Verify setup
npm run check-setup

# 5. Start bot
npm start
```

---

## 📱 Testing Your Bot

After starting:

1. **Open Telegram**
2. **Search for your bot** (username you created with @BotFather)
3. **Send**: `/start`
4. **You should see**: Welcome message with buttons

### Admin Features (As Admin)
```
/addprediction - Add new prediction
/predictions   - View all predictions
/stats         - Bot statistics
```

### User Features
```
/start   - Welcome message
/today   - Today's match
/matches - All matches
/help    - Help guide
```

---

## 💡 Key Features Highlights

### For You (Admin)
- 📝 Add predictions in 2 minutes
- ✅ Verify payments manually
- 📊 Track earnings and users
- 🎯 Simple 3-step prediction flow

### For Users
- 🆓 Detailed free analysis
- 💳 Easy UPI payments
- 📱 Mobile-friendly
- ⚡ Instant access after payment

---

## 💰 Monetization

### Default Pricing
- Single match: **₹49**
- Weekly subscription: **₹299** (optional)

### Potential Revenue
- 100 users/day = ₹4,900/day
- 30 days = ₹147,000/month

*Easily customizable in `.env` file*

---

## 🔒 Security & Privacy

- ✅ Admin-only commands
- ✅ Payment verification required
- ✅ No automatic charges
- ✅ Secure environment variables
- ✅ Input validation

---

## 📊 Sample Data

Includes complete sample prediction:
- Match: CSK vs RCB
- Full analysis (all 35+ insights)
- Premium prediction

Run: `npm run init-db` to load sample.

---

## 🆘 Need Help?

### Common Issues

**Bot not responding?**
- Check if bot is running
- Verify bot token
- Check internet connection

**MongoDB error?**
- Ensure MongoDB is running: `mongod`
- Or use MongoDB Atlas (cloud)

**Payment not working?**
- Verify UPI ID format
- Check admin user ID

### Get Support

1. Check **README.md** troubleshooting section
2. Review error messages in console
3. Run `npm run check-setup` for diagnostics

---

## 🚀 What's Next?

After setup:

1. **Add your first prediction**
   - Use `/addprediction`
   - Enter match details
   - Save and test

2. **Share with users**
   - Share bot link
   - Test payment flow
   - Start earning!

3. **Customize**
   - Check `EXAMPLES.md` for customization
   - Modify messages, prices, features

4. **Deploy to production**
   - See `DEPLOYMENT.md`
   - Run 24/7 on cloud server

---

## 📚 Learning Path

**New to bots?** → Start with QUICKSTART.md

**Want to customize?** → Read EXAMPLES.md

**Ready for production?** → Follow DEPLOYMENT.md

**Need full reference?** → Check README.md

---

## ✨ Pro Tips

1. **Test everything locally first**
2. **Start with sample data** (`npm run init-db`)
3. **Use setup wizard** (`npm run setup`)
4. **Verify before deploying** (`npm run check-setup`)
5. **Keep .env file secure**

---

## 📦 Project Structure

```
ipl-prediction-bot/
├── 📄 START_HERE.md     ← You are here
├── 📄 QUICKSTART.md     ← 5-minute guide
├── 📄 README.md         ← Full documentation
├── 📄 EXAMPLES.md       ← Customization
├── 📄 DEPLOYMENT.md     ← Production setup
├── 
├── src/
│   └── bot.js           ← Main bot file
├── models/              ← Database schemas
├── controllers/         ← Business logic
├── utils/               ← Helper functions
└── config/              ← Configuration
```

---

## 🎯 Quick Commands Reference

```bash
# Setup & Installation
./install.sh          # Auto install
npm run setup         # Interactive setup
npm run check-setup   # Verify configuration

# Database
npm run init-db       # Load sample data

# Running
npm start             # Production mode
npm run dev           # Development mode

# Deployment
pm2 start src/bot.js  # Production with PM2
```

---

## ✅ Pre-Launch Checklist

Before going live:

- [ ] Node.js installed (v18+)
- [ ] MongoDB running
- [ ] Bot created with @BotFather
- [ ] .env file configured
- [ ] UPI ID added
- [ ] Admin user ID set
- [ ] Configuration verified
- [ ] Bot tested locally
- [ ] Sample prediction works
- [ ] Payment flow tested

---

## 🎉 You're Ready!

Choose your next step:

👉 **New to this?** → Open `QUICKSTART.md`

👉 **Want details?** → Open `README.md`

👉 **Ready to customize?** → Open `EXAMPLES.md`

👉 **Going to production?** → Open `DEPLOYMENT.md`

---

**Questions?** All answers are in the documentation!

**Ready?** Let's start with the Quick Start guide! 🚀

---

*Built with ❤️ for cricket fans and entrepreneurs*
