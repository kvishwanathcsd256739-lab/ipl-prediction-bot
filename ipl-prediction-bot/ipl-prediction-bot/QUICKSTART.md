# 🚀 Quick Start Guide

Get your IPL Prediction Bot running in 5 minutes!

## Prerequisites Check

✅ Node.js installed? Run: `node --version` (need v18+)
✅ MongoDB installed? Run: `mongod --version` (need v6+)
✅ Have a Telegram account?

## Step-by-Step Setup

### 1. Create Your Telegram Bot (2 minutes)

1. Open Telegram on your phone
2. Search for `@BotFather`
3. Send: `/newbot`
4. Choose a name: `My IPL Predictor`
5. Choose a username: `myiplbot` (must end with 'bot')
6. **Copy the token** - looks like: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`

### 2. Get Your Telegram User ID (1 minute)

1. Search for `@userinfobot` on Telegram
2. Start the bot
3. **Copy your ID** - looks like: `123456789`

### 3. Setup Bot on Your Computer (2 minutes)

```bash
# Navigate to bot folder
cd ipl-prediction-bot

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file with your info
# Use any text editor (notepad, vim, nano, etc.)
nano .env
```

In `.env` file, replace these values:
```env
TELEGRAM_BOT_TOKEN=paste_your_bot_token_here
ADMIN_USER_ID=paste_your_user_id_here
UPI_ID=yourpaymentid@paytm
UPI_NAME=Your Name
```

Save and close (Ctrl+X, Y, Enter for nano)

### 4. Start MongoDB

```bash
# Option A: Local MongoDB
mongod

# Option B: Use MongoDB Atlas (free cloud database)
# Go to: https://www.mongodb.com/cloud/atlas
# Create free account → Create cluster → Get connection string
# Update MONGODB_URI in .env
```

### 5. Start the Bot

```bash
# Start bot
npm start
```

You should see:
```
✅ MongoDB connected successfully
🤖 IPL Prediction Bot is running...
```

### 6. Test Your Bot

1. Open Telegram
2. Search for your bot username (e.g., `@myiplbot`)
3. Send: `/start`
4. You should get a welcome message! 🎉

## First Prediction

As admin, add your first prediction:

1. In bot chat, send: `/addprediction`
2. Enter: `CSK vs RCB, 15-04-2026`
3. Enter prediction:
```
Winner: CSK
Toss: RCB
Key Player: MS Dhoni
Confidence: 85
Notes: CSK strong at home
```
4. Send: `/save`
5. Done! Users can now see this prediction

## Test Payment Flow

1. Open bot as a regular user (use another phone/account)
2. Send: `/today`
3. Click "Unlock Premium"
4. You'll see QR code and payment button
5. Click "I Have Paid"
6. Admin (you) will get verification notification
7. Click "Verify"
8. User receives premium prediction!

## Common Issues

### Bot not responding?
- Check if bot is still running (look at terminal)
- Make sure you used correct bot token
- Restart bot: Ctrl+C then `npm start`

### MongoDB error?
- Make sure MongoDB is running: `mongod`
- Or use MongoDB Atlas cloud database (easier!)

### Payment QR not showing?
- Check UPI_ID and UPI_NAME in .env
- Make sure they don't have quotes around them

## Next Steps

- Add more predictions with `/addprediction`
- Invite users to test the bot
- Customize messages in `utils/messages.js`
- Set your desired price in `.env`

## Getting Help

1. Check main README.md for detailed docs
2. Review troubleshooting section
3. Check bot logs for errors
4. Make sure all .env variables are set correctly

---

**That's it! Your bot is ready! 🏏**

Start adding predictions and sharing with cricket fans! 🎯
