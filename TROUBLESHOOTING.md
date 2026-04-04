# Troubleshooting Guide — IPL Prediction Bot

Solutions to common problems and errors.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Database Errors](#database-errors)
- [Telegram Bot Issues](#telegram-bot-issues)
- [Payment Issues](#payment-issues)
- [Server Issues](#server-issues)
- [Admin Panel Issues](#admin-panel-issues)
- [Getting More Help](#getting-more-help)

---

## Installation Issues

### Error: `Cannot find module 'telegraf'`

**Cause:** Dependencies not installed.

**Solution:**
```bash
npm install
```

If that doesn't work:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

### Error: `node: command not found`

**Cause:** Node.js is not installed or not in PATH.

**Solution:**
1. Download Node.js from https://nodejs.org
2. Install it and restart your terminal
3. Verify: `node --version`

---

### Error: `EACCES: permission denied` on npm install

**Cause:** Permission issue with npm global directory.

**Solution (Linux/macOS):**
```bash
sudo npm install
# OR fix npm permissions:
sudo chown -R $USER ~/.npm
```

---

## Database Errors

### Error: `MONGODB_URI is not defined in .env`

**Cause:** Missing or misconfigured `.env` file.

**Solution:**
```bash
cp .env.example .env
nano .env  # Add your MongoDB URI
```

---

### Error: `MongooseServerSelectionError: connection timed out`

**Cause:** Cannot reach MongoDB Atlas. Usually IP whitelist issue.

**Solution:**
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com)
2. Navigate to **Network Access**
3. Click **Add IP Address**
4. Either add your specific IP or click **Allow Access from Anywhere** (`0.0.0.0/0`) for development

---

### Error: `Authentication failed`

**Cause:** Wrong MongoDB username/password in URI.

**Solution:**
1. Go to MongoDB Atlas → **Database Access**
2. Verify username and reset password if needed
3. Update your `.env` with correct credentials

---

### Error: `MongooseError: The `uri` parameter to `openUri()` must be a string`

**Cause:** `MONGODB_URI` is not set in environment.

**Solution:**
- Make sure `.env` file exists in the project root
- Make sure `MONGODB_URI` is not commented out
- Restart the application after editing `.env`

---

## Telegram Bot Issues

### Bot Not Responding

**Possible causes and solutions:**

1. **Token is wrong:**
   - Verify `TELEGRAM_BOT_TOKEN` in `.env`
   - Go to @BotFather → `/mybots` → select your bot → `API Token`

2. **Bot not started:**
   - Check if `npm start` shows errors
   - Look for `🏏 IPL Prediction Bot Started!` in console

3. **Conflict with another instance:**
   ```
   Error: 409: Conflict
   ```
   - You have two instances running the same bot
   - Stop all instances and restart only one: `npm start`

---

### Error: `403 Forbidden: bot was blocked by the user`

**Cause:** A user has blocked the bot.

**Solution:** This is normal user behavior. The bot cannot message blocked users. You can safely ignore this error in logs.

---

### Error: `400 Bad Request: message is not modified`

**Cause:** Tried to edit a message with the same content.

**Solution:** This is a harmless error. The bot attempts to update a message that hasn't changed. Can be ignored.

---

### Commands not showing in Telegram menu

**Solution:**
Send to @BotFather:
```
/setcommands
```
Then select your bot and send:
```
start - Start the bot
today - Today's match prediction
help - Show help
```

---

## Payment Issues

### Razorpay payment not working

**Cause:** Invalid Razorpay credentials or test mode.

**Solution:**
1. Verify `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env`
2. For testing, use test mode keys (start with `rzp_test_`)
3. For production, use live keys (start with `rzp_live_`)

---

### Webhook not receiving payments

**Cause:** Webhook URL not configured or server not publicly accessible.

**Solution:**
1. Set `WEBHOOK_URL` to your server's public URL in `.env`
2. Configure webhook in Razorpay Dashboard → **Settings → Webhooks**
3. For local testing, use [ngrok](https://ngrok.com):
   ```bash
   ngrok http 8000
   # Copy the https URL and set as WEBHOOK_URL
   ```

---

### Payment verified but user not unlocked

**Cause:** Webhook processing failed silently.

**Solution:**
1. Check server logs for webhook errors
2. Manually verify payment in Razorpay Dashboard
3. Update user's `isPaid` status in MongoDB directly if needed:
   ```javascript
   db.users.updateOne(
     { telegramId: <userId> },
     { $set: { isPaid: true, subscriptionExpiry: new Date(Date.now() + 7*24*60*60*1000) } }
   )
   ```

---

## Server Issues

### Error: `EADDRINUSE: address already in use :::8000`

**Cause:** Another process is using port 8000.

**Solution:**
```bash
# Find process using port 8000
# Linux/macOS:
lsof -ti :8000 | xargs kill

# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

Or change the port in `.env`:
```env
PORT=3000
```

---

### Server crashes on startup

**Cause:** Usually a missing required environment variable.

**Checklist:**
- [ ] `.env` file exists in project root
- [ ] `TELEGRAM_BOT_TOKEN` is set and valid
- [ ] `MONGODB_URI` is set and accessible
- [ ] `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set
- [ ] `ADMIN_USER_ID` is set

---

### Memory leak / high memory usage

**Solution:**
```bash
# Use PM2 with memory limit
pm2 start server.js --name ipl-bot --max-memory-restart 200M
```

---

## Admin Panel Issues

### `/admin` returns "Unauthorized access"

**Cause:** Your Telegram ID doesn't match `ADMIN_USER_ID` in `.env`.

**Solution:**
1. Get your Telegram ID from @userinfobot
2. Update `ADMIN_USER_ID` in `.env`
3. Restart the bot

---

### Cannot add predictions

**Cause:** Admin state machine got stuck.

**Solution:**
1. Send `/admin` to reset admin state
2. Start the prediction flow again

---

## Getting More Help

If you can't resolve your issue:

1. **Check logs carefully** — Most errors have descriptive messages
2. **Search GitHub Issues** — https://github.com/kvishwanathcsd256739-lab/ipl-prediction-bot/issues
3. **Open a new issue** — Include:
   - Error message (full stack trace)
   - Your Node.js and npm versions
   - Your operating system
   - Steps to reproduce

### Useful Debug Commands

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# List installed packages
npm list --depth=0

# Test MongoDB connection
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(console.error)"

# View environment variables (never share output!)
node -e "require('dotenv').config(); console.log(Object.keys(process.env).filter(k => !k.includes('SECRET') && !k.includes('TOKEN') && !k.includes('URI')))"
```
