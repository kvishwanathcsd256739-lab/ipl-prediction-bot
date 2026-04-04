# Maintenance Guide — IPL Prediction Bot

Guide for ongoing maintenance, monitoring, updates, and performance tuning.

## Table of Contents

- [Routine Maintenance](#routine-maintenance)
- [Adding New Predictions](#adding-new-predictions)
- [Database Maintenance](#database-maintenance)
- [Monitoring](#monitoring)
- [Updates & Upgrades](#updates--upgrades)
- [Backups](#backups)
- [Performance Tuning](#performance-tuning)
- [Log Management](#log-management)

---

## Routine Maintenance

### Daily Tasks

- [ ] Check bot is responding to `/start` and `/today` commands
- [ ] Verify today's active prediction is set correctly
- [ ] Monitor payment webhook success rate in Razorpay dashboard
- [ ] Review error logs for unusual activity

### Weekly Tasks

- [ ] Add upcoming week's match predictions via admin panel
- [ ] Review user growth metrics (`/stats` command)
- [ ] Check MongoDB Atlas free tier limits (512MB on free tier)
- [ ] Verify payment records match Razorpay dashboard

### Monthly Tasks

- [ ] Update team rosters and player information if needed
- [ ] Review and archive old predictions
- [ ] Check for Node.js package security updates
- [ ] Review server resource usage

---

## Adding New Predictions

Predictions must be added before each match via the admin panel.

### Step 1: Prepare Match Data

Before adding, gather:
- Team names (use exact abbreviations: CSK, MI, RCB, etc.)
- Match venue/city
- Match date and time (IST)
- Your prediction: winner, toss winner
- Key player to watch
- Confidence level (50%–100%)

### Step 2: Add via Bot

1. Open Telegram and start a chat with your bot
2. Send `/admin`
3. Press **➕ Add New Prediction**
4. Follow the step-by-step wizard:
   - Select Team 1
   - Select Team 2
   - Select Venue
   - Enter date
   - Select predicted winner
   - Select toss winner
   - Select confidence level
   - Enter key player name

### Step 3: Verify

After adding, send `/predictions` to confirm the match appears in the list.

### Step 4: Activate

Ensure the prediction has `active: true`. If not visible to users, check the prediction's `active` field in MongoDB.

---

## Database Maintenance

### View Database Stats

Connect to MongoDB Atlas → Your Cluster → **Collections** tab.

Useful Atlas metrics to monitor:
- Storage used (free tier limit: 512MB)
- Index sizes
- Operation counts

### Archiving Old Predictions

To prevent database bloat, archive predictions older than 30 days:

```javascript
// Run in MongoDB Atlas → Collections → Aggregate (or MongoDB Shell)
db.predictions.updateMany(
  { date: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
  { $set: { active: false, archived: true } }
)
```

### Clean Up Old Payments

```javascript
// Archive payments older than 90 days
db.payments.updateMany(
  { createdAt: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } },
  { $set: { archived: true } }
)
```

### Expired Subscriptions

```javascript
// Find users with expired subscriptions
db.users.find({
  isPaid: true,
  subscriptionExpiry: { $lt: new Date() }
})

// Deactivate expired subscriptions
db.users.updateMany(
  { isPaid: true, subscriptionExpiry: { $lt: new Date() } },
  { $set: { isPaid: false } }
)
```

---

## Monitoring

### Health Check

Monitor the `/health` endpoint:
```
GET http://your-server:8000/health
Expected: {"status":"Bot is running! 🏏"}
```

### PM2 Monitoring (if using PM2)

```bash
# View running processes
pm2 list

# View real-time logs
pm2 logs ipl-bot

# View CPU and memory usage
pm2 monit

# Restart bot
pm2 restart ipl-bot
```

### Uptime Monitoring

Use a free uptime service to ping `/health` every 5 minutes:

- [UptimeRobot](https://uptimerobot.com) — Free, 5-minute intervals
- [Better Uptime](https://betteruptime.com) — Free tier available

Set up alerts for when the endpoint is unreachable.

---

## Updates & Upgrades

### Updating npm Packages

```bash
# Check for outdated packages
npm outdated

# Update all packages to latest compatible versions
npm update

# Check for security vulnerabilities
npm audit

# Fix fixable vulnerabilities
npm audit fix
```

### Deploying Updates

```bash
# Pull latest code
git pull origin main

# Install any new dependencies
npm install

# Restart with PM2
pm2 restart ipl-bot

# Verify the restart
pm2 logs ipl-bot --lines 20
```

### Zero-Downtime Reload (PM2)

```bash
pm2 reload ipl-bot
```

---

## Backups

### MongoDB Atlas Automated Backups

MongoDB Atlas free tier provides point-in-time recovery.

**To configure:**
1. Go to Atlas → Your Cluster → **Backup** tab
2. Enable **Continuous Cloud Backup** (paid) or use manual snapshots

### Manual Data Export

```bash
# Export all collections (requires MongoDB CLI tools)
mongoexport --uri="<MONGODB_URI>" --collection=users --out=backup_users.json
mongoexport --uri="<MONGODB_URI>" --collection=predictions --out=backup_predictions.json
mongoexport --uri="<MONGODB_URI>" --collection=payments --out=backup_payments.json
```

### Backup Schedule Recommendation

| Data | Frequency | Retention |
|------|-----------|-----------|
| Full database | Weekly | 4 weeks |
| Predictions | Daily (before new additions) | 30 days |
| User records | Weekly | 90 days |

---

## Performance Tuning

### Node.js Optimization

```bash
# Set Node.js to production mode
NODE_ENV=production npm start

# Use cluster mode with PM2 (utilizes multiple CPU cores)
pm2 start server.js -i max --name ipl-bot
```

### MongoDB Query Optimization

Ensure these indexes exist on your collections:

```javascript
// users collection
db.users.createIndex({ telegramId: 1 }, { unique: true })

// predictions collection
db.predictions.createIndex({ matchId: 1 }, { unique: true })
db.predictions.createIndex({ active: 1, date: 1 })

// payments collection
db.payments.createIndex({ telegramUserId: 1 })
db.payments.createIndex({ razorpayOrderId: 1 })
```

### Response Time Optimization

- Use MongoDB connection pooling (Mongoose handles this automatically)
- Cache frequently accessed predictions in memory for high-traffic periods:

```javascript
// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedPrediction() {
  const cached = cache.get('active_prediction');
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return cached.data;
  }
  const data = await Prediction.findOne({ active: true });
  cache.set('active_prediction', { data, time: Date.now() });
  return data;
}
```

---

## Log Management

### Viewing Logs

```bash
# PM2 logs
pm2 logs ipl-bot

# Last 100 lines
pm2 logs ipl-bot --lines 100

# Follow in real-time
pm2 logs ipl-bot --follow
```

### Log Rotation (PM2)

```bash
# Install PM2 log rotation
pm2 install pm2-logrotate

# Configure: keep 7 days of logs, max 10MB per file
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### What to Monitor in Logs

| Log Pattern | Meaning | Action |
|-------------|---------|--------|
| `✅ MongoDB connected` | Normal startup | None |
| `❌ MongoDB connection error` | DB issue | Check URI, network access |
| `Bot error: 409: Conflict` | Two instances running | Stop duplicate instance |
| `403 Forbidden: bot was blocked` | User blocked bot | Normal, ignore |
| `RAZORPAY_KEY` errors | Invalid keys | Verify keys in .env |
| `TypeError` / `ReferenceError` | Code bug | Check stack trace |
