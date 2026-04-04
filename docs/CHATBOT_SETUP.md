# Chatbot Setup Guide — IPL Prediction Bot

Step-by-step guide for configuring your Telegram bot.

## Table of Contents

- [Creating Your Telegram Bot](#creating-your-telegram-bot)
- [Configuring Bot Settings](#configuring-bot-settings)
- [Setting Up Commands Menu](#setting-up-commands-menu)
- [Connecting to Your Server](#connecting-to-your-server)
- [Testing Your Bot](#testing-your-bot)
- [Going Live](#going-live)

---

## Creating Your Telegram Bot

### Step 1: Talk to BotFather

1. Open Telegram (mobile or desktop)
2. Search for **@BotFather** (the official Telegram bot creator)
3. Start a conversation: `/start`

### Step 2: Create New Bot

Send BotFather the command:
```
/newbot
```

BotFather will ask:
1. **Bot name** — The display name (e.g., `IPL Prediction Bot`)
2. **Bot username** — Must end in `bot` (e.g., `ipl_prediction_2026_bot`)

### Step 3: Save Your Token

BotFather will respond with:
```
Done! Congratulations on your new bot. You will find it at t.me/your_bot_name.
You can now add a description, about section and profile picture for your bot...

Use this token to access the HTTP API:
1234567890:ABCDEfghijklmnopqrstuvwxyz_your_token_here

For a description of the Bot API, see this page: https://core.telegram.org/bots/api
```

**Copy and save this token!** Add it to your `.env` file:
```env
TELEGRAM_BOT_TOKEN=1234567890:ABCDEfghijklmnopqrstuvwxyz_your_token_here
```

---

## Configuring Bot Settings

### Set Bot Description

```
/setdescription
```
Select your bot, then send:
```
🏏 IPL Prediction Bot — Get expert IPL match predictions!

✅ Free daily analysis
💎 Premium winner predictions (₹49/match)
🏆 Toss winner + Key player predictions

Start with /start to get today's prediction!
```

### Set About Section (Short)

```
/setabouttext
```
Select your bot, then send:
```
Expert IPL cricket predictions with free analysis and premium winner predictions for ₹49.
```

### Set Bot Profile Picture

```
/setuserpic
```
Select your bot, then upload a cricket/IPL themed image.

---

## Setting Up Commands Menu

When users click the **/** button in your bot, they see available commands.

### Configure Commands

Send to BotFather:
```
/setcommands
```

Select your bot, then send this exact text:
```
start - 🏏 Start the bot and see main menu
today - 📊 Today's match prediction
help - 📚 Show help and instructions
```

### Verify Commands

Click the **/** button in your bot chat — you should see all three commands.

---

## Finding Your Admin User ID

You need your Telegram User ID to set yourself as admin.

### Method 1: Using @userinfobot

1. Open Telegram and search **@userinfobot**
2. Send `/start` or any message
3. It replies with:
   ```
   Your info:
   ID: 123456789
   First: John
   Username: @john_doe
   ```
4. Copy the **ID** number

### Method 2: Using @getmyid_bot

1. Search **@getmyid_bot** on Telegram
2. Send `/start`
3. It responds with your user ID

Add your ID to `.env`:
```env
ADMIN_USER_ID=123456789
```

---

## Connecting to Your Server

### Development (Local Machine)

For local development, the bot uses **long polling** (automatically polls Telegram for updates):

```bash
npm run dev
```

No webhook needed for development.

### Production with Webhooks

For production, webhooks are more efficient:

#### Step 1: Get a Public HTTPS URL

Use [ngrok](https://ngrok.com) for testing, or your server's domain for production:

```bash
# Install ngrok
npm install -g ngrok

# Create public tunnel
ngrok http 8000

# Copy the https URL (e.g., https://abc123.ngrok.io)
```

#### Step 2: Set Webhook URL

Add to `.env`:
```env
WEBHOOK_URL=https://your-domain.com
```

#### Step 3: Register Webhook with Telegram

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-domain.com/webhook/telegram"
```

#### Step 4: Verify Webhook

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

Expected response:
```json
{
  "ok": true,
  "result": {
    "url": "https://your-domain.com/webhook/telegram",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

---

## Testing Your Bot

### Basic Functionality Test

1. Open Telegram → search for your bot
2. Send `/start` — Should see welcome message with buttons
3. Click **Today's Free Analysis** — Should see match analysis
4. Send `/today` — Same as above via command
5. Send `/help` — Should see help message

### Admin Panel Test

1. Send `/admin` (only works if your ID matches `ADMIN_USER_ID`)
2. Should see admin keyboard
3. Try adding a test prediction

### Payment Test

> Use Razorpay test cards for testing payments without real money.

1. Add a test prediction
2. Try clicking **Unlock Premium**
3. Complete payment using test card:
   - Card: `4111 1111 1111 1111`
   - Expiry: Any future date
   - CVV: Any 3 digits
4. Verify payment appears in Razorpay test dashboard

---

## Going Live

### Pre-launch Checklist

- [ ] Bot token is valid and set in `.env`
- [ ] MongoDB URI is connected and accessible
- [ ] Razorpay keys are **live** keys (not test): `rzp_live_...`
- [ ] Admin user ID is correct
- [ ] Payment amount is set correctly
- [ ] At least one active prediction is added
- [ ] Server is running and accessible
- [ ] Health endpoint responds: `GET /health`
- [ ] Bot responds to `/start`

### Switch to Razorpay Live Mode

1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Toggle to **Live Mode** (top of dashboard)
3. Navigate to **Settings → API Keys**
4. Generate live keys
5. Update `.env`:
   ```env
   RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
   ```
6. Restart the bot

### Announce Your Bot

Share your bot link: `https://t.me/your_bot_username`

---

## Troubleshooting

### Bot token not working

- Regenerate token via BotFather: `/revoke` → select bot → `/newbot`
- Ensure no spaces or line breaks in the token

### Commands not appearing

- Re-send `/setcommands` to BotFather
- Restart the Telegram app

### Webhook not receiving updates

- Ensure server has valid HTTPS (Telegram requires SSL)
- Check server firewall allows port 443/8000
- Verify webhook is registered: `getWebhookInfo`
- Switch back to polling by removing webhook: `deleteWebhook`

For more help, see [TROUBLESHOOTING.md](../TROUBLESHOOTING.md).
