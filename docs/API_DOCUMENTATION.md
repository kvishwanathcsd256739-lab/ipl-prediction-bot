# API Documentation — IPL Prediction Bot

Complete reference for all modules, functions, and interfaces.

## Table of Contents

- [REST API Endpoints](#rest-api-endpoints)
- [Bot Commands](#bot-commands)
- [Database Models](#database-models)
- [Utility Modules](#utility-modules)
- [Configuration](#configuration)

---

## REST API Endpoints

The Express.js server exposes the following HTTP endpoints:

### Health Check

```
GET /health
```

**Response:**
```json
{
  "status": "Bot is running! 🏏"
}
```

**Status Codes:**
- `200 OK` — Server is running

---

### Webhook — Razorpay Payment

```
POST /webhook/razorpay
```

**Description:** Receives payment confirmation from Razorpay after a user completes payment.

**Headers:**
```
Content-Type: application/json
x-razorpay-signature: <hmac_sha256_signature>
```

**Request Body:**
```json
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_xxxxxxxxxxxx",
        "amount": 4900,
        "currency": "INR",
        "status": "captured",
        "order_id": "order_xxxxxxxxxxxx",
        "notes": {
          "telegramUserId": "123456789",
          "predictionId": "abc123"
        }
      }
    }
  }
}
```

**Response:**
```json
{ "status": "ok" }
```

**Status Codes:**
- `200 OK` — Webhook processed
- `400 Bad Request` — Invalid signature
- `500 Internal Server Error` — Processing error

---

## Bot Commands

### User Commands

#### `/start`

Initializes the bot for a new user and shows the main menu.

**Usage:** `/start`

**Behavior:**
- Creates or updates the user record in MongoDB
- Displays welcome message with inline keyboard
- Shows options: Today's Free Analysis, Premium Prediction, About

**Response (Telegram):**
```
🏏 WELCOME TO IPL PREDICTION BOT 🏏

Hi [Name]! 👋

I'm your cricket expert teacher:
✅ I study IPL matches
✅ I give expert predictions
✅ I predict who will win

📊 FREE ANALYSIS for everyone
💎 PREMIUM PREDICTIONS (₹49)

[Today's Free Analysis] [Premium Prediction] [About]
```

---

#### `/today`

Shows today's active prediction with free analysis.

**Usage:** `/today`

**Behavior:**
- Queries MongoDB for `active: true` predictions sorted by match date
- If no active prediction: returns error message
- Shows match details with unlock button

**Response:**
```
🏏 TODAY'S MATCH

📊 [Team1] vs [Team2]
📅 [Date]

Free analysis is available!

💎 Unlock premium for winner prediction.

[💎 Unlock Premium (₹49)]
```

---

#### `/help`

Displays all available commands and usage instructions.

**Usage:** `/help`

**Response:**
```
📚 HELP & INSTRUCTIONS

Available Commands:
/start - Start the bot
/today - Today's match prediction
/help - Show this help message

How to Use:
1. Click "Today's Free Analysis" for detailed insights
2. Pay ₹49 to unlock premium prediction
3. Get winner, toss, and key player predictions
```

---

### Admin Commands

> Admin commands require the sender's Telegram ID to match `ADMIN_USER_ID` in `.env`.

#### `/predictions`

Lists all currently active predictions.

**Usage:** `/predictions`

**Response:**
```
📋 ACTIVE PREDICTIONS

1. RCB vs MI
   📅 28/03/2026
   🏆 Winner: RCB

2. CSK vs KKR
   📅 29/03/2026
   🏆 Winner: CSK
```

---

#### `/stats`

Shows bot usage statistics.

**Usage:** `/stats`

**Response:**
```
📊 BOT STATISTICS

👥 Total Users: 1,234
📝 Total Predictions: 70
💰 Verified Payments: 456
```

---

#### `/admin`

Opens the admin management panel with keyboard shortcuts.

**Usage:** `/admin`

**Available admin actions:**
- `➕ Add New Prediction` — Step-by-step prediction creation
- `📊 View Predictions` — List all predictions

---

### Inline Button Callbacks

| Callback Data | Description |
|---------------|-------------|
| `today` | Show today's free analysis |
| `premium` | Show premium purchase prompt |
| `about` | Show about information |
| `pay_<predictionId>` | Initiate payment for specific prediction |

---

## Database Models

### User

**Collection:** `users`

```javascript
{
  telegramId: Number,        // Telegram user ID (unique, required)
  username: String,          // Telegram @username
  chatId: Number,            // Telegram chat ID
  isPaid: Boolean,           // Has active subscription (default: false)
  subscriptionExpiry: Date,  // When subscription expires
  createdAt: Date,           // Account creation timestamp
  updatedAt: Date            // Last update timestamp
}
```

**Indexes:** `telegramId` (unique)

---

### Prediction

**Collection:** `predictions`

```javascript
{
  matchId: String,           // Unique match identifier (required)
  team1: String,             // First team name
  team2: String,             // Second team name
  venue: String,             // Match venue/city
  date: Date,                // Match date and time
  active: Boolean,           // Is prediction currently active
  premiumPrediction: {
    winner: String,          // Predicted match winner
    tossWinner: String,      // Predicted toss winner
    keyPlayer: String,       // Key player to watch
    confidence: String       // Confidence level (e.g., "90%")
  },
  freeAnalysis: {
    teamForm: String,        // Recent form description
    pitchReport: String,     // Pitch conditions
    weather: String,         // Weather forecast
    headToHead: String,      // H2H record summary
    venueAdvantage: String   // Home/venue advantage notes
  },
  adminId: Number,           // Admin Telegram ID who created it
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:** `matchId` (unique)

---

### Payment

**Collection:** `payments`

```javascript
{
  telegramUserId: Number,    // User's Telegram ID
  predictionId: String,      // Which prediction was purchased
  razorpayOrderId: String,   // Razorpay order ID
  razorpayPaymentId: String, // Razorpay payment ID
  amount: Number,            // Amount in paise
  currency: String,          // Currency code (INR)
  status: String,            // "pending" | "verified" | "failed"
  createdAt: Date,
  updatedAt: Date
}
```

---

## Utility Modules

### `src/utils/analytics.js`

Provides message formatting utilities and constants.

#### `generateFreeAnalysis(matchData)`

Generates a formatted free analysis message for a match.

**Parameters:**
```javascript
matchData = {
  team1: String,              // Team 1 name
  team2: String,              // Team 2 name
  venue: String,              // Match venue
  date: String,               // Match date
  team1Form: String,          // Last 5 matches form (optional)
  team2Form: String,          // Last 5 matches form (optional)
  team1Stars: String,         // Star players description (optional)
  team2Stars: String,         // Star players description (optional)
  pitchReport: String,        // Pitch conditions (optional)
  weather: String,            // Weather info (optional)
  h2hTotal: Number,           // Total H2H matches (optional)
  team1H2hWins: Number,       // Team 1 H2H wins (optional)
  team2H2hWins: Number,       // Team 2 H2H wins (optional)
  venueAdvantage: String,     // Venue advantage notes (optional)
  tossTrend: String,          // Toss trend (optional)
  expectedTotal: String,      // Expected score range (optional)
  powPlayScore: String,       // Powerplay score prediction (optional)
  riskFactors: String,        // Risk factors (optional)
  playerPredictions: String,  // Player performance predictions (optional)
  milestones: String,         // Milestone opportunities (optional)
  insights: String            // Additional insights (optional)
}
```

**Returns:** `String` — Formatted Telegram Markdown message

---

#### `formatPremiumPrediction(prediction)`

Formats a premium prediction for display.

**Parameters:**
```javascript
prediction = {
  team1: String,
  team2: String,
  venue: String,
  premiumPrediction: {
    winner: String,
    tossWinner: String,
    confidence: String,
    keyPlayer: String
  }
}
```

**Returns:** `String` — Formatted premium prediction message

---

#### Constants

```javascript
IPL_TEAMS = ["CSK", "MI", "RCB", "DC", "KKR", "PBKS", "RR", "SRH", "GT", "LSG"]

VENUES = ["Chennai", "Mumbai", "Bangalore", "Delhi", "Kolkata",
          "Mohali", "Jaipur", "Hyderabad", "Ahmedabad", "Lucknow"]

CONFIDENCE_LEVELS = ["50%", "60%", "70%", "80%", "90%", "100%"]
```

---

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TELEGRAM_BOT_TOKEN` | ✅ Yes | — | Telegram bot authentication token |
| `MONGODB_URI` | ✅ Yes | — | MongoDB connection string |
| `RAZORPAY_KEY_ID` | ✅ Yes | — | Razorpay API key ID |
| `RAZORPAY_KEY_SECRET` | ✅ Yes | — | Razorpay API key secret |
| `ADMIN_USER_ID` | ✅ Yes | — | Admin Telegram user ID |
| `PORT` | No | `8000` | HTTP server port |
| `NODE_ENV` | No | `development` | Environment mode |
| `PAYMENT_AMOUNT` | No | `4900` | Payment amount in paise |
| `PAYMENT_CURRENCY` | No | `INR` | Payment currency |
| `WEBHOOK_URL` | No | — | Public URL for Telegram webhook |

### `config/database.js`

Exports the `connectDB()` async function that establishes MongoDB connection.

**Usage:**
```javascript
const connectDB = require('./config/database');
await connectDB();
```
