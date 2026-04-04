# Client Handoff Document — IPL Prediction Bot

**Project:** IPL Prediction Bot  
**Version:** 1.0.0  
**Handoff Date:** 2026-03-28  
**Repository:** https://github.com/kvishwanathcsd256739-lab/ipl-prediction-bot

---

## Project Summary

The IPL Prediction Bot is a Telegram-based subscription service that delivers IPL cricket match predictions to subscribers. Users pay ₹49 per match prediction and receive expert winner, toss, and key player predictions.

### What Was Delivered

| Component | Status | Description |
|-----------|--------|-------------|
| Telegram Bot | ✅ Complete | Full bot with /start, /today, /help commands |
| User Management | ✅ Complete | MongoDB-based user registration and tracking |
| Payment System | ✅ Complete | Razorpay integration for ₹49/match |
| Admin Panel | ✅ Complete | Add/manage predictions via Telegram |
| Free Analysis | ✅ Complete | Detailed free analysis for all users |
| Premium Predictions | ✅ Complete | Winner, toss, player, confidence predictions |
| Webhook Handler | ✅ Complete | Automated payment verification |
| Documentation | ✅ Complete | Setup, API, architecture, maintenance guides |

---

## Access Credentials Needed

Before taking over, ensure you have:

- [ ] Telegram Bot Token (from @BotFather — or get new token)
- [ ] MongoDB Atlas login and URI
- [ ] Razorpay Dashboard access (Key ID and Secret)
- [ ] Server/hosting access (SSH credentials or dashboard login)
- [ ] Admin Telegram ID configured in `.env`

> ⚠️ **Security Note:** Change all credentials after handoff. Rotate the Telegram Bot Token via @BotFather and generate new Razorpay API keys.

---

## Server Access

| Item | Details |
|------|---------|
| Server Type | Node.js on VPS/Cloud or Heroku |
| Port | 8000 (configurable in `.env`) |
| Process Manager | PM2 (recommended) |
| Health URL | `http://your-server:8000/health` |

### Starting the Bot

```bash
# Development
npm run dev

# Production with PM2
pm2 start server.js --name ipl-bot
pm2 save
```

---

## Day-to-Day Responsibilities

### Your Regular Tasks

| Task | Frequency | How To |
|------|-----------|--------|
| Add new match predictions | Before each match | `/admin` → Add New Prediction |
| Monitor bot health | Daily | Check `/health` endpoint |
| Verify payments | Daily | Razorpay Dashboard |
| Update match results (if needed) | After matches | MongoDB Atlas UI |
| Check error logs | Daily | `pm2 logs ipl-bot` |

### Before Each IPL Match

1. Open Telegram → your bot → `/admin`
2. Click **➕ Add New Prediction**
3. Enter team names, venue, date
4. Add your prediction: winner, toss winner, confidence, key player
5. Verify it appears in `/predictions`

---

## Key Contacts & Services

| Service | URL | Purpose |
|---------|-----|---------|
| MongoDB Atlas | https://cloud.mongodb.com | Database hosting |
| Razorpay Dashboard | https://dashboard.razorpay.com | Payment management |
| Telegram BotFather | @BotFather in Telegram | Bot token management |
| GitHub Repository | https://github.com/kvishwanathcsd256739-lab/ipl-prediction-bot | Source code |

---

## Important Configuration Files

| File | Purpose | When to Edit |
|------|---------|-------------|
| `.env` | All secrets and configuration | When credentials change |
| `package.json` | Dependencies and scripts | When adding packages |
| `src/handlers/userhandler.js` | User bot logic | When changing user experience |
| `src/handlers/adminhandler.js` | Admin bot logic | When changing admin features |
| `src/utils/analytics.js` | Message templates | When updating message format |

---

## Common Operations

### Reset a User's Payment Status

If a user paid but didn't receive their prediction:

```javascript
// In MongoDB Atlas → Collections → users
db.users.updateOne(
  { telegramId: <user_telegram_id> },
  { $set: { isPaid: true, subscriptionExpiry: new Date(Date.now() + 7*24*60*60*1000) } }
)
```

Then manually send them the premium prediction by forwarding from your admin panel.

### Add a New Admin

Only one admin ID is supported currently. To change it:

1. Get the new admin's Telegram ID from @userinfobot
2. Update `ADMIN_USER_ID` in `.env`
3. Restart the bot: `pm2 restart ipl-bot`

### Change Prediction Price

Update in `.env`:
```env
PAYMENT_AMOUNT=9900    # ₹99
```

Restart the bot after changing.

### Bot Maintenance Window

To temporarily stop accepting new users:
```bash
pm2 stop ipl-bot
```

To restart:
```bash
pm2 start ipl-bot
```

---

## Documentation Index

All project documentation is available in the repository:

| Document | Purpose |
|----------|---------|
| [README.md](README.md) | Project overview |
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | Installation guide |
| [API_DOCUMENTATION.md](API_DOCUMENTATION.md) | API reference |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System design |
| [MAINTENANCE.md](MAINTENANCE.md) | Ongoing maintenance |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Problem solving |
| [CHANGELOG.md](CHANGELOG.md) | Version history |
| [docs/CHATBOT_SETUP.md](docs/CHATBOT_SETUP.md) | Bot configuration |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Deployment guide |

---

## Support & Escalation

If you encounter issues:

1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) first
2. Review server logs: `pm2 logs ipl-bot`
3. Check MongoDB Atlas status: https://www.mongodb.com/cloud/atlas/status
4. Check Telegram Bot API status: https://status.telegram.org
5. Open a GitHub issue for code-related problems

---

## Known Limitations & Future Improvements

| Item | Status | Notes |
|------|--------|-------|
| Manual predictions only | Working as designed | Admin must add each match manually |
| Single admin | Working as designed | Only one admin ID supported |
| 7-day subscription | Working as designed | Subscription expires in 7 days |
| No group chat support | Future improvement | Currently only private chats |
| No automated ML predictions | Future improvement | Predictions are admin-curated |

---

*This document should be kept updated as the project evolves.*
