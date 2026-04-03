const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🔧 IPL Prediction Bot - Interactive Setup\n');
console.log('━'.repeat(50));
console.log('\nThis wizard will help you create your .env file.');
console.log('Press Enter to skip optional fields.\n');

const config = {};

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function setup() {
  try {
    // Bot Token
    console.log('\n📱 TELEGRAM BOT SETUP');
    console.log('━'.repeat(50));
    console.log('Get your bot token from @BotFather on Telegram.');
    console.log('Steps: /newbot → choose name → choose username → copy token\n');
    
    config.TELEGRAM_BOT_TOKEN = await ask('Enter your Telegram Bot Token: ');
    if (!config.TELEGRAM_BOT_TOKEN) {
      console.log('❌ Bot token is required!');
      process.exit(1);
    }

    // Admin User ID
    console.log('\n👤 ADMIN SETUP');
    console.log('━'.repeat(50));
    console.log('Get your Telegram User ID from @userinfobot\n');
    
    config.ADMIN_USER_ID = await ask('Enter your Telegram User ID: ');
    if (!config.ADMIN_USER_ID || isNaN(config.ADMIN_USER_ID)) {
      console.log('❌ Valid admin user ID is required!');
      process.exit(1);
    }

    // MongoDB
    console.log('\n💾 DATABASE SETUP');
    console.log('━'.repeat(50));
    console.log('Options:');
    console.log('1. Local MongoDB: mongodb://localhost:27017/ipl_prediction_bot');
    console.log('2. MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/dbname\n');
    
    const dbChoice = await ask('Use local MongoDB? (y/n) [y]: ');
    if (dbChoice.toLowerCase() === 'n' || dbChoice.toLowerCase() === 'no') {
      config.MONGODB_URI = await ask('Enter MongoDB connection string: ');
    } else {
      config.MONGODB_URI = 'mongodb://localhost:27017/ipl_prediction_bot';
    }

    // Payment
    console.log('\n💳 PAYMENT SETUP');
    console.log('━'.repeat(50));
    console.log('Enter your UPI details for receiving payments.\n');
    
    config.UPI_ID = await ask('Enter your UPI ID (e.g., yourname@paytm): ');
    if (!config.UPI_ID) {
      console.log('⚠️  Warning: UPI ID not set. Payments will not work.');
      config.UPI_ID = 'yourname@paytm';
    }

    config.UPI_NAME = await ask('Enter your name for UPI payments: ');
    if (!config.UPI_NAME) {
      config.UPI_NAME = 'Your Name';
    }

    const amount = await ask('Enter premium prediction price in ₹ [49]: ');
    config.PAYMENT_AMOUNT = amount || '49';

    config.WEEKLY_PRICE = await ask('Enter weekly subscription price in ₹ [299]: ') || '299';

    // Session timeout
    config.SESSION_TIMEOUT = '3600000';

    // Create .env file
    console.log('\n📝 Creating .env file...');
    
    let envContent = `# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=${config.TELEGRAM_BOT_TOKEN}
ADMIN_USER_ID=${config.ADMIN_USER_ID}

# Database Configuration
MONGODB_URI=${config.MONGODB_URI}

# Payment Configuration (UPI)
UPI_ID=${config.UPI_ID}
UPI_NAME=${config.UPI_NAME}
PAYMENT_AMOUNT=${config.PAYMENT_AMOUNT}

# Bot Settings
PREMIUM_PRICE=${config.PAYMENT_AMOUNT}
WEEKLY_PRICE=${config.WEEKLY_PRICE}
SESSION_TIMEOUT=${config.SESSION_TIMEOUT}

# Optional: Payment Gateway API (if using automated verification)
# RAZORPAY_KEY_ID=your_razorpay_key
# RAZORPAY_KEY_SECRET=your_razorpay_secret
`;

    fs.writeFileSync('.env', envContent);
    
    console.log('\n✅ .env file created successfully!\n');
    console.log('━'.repeat(50));
    console.log('\n📋 Configuration Summary:');
    console.log(`   Bot Token: ${config.TELEGRAM_BOT_TOKEN.substring(0, 10)}...`);
    console.log(`   Admin ID: ${config.ADMIN_USER_ID}`);
    console.log(`   Database: ${config.MONGODB_URI}`);
    console.log(`   UPI ID: ${config.UPI_ID}`);
    console.log(`   Price: ₹${config.PAYMENT_AMOUNT}`);
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Run: npm run check-setup (verify configuration)');
    console.log('   2. Start MongoDB: mongod');
    console.log('   3. Run: npm start (start the bot)');
    console.log('   4. Open Telegram and search for your bot');
    console.log('   5. Send: /start\n');

  } catch (error) {
    console.error('\n❌ Error during setup:', error.message);
  } finally {
    rl.close();
  }
}

setup();
