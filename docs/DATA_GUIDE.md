# Data Guide — IPL Prediction Bot

Guide to the data used by the bot and how to manage it.

## Table of Contents

- [Data Sources](#data-sources)
- [Database Collections](#database-collections)
- [Adding Match Data](#adding-match-data)
- [Managing Predictions](#managing-predictions)
- [Data Formats](#data-formats)
- [Data Backup & Recovery](#data-backup--recovery)

---

## Data Sources

The IPL Prediction Bot uses **manually curated data** managed by the admin through the Telegram admin panel. All data is stored in MongoDB Atlas.

| Data Type | Storage | Updated By | Frequency |
|-----------|---------|------------|-----------|
| Match predictions | MongoDB | Admin via bot | Before each match |
| User accounts | MongoDB | Automatic | On each /start |
| Payment records | MongoDB | Automatic | On each payment |
| Team/venue lists | Source code | Developer | Seasonally |

---

## Database Collections

### Collection: `users`

Stores all registered Telegram users.

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `telegramId` | Number | Unique Telegram user ID |
| `username` | String | Telegram @username |
| `chatId` | Number | Chat ID for direct messaging |
| `isPaid` | Boolean | Active subscriber status |
| `subscriptionExpiry` | Date | When subscription expires |
| `createdAt` | Date | Registration timestamp |
| `updatedAt` | Date | Last update timestamp |

**Sample document:**
```json
{
  "_id": "64a1b2c3d4e5f6789012345",
  "telegramId": 123456789,
  "username": "cricket_fan",
  "chatId": 123456789,
  "isPaid": true,
  "subscriptionExpiry": "2026-04-05T12:00:00.000Z",
  "createdAt": "2026-03-28T09:00:00.000Z",
  "updatedAt": "2026-03-29T10:30:00.000Z"
}
```

---

### Collection: `predictions`

Stores all IPL match predictions created by the admin.

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `matchId` | String | Unique match identifier |
| `team1` | String | First team abbreviation |
| `team2` | String | Second team abbreviation |
| `venue` | String | Match venue city |
| `date` | Date | Match date and time |
| `active` | Boolean | Whether prediction is currently shown |
| `premiumPrediction.winner` | String | Predicted match winner |
| `premiumPrediction.tossWinner` | String | Predicted toss winner |
| `premiumPrediction.keyPlayer` | String | Key player to watch |
| `premiumPrediction.confidence` | String | Prediction confidence (e.g., "90%") |
| `freeAnalysis.teamForm` | String | Recent form description |
| `freeAnalysis.pitchReport` | String | Pitch conditions text |
| `freeAnalysis.weather` | String | Weather information |
| `freeAnalysis.headToHead` | String | H2H history summary |
| `freeAnalysis.venueAdvantage` | String | Venue advantage notes |
| `adminId` | Number | Admin's Telegram ID |
| `createdAt` | Date | Creation timestamp |

**Sample document:**
```json
{
  "_id": "64a1b2c3d4e5f6789012346",
  "matchId": "CSK_MI_2026_M01",
  "team1": "CSK",
  "team2": "MI",
  "venue": "Chennai",
  "date": "2026-03-28T14:00:00.000Z",
  "active": true,
  "premiumPrediction": {
    "winner": "CSK",
    "tossWinner": "MI",
    "keyPlayer": "MS Dhoni",
    "confidence": "85%"
  },
  "freeAnalysis": {
    "teamForm": "CSK: W W L W W | MI: L W W L W",
    "pitchReport": "Good batting pitch, expected high scores",
    "weather": "Clear ☀️, 28°C",
    "headToHead": "CSK leads 18-12 in 30 matches",
    "venueAdvantage": "CSK strong at Chepauk"
  },
  "adminId": 8795510349,
  "createdAt": "2026-03-27T18:00:00.000Z"
}
```

---

### Collection: `payments`

Stores all payment transactions.

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `telegramUserId` | Number | Paying user's Telegram ID |
| `predictionId` | String | Prediction that was purchased |
| `razorpayOrderId` | String | Razorpay order reference |
| `razorpayPaymentId` | String | Razorpay payment ID |
| `amount` | Number | Amount paid in paise |
| `currency` | String | Currency (INR) |
| `status` | String | `pending`, `verified`, `failed` |
| `createdAt` | Date | Transaction timestamp |

---

## Adding Match Data

### Via Admin Bot Panel (Recommended)

The standard way to add predictions is through the Telegram admin interface:

1. Send `/admin` to your bot
2. Select **➕ Add New Prediction**
3. Follow the step-by-step wizard

**Team Abbreviations to Use:**

| Team | Abbreviation |
|------|-------------|
| Chennai Super Kings | CSK |
| Mumbai Indians | MI |
| Royal Challengers Bengaluru | RCB |
| Delhi Capitals | DC |
| Kolkata Knight Riders | KKR |
| Punjab Kings | PBKS |
| Rajasthan Royals | RR |
| Sunrisers Hyderabad | SRH |
| Gujarat Titans | GT |
| Lucknow Super Giants | LSG |

### Via MongoDB Atlas (Direct)

For bulk updates or corrections, use MongoDB Atlas UI:

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Select your cluster → **Browse Collections**
3. Select `predictions` collection
4. Click **Insert Document**
5. Paste your JSON document

---

## Managing Predictions

### View Active Predictions

Send `/predictions` to the bot — shows up to 10 active predictions.

Or via MongoDB Atlas:
```javascript
db.predictions.find({ active: true }).sort({ date: 1 })
```

### Deactivate a Prediction

In MongoDB Atlas:
```javascript
db.predictions.updateOne(
  { matchId: "CSK_MI_2026_M01" },
  { $set: { active: false } }
)
```

### Update a Prediction

```javascript
db.predictions.updateOne(
  { matchId: "CSK_MI_2026_M01" },
  {
    $set: {
      "premiumPrediction.winner": "MI",
      "premiumPrediction.confidence": "75%"
    }
  }
)
```

### Archive Old Predictions

```javascript
// Archive predictions older than 7 days
db.predictions.updateMany(
  { date: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
  { $set: { active: false } }
)
```

---

## Data Formats

### Date Format

All dates are stored as UTC ISO 8601 strings in MongoDB:
```
2026-03-28T14:00:00.000Z
```

When adding dates via admin panel, use the format:
```
28/03/2026 7:30 PM IST
```

### Team Form String

Format for the `freeAnalysis.teamForm` field:
```
TEAM: W W L W W
```
Where W = Win, L = Loss, representing last 5 matches (most recent last).

### Confidence Levels

Accepted values for `premiumPrediction.confidence`:
```
50%  60%  70%  80%  90%  100%
```

---

## Data Backup & Recovery

### Automated Backups via Atlas

MongoDB Atlas free tier provides automated backups:
1. Go to Atlas → Your Cluster → **Backup**
2. Configure backup schedule

### Manual Export

```bash
# Export predictions
mongoexport \
  --uri="<YOUR_MONGODB_URI>" \
  --collection=predictions \
  --out=predictions_backup_$(date +%Y%m%d).json

# Export users (exclude sensitive data)
mongoexport \
  --uri="<YOUR_MONGODB_URI>" \
  --collection=users \
  --fields="telegramId,username,isPaid,createdAt" \
  --out=users_backup_$(date +%Y%m%d).json
```

### Import from Backup

```bash
mongoimport \
  --uri="<YOUR_MONGODB_URI>" \
  --collection=predictions \
  --file=predictions_backup_20260328.json
```

### Recovery Steps

If data is lost:
1. Stop the bot: `pm2 stop ipl-bot`
2. Restore from latest backup using `mongoimport`
3. Verify data in Atlas UI
4. Restart: `pm2 start ipl-bot`
