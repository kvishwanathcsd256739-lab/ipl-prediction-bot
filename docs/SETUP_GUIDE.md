# Setup Guide — IPL Prediction Bot

Detailed step-by-step installation guide for Windows, macOS, and Linux.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Setup (All Platforms)](#quick-setup)
- [Windows Setup](#windows-setup)
- [macOS Setup](#macos-setup)
- [Linux Setup](#linux-setup)
- [Configuration](#configuration)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, you need accounts with:

| Service | Purpose | Cost | URL |
|---------|---------|------|-----|
| Telegram | Bot platform | Free | https://telegram.org |
| MongoDB Atlas | Database | Free tier | https://www.mongodb.com/atlas |
| Razorpay | Payments | Free (2% fee) | https://razorpay.com |

And on your machine:
- **Node.js** v16 or higher
- **npm** v8 or higher (bundled with Node.js)
- **Git** (optional but recommended)

---

## Quick Setup

> Works on all platforms after prerequisites are installed.

```bash
# 1. Clone the repository
git clone https://github.com/kvishwanathcsd256739-lab/ipl-prediction-bot.git
cd ipl-prediction-bot

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env

# 4. Edit .env with your credentials (see Configuration section)

# 5. Start the bot
npm start
```

---

## Windows Setup

### Step 1: Install Node.js

1. Go to https://nodejs.org/en/download/
2. Download the **LTS** Windows installer (`.msi`)
3. Run the installer and follow the prompts
4. Accept the default installation options
5. Restart your terminal after installation

**Verify installation:**
```cmd
node --version
npm --version
```
Expected output: `v18.x.x` and `9.x.x` (or higher)

### Step 2: Install Git (Optional)

1. Download from https://git-scm.com/download/windows
2. Install with default settings
3. Open **Git Bash** for a Unix-like terminal experience

### Step 3: Get the Code

**Option A — Using Git:**
```cmd
git clone https://github.com/kvishwanathcsd256739-lab/ipl-prediction-bot.git
cd ipl-prediction-bot
```

**Option B — Download ZIP:**
1. Go to the GitHub repository
2. Click **Code → Download ZIP**
3. Extract to your preferred folder
4. Open Command Prompt in that folder

### Step 4: Install Dependencies

```cmd
npm install
```

### Step 5: Configure Environment

```cmd
copy .env.example .env
notepad .env
```

Fill in your credentials (see [Configuration](#configuration) section).

### Step 6: Start the Bot

```cmd
npm start
```

---

## macOS Setup

### Step 1: Install Homebrew (Package Manager)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Step 2: Install Node.js

```bash
brew install node
```

**Verify:**
```bash
node --version
npm --version
```

### Step 3: Clone the Repository

```bash
git clone https://github.com/kvishwanathcsd256739-lab/ipl-prediction-bot.git
cd ipl-prediction-bot
```

### Step 4: Install Dependencies

```bash
npm install
```

### Step 5: Configure Environment

```bash
cp .env.example .env
nano .env     # or: open .env
```

### Step 6: Start the Bot

```bash
npm start
```

---

## Linux Setup

### Step 1: Install Node.js

**Ubuntu/Debian:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**CentOS/RHEL/Fedora:**
```bash
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install nodejs
```

**Verify:**
```bash
node --version
npm --version
```

### Step 2: Clone the Repository

```bash
git clone https://github.com/kvishwanathcsd256739-lab/ipl-prediction-bot.git
cd ipl-prediction-bot
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Configure Environment

```bash
cp .env.example .env
nano .env
```

### Step 5: Start the Bot

```bash
npm start
```

**For production (keeps running after you log out):**
```bash
# Install PM2 process manager
npm install -g pm2

# Start with PM2
pm2 start server.js --name ipl-bot

# Auto-start on server reboot
pm2 startup
pm2 save
```

---

## Configuration

Edit your `.env` file with the following values:

### 1. Telegram Bot Token

1. Open Telegram and search for **@BotFather**
2. Send `/newbot`
3. Follow prompts to choose a name and username
4. Copy the token provided

```env
TELEGRAM_BOT_TOKEN=1234567890:ABCDEfghijklmnopqrstuvwxyz
```

### 2. MongoDB URI

1. Go to https://cloud.mongodb.com
2. Create a free account and cluster
3. Click **Connect → Connect your application**
4. Copy the connection string
5. Replace `<password>` with your database user's password

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/ipl-bot?retryWrites=true&w=majority
```

### 3. Razorpay Keys

1. Go to https://dashboard.razorpay.com
2. Sign up / log in
3. Navigate to **Settings → API Keys**
4. Generate a new key pair

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
```

> **Note:** Use `rzp_test_` keys for testing and `rzp_live_` for production.

### 4. Admin User ID

1. Open Telegram and search for **@userinfobot**
2. Send `/start` — it will reply with your User ID

```env
ADMIN_USER_ID=123456789
```

### 5. Payment Amount

Set the amount in paise (100 paise = ₹1):

```env
PAYMENT_AMOUNT=4900    # = ₹49
PAYMENT_CURRENCY=INR
```

---

## Verification

After starting the bot, verify everything works:

1. **Check server health:**
   ```bash
   curl http://localhost:8000/health
   # Expected: {"status":"Bot is running! 🏏"}
   ```

2. **Test the bot:**
   - Open Telegram and find your bot by its username
   - Send `/start`
   - You should see the welcome message

3. **Check console output:**
   ```
   ✅ MongoDB connected successfully!
   🏏 IPL Prediction Bot Started!
   ✅ Server running on port 8000
   ```

---

## Troubleshooting

### "Cannot find module" error
```bash
npm install
```

### "MONGODB_URI is not defined" error
- Ensure your `.env` file exists and has `MONGODB_URI` set
- Run: `cp .env.example .env` then edit it

### "MongooseServerSelectionError"
- Check your MongoDB URI credentials
- Ensure your IP is whitelisted in MongoDB Atlas Network Access

### Bot not responding on Telegram
- Verify `TELEGRAM_BOT_TOKEN` is correct
- Ensure the bot is started: check console shows no errors
- Check webhook URL if using webhook mode

### Port already in use
```bash
# Find and kill the process using port 8000
# Linux/macOS:
lsof -ti :8000 | xargs kill
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

For more help, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).
