# 📚 Examples & Customization Guide

## Adding Predictions - Examples

### Example 1: Basic Prediction

**Command:** `/addprediction`

**Step 1 - Teams and Date:**
```
CSK vs RCB, 15-04-2026
```

**Step 2 - Premium Prediction:**
```
Winner: CSK
Toss: RCB
Key Player: MS Dhoni
Confidence: 85
Notes: CSK has strong spin attack and plays well at home
```

**Step 3:** `/save`

---

### Example 2: Detailed Prediction

**Command:** `/addprediction`

**Step 1:**
```
MI vs DC, 16-04-2026
```

**Step 2:**
```
Winner: MI
Toss: MI
Key Player: Rohit Sharma
Confidence: 75
Notes: MI's pace attack will be effective on this pitch. Rohit is in great form.
```

**Step 3:** `/save`

---

### Example 3: Close Match

**Command:** `/addprediction`

**Step 1:**
```
KKR vs SRH, 17-04-2026
```

**Step 2:**
```
Winner: KKR
Toss: SRH
Key Player: Andre Russell
Confidence: 60
Notes: Very close match. Toss will be crucial. Russell's form is the X-factor.
```

**Step 3:** `/save`

---

## Customization Examples

### 1. Change Welcome Message

**File:** `controllers/userController.js`

**Find:** `sendWelcome()` function

**Customize:**
```javascript
const message = `🏏 *Welcome to YOUR BOT NAME!*\n\n` +
               `Hi ${user.firstName}! Your custom welcome message here.\n\n` +
               // ... rest of message
```

---

### 2. Change Payment Amount

**File:** `.env`

```env
PAYMENT_AMOUNT=99  # Change from 49 to 99
```

**File:** `utils/messages.js` (optional - for custom text)

**Find:** `formatFreeAnalysis()` function

**Change:**
```javascript
message += `💰 Pay ₹${process.env.PAYMENT_AMOUNT || 99} to unlock Premium Prediction\n`;
```

---

### 3. Add Weekly Subscription Feature

**File:** `controllers/userController.js`

**Add new function:**
```javascript
async initiateWeeklyPayment(chatId, userId) {
  const weeklyPrice = 299; // 7 days for ₹299
  const transactionId = generateTransactionId();
  
  const qrBuffer = await generatePaymentQR(
    weeklyPrice,
    transactionId + '-WEEKLY',
    process.env.UPI_ID,
    process.env.UPI_NAME
  );
  
  const message = `📅 *WEEKLY SUBSCRIPTION*\n\n` +
                 `💰 Amount: ₹${weeklyPrice}\n` +
                 `⏰ Duration: 7 days\n` +
                 `✅ Access to ALL matches for 1 week!\n\n`;
  
  // ... rest of payment flow
}
```

---

### 4. Customize Free Analysis Format

**File:** `utils/messages.js`

**Find:** `formatFreeAnalysis()` function

**Example - Add emojis:**
```javascript
message += `⭐ *STAR PLAYERS TO WATCH*\n`;
freeAnalysis.starPlayers.forEach((player, index) => {
  const emoji = index === 0 ? '🌟' : '⭐';
  message += `${emoji} ${player}\n`;
});
```

---

### 5. Add Match Result Tracking

**Create new model:** `models/MatchResult.js`

```javascript
const resultSchema = new mongoose.Schema({
  predictionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prediction'
  },
  actualWinner: String,
  actualTossWinner: String,
  predictionCorrect: Boolean,
  matchDate: Date
});

module.exports = mongoose.model('MatchResult', resultSchema);
```

**Add admin command:**
```javascript
bot.onText(/\/addresult/, async (msg) => {
  // Add match result and calculate accuracy
});
```

---

### 6. Custom Payment Gateway Integration

**Example: Razorpay Integration**

**Install:**
```bash
npm install razorpay
```

**File:** `utils/payment.js`

**Add:**
```javascript
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

async function createRazorpayOrder(amount) {
  const options = {
    amount: amount * 100, // amount in paise
    currency: "INR",
    receipt: generateTransactionId()
  };
  
  return await razorpay.orders.create(options);
}
```

---

### 7. Add Multiple Languages

**Create:** `utils/languages.js`

```javascript
const messages = {
  en: {
    welcome: "Welcome to IPL Prediction Bot!",
    todayMatch: "Today's Match",
    // ... more messages
  },
  hi: {
    welcome: "आईपीएल प्रेडिक्शन बॉट में आपका स्वागत है!",
    todayMatch: "आज का मैच",
    // ... more messages
  }
};

function getMessage(key, lang = 'en') {
  return messages[lang][key] || messages.en[key];
}
```

---

### 8. Add Push Notifications

**File:** `controllers/userController.js`

**Add function:**
```javascript
async sendMatchReminder(predictionId) {
  const prediction = await Prediction.findById(predictionId);
  const users = await User.find({ 'payments.predictionId': predictionId });
  
  const message = `⏰ *Match Reminder*\n\n` +
                 `${prediction.team1} vs ${prediction.team2}\n` +
                 `Starting in 1 hour!\n\n` +
                 `Your prediction: ${prediction.premium.winner} to win! 🏆`;
  
  for (const user of users) {
    try {
      await this.bot.sendMessage(user.telegramId, message, {
        parse_mode: 'Markdown'
      });
    } catch (error) {
      console.error(`Failed to send reminder to ${user.telegramId}`);
    }
  }
}
```

---

### 9. Analytics Dashboard Data

**Create:** `utils/analytics.js`

```javascript
async function getBotAnalytics() {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({
    'stats.lastActive': { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  });
  
  const totalRevenue = await User.aggregate([
    { $unwind: '$payments' },
    { $match: { 'payments.verified': true } },
    { $group: { _id: null, total: { $sum: '$payments.amount' } } }
  ]);
  
  return {
    totalUsers,
    activeUsers,
    revenue: totalRevenue[0]?.total || 0,
    conversionRate: (activeUsers / totalUsers * 100).toFixed(2)
  };
}
```

---

### 10. Custom Admin Commands

**Example: Broadcast Message to All Users**

**File:** `controllers/adminController.js`

**Add:**
```javascript
async broadcastMessage(chatId, userId, message) {
  if (!this.isAdmin(userId)) return;
  
  const users = await User.find({});
  let sent = 0;
  
  for (const user of users) {
    try {
      await this.bot.sendMessage(user.telegramId, message, {
        parse_mode: 'Markdown'
      });
      sent++;
    } catch (error) {
      console.error(`Failed to send to ${user.telegramId}`);
    }
  }
  
  await this.bot.sendMessage(chatId, 
    `✅ Broadcast sent to ${sent} users`
  );
}
```

**Add command in bot.js:**
```javascript
bot.onText(/\/broadcast (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const message = match[1];
  
  await adminController.broadcastMessage(chatId, userId, message);
});
```

---

## Testing Examples

### Test User Flow
1. Create test user account (different phone number)
2. Send `/start`
3. Send `/today`
4. Try payment flow
5. Verify as admin
6. Check premium prediction access

### Test Admin Flow
1. Send `/addprediction`
2. Add complete prediction
3. Send `/predictions` to verify
4. Send `/stats` to check analytics

### Test Payment Flow
1. Initiate payment as user
2. Don't actually pay
3. Check payment expiry (30 minutes)
4. Try again with verification

---

## Common Customizations

### Change Bot Personality
- Edit messages in `utils/messages.js`
- Use different emojis
- Change tone (formal/casual/fun)

### Add More Stats
- Extend `freeAnalysis` object in Prediction model
- Update `formatFreeAnalysis()` to display new stats
- Add fields in admin prediction flow

### Improve Payment System
- Integrate automated payment verification
- Add multiple payment methods
- Implement refund system

---

## Pro Tips

1. **Backup Database Daily**
   ```bash
   mongodump --db ipl_prediction_bot --out ./backups/$(date +%Y%m%d)
   ```

2. **Monitor Bot Performance**
   - Use PM2 for process management
   - Set up error logging
   - Track response times

3. **User Engagement**
   - Send daily match reminders
   - Offer special discounts
   - Run prediction accuracy contests

4. **Security**
   - Regularly rotate bot token
   - Keep admin commands restricted
   - Validate all user inputs

---

**Need more help?** Check README.md for detailed documentation!
