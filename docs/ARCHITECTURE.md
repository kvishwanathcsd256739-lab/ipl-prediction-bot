# Architecture — IPL Prediction Bot

System design document explaining components, data flow, and architecture decisions.

## Table of Contents

- [System Overview](#system-overview)
- [Architecture Diagram](#architecture-diagram)
- [Components](#components)
- [Data Flow](#data-flow)
- [Database Design](#database-design)
- [Technology Stack](#technology-stack)
- [Security Architecture](#security-architecture)

---

## System Overview

The IPL Prediction Bot is a **Telegram-based subscription service** that provides cricket match predictions. It follows a **monolithic Node.js architecture** with:

- A **Telegram bot** as the user interface
- An **Express.js HTTP server** for webhooks
- **MongoDB** as the primary data store
- **Razorpay** for payment processing

### Key Design Principles

1. **Simplicity** — Single Node.js process handles all concerns
2. **Reliability** — MongoDB for persistent storage, error handling everywhere
3. **Security** — Admin authorization, payment signature verification
4. **Scalability** — Stateless design with database-backed state

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENTS                             │
│                                                          │
│  ┌──────────────┐          ┌──────────────────────────┐  │
│  │  Telegram    │          │  Razorpay Payment        │  │
│  │  Users       │          │  Gateway                 │  │
│  └──────┬───────┘          └──────────┬───────────────┘  │
└─────────┼────────────────────────────┼────────────────── ┘
          │ Telegram API               │ Webhook POST
          │ (long polling)             │ /webhook/razorpay
          ▼                            ▼
┌─────────────────────────────────────────────────────────┐
│                   IPL PREDICTION BOT SERVER              │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │                  server.js (Entry Point)             │ │
│  │  Express.js + Telegraf Bot                          │ │
│  └──────────────────┬────────────────────────────────── │ │
│                     │                                   │ │
│          ┌──────────┴──────────┐                        │ │
│          │                     │                        │ │
│          ▼                     ▼                        │ │
│  ┌───────────────┐    ┌────────────────┐                │ │
│  │ User Handler  │    │ Admin Handler  │                │ │
│  │ (userhandler) │    │ (adminhandler) │                │ │
│  │               │    │                │                │ │
│  │ /start        │    │ /admin         │                │ │
│  │ /today        │    │ /predictions   │                │ │
│  │ /help         │    │ /stats         │                │ │
│  │ Payments      │    │ Add Prediction │                │ │
│  └───────┬───────┘    └───────┬────────┘                │ │
│          │                    │                         │ │
│          └──────────┬─────────┘                         │ │
│                     │                                   │ │
│                     ▼                                   │ │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              Data Layer                              │ │
│  │                                                      │ │
│  │  ┌──────────┐  ┌────────────┐  ┌──────────────────┐ │ │
│  │  │  User    │  │ Prediction │  │    Payment       │ │ │
│  │  │  Model   │  │  Model     │  │    Model         │ │ │
│  │  └────┬─────┘  └──────┬─────┘  └────────┬─────────┘ │ │
│  └───────┼───────────────┼────────────────── ┼──────────┘ │
│          └───────────────┼───────────────────┘           │
│                          │                               │
└──────────────────────────┼───────────────────────────────┘
                           │ Mongoose ODM
                           ▼
                  ┌────────────────┐
                  │  MongoDB Atlas │
                  │  (Cloud DB)    │
                  └────────────────┘
```

---

## Components

### 1. Entry Point (`server.js`)

**Responsibilities:**
- Bootstraps the entire application
- Establishes MongoDB connection before loading handlers
- Creates Express HTTP server
- Registers webhook routes
- Handles graceful shutdown (SIGINT)

**Key design decision:** MongoDB connects *before* handlers load. This prevents the bot from starting if the database is unavailable.

---

### 2. User Handler (`src/handlers/userhandler.js`)

**Responsibilities:**
- Handles all end-user interactions
- Processes bot commands: `/start`, `/today`, `/help`
- Manages inline button callbacks
- Initiates Razorpay payment flow

**State management:** User state is persisted in MongoDB, not in memory, making the bot stateless and restartable.

---

### 3. Admin Handler (`src/handlers/adminhandler.js`)

**Responsibilities:**
- Admin-only interface (gated by `ADMIN_USER_ID`)
- Multi-step prediction creation wizard
- Prediction management (view, edit, delete)
- Bot statistics

**Authorization:** Every admin command checks `ctx.from.id === parseInt(process.env.ADMIN_USER_ID)`.

---

### 4. Webhook Routes (`src/routes/webhookRoutes.js`)

**Responsibilities:**
- Receives Razorpay payment confirmations
- Verifies webhook signature (HMAC-SHA256)
- Updates payment and user subscription status

---

### 5. Data Models (`src/models/`)

Three Mongoose models:
- `User` — Telegram users and subscription status
- `Prediction` — Match predictions (admin-created)
- `Payment` — Payment transaction records

---

### 6. Analytics Utility (`src/utils/analytics.js`)

**Responsibilities:**
- Message formatting (free analysis, premium prediction)
- IPL teams and venues constants

---

## Data Flow

### New User Registration

```
User sends /start
     │
     ▼
Bot receives update (Telegraf)
     │
     ▼
userHandler processes /start
     │
     ▼
User.findOneAndUpdate() with upsert
     │
     ├─ New user: creates record
     └─ Existing: updates lastActive
     │
     ▼
Bot sends welcome message with inline keyboard
```

---

### Premium Purchase Flow

```
User clicks "Unlock Premium (₹49)"
     │
     ▼
Bot creates Razorpay order
     │
     ▼
Bot sends payment link to user
     │
     ▼
User completes payment on Razorpay
     │
     ▼
Razorpay sends webhook POST to /webhook/razorpay
     │
     ▼
Server verifies HMAC signature
     │
     ▼
Payment model updated (status: "verified")
     │
     ▼
User.isPaid = true, subscriptionExpiry set
     │
     ▼
Bot sends premium prediction to user
```

---

### Admin Prediction Creation

```
Admin sends "➕ Add New Prediction"
     │
     ▼
Admin state machine starts (step 1)
     │
     ▼
Step 1: Select Team 1 (keyboard)
Step 2: Select Team 2 (keyboard)
Step 3: Select Venue (keyboard)
Step 4: Enter date
Step 5: Select predicted winner
Step 6: Select toss winner
Step 7: Select confidence level
Step 8: Enter key player
     │
     ▼
Prediction saved to MongoDB
     │
     ▼
Admin receives confirmation
```

---

## Database Design

### Collection: `users`

```
{
  _id: ObjectId,
  telegramId: 123456789,      // Indexed, unique
  username: "john_doe",
  chatId: 123456789,
  isPaid: false,
  subscriptionExpiry: null,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### Collection: `predictions`

```
{
  _id: ObjectId,
  matchId: "CSK_MI_2026_01",  // Indexed, unique
  team1: "CSK",
  team2: "MI",
  venue: "Chennai",
  date: ISODate,
  active: true,
  premiumPrediction: {
    winner: "CSK",
    tossWinner: "MI",
    keyPlayer: "MS Dhoni",
    confidence: "90%"
  },
  freeAnalysis: { ... },
  adminId: 8795510349,
  createdAt: ISODate
}
```

### Collection: `payments`

```
{
  _id: ObjectId,
  telegramUserId: 123456789,
  predictionId: "CSK_MI_2026_01",
  razorpayOrderId: "order_xxx",
  razorpayPaymentId: "pay_xxx",
  amount: 4900,
  currency: "INR",
  status: "verified",
  createdAt: ISODate
}
```

---

## Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Runtime | Node.js | v16+ | Server-side JavaScript |
| Web Framework | Express.js | 4.18 | HTTP server, routing |
| Bot Framework | Telegraf | 4.16 | Telegram bot SDK |
| Database | MongoDB | 7 | Document storage |
| ODM | Mongoose | 7.5 | MongoDB modeling |
| Payments | Razorpay | 2.9 | Payment processing |
| HTTP Client | Axios | 1.5 | External API calls |
| Date Handling | Moment.js | 2.29 | Date formatting |
| Config | dotenv | 16.3 | Environment variables |

---

## Security Architecture

### Authentication & Authorization

| Layer | Mechanism |
|-------|-----------|
| Admin commands | Telegram User ID check |
| Payment webhooks | HMAC-SHA256 signature |
| Database | MongoDB Atlas authentication |
| Bot | Telegram Bot Token |

### Data Protection

- Secrets stored in `.env` (never committed to git)
- `.env` is in `.gitignore`
- Payment amounts server-verified (not client-side)
- Razorpay webhook signatures validated before processing

### Attack Prevention

- No user input executed as code
- Mongoose ODM prevents NoSQL injection
- Express.js middleware validates content-type
- Admin operations require exact user ID match
