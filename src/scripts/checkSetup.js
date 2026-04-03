require('dotenv').config();
const mongoose = require('mongoose');

console.log('\n🔍 IPL Prediction Bot - Setup Verification\n');
console.log('━'.repeat(50));

let errors = 0;
let warnings = 0;

// Check Node version
console.log('\n📦 Node.js Version:');
const nodeVersion = process.version;
console.log(`   Current: ${nodeVersion}`);
if (parseInt(nodeVersion.split('.')[0].substring(1)) < 18) {
  console.log('   ❌ ERROR: Node.js version must be 18 or higher');
  errors++;
} else {
  console.log('   ✅ Node.js version OK');
}

// Check environment variables
console.log('\n🔐 Environment Variables:');

const requiredVars = [
  'TELEGRAM_BOT_TOKEN',
  'ADMIN_USER_ID',
  'MONGODB_URI',
  'UPI_ID',
  'UPI_NAME',
  'PAYMENT_AMOUNT'
];

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value === `your_${varName.toLowerCase()}`) {
    console.log(`   ❌ ${varName}: Not set or using default value`);
    errors++;
  } else {
    // Mask sensitive values
    let displayValue = value;
    if (varName === 'TELEGRAM_BOT_TOKEN') {
      displayValue = value.substring(0, 10) + '...' + value.substring(value.length - 5);
    } else if (varName === 'ADMIN_USER_ID') {
      displayValue = value;
    }
    console.log(`   ✅ ${varName}: ${displayValue}`);
  }
});

// Validate bot token format
console.log('\n🤖 Telegram Bot Token:');
const token = process.env.TELEGRAM_BOT_TOKEN;
if (token && token.match(/^\d+:[A-Za-z0-9_-]+$/)) {
  console.log('   ✅ Token format looks valid');
} else {
  console.log('   ❌ Token format invalid (should be: 123456:ABC-DEF...)');
  errors++;
}

// Validate admin user ID
console.log('\n👤 Admin User ID:');
const adminId = process.env.ADMIN_USER_ID;
if (adminId && !isNaN(adminId)) {
  console.log('   ✅ Admin ID is numeric');
} else {
  console.log('   ❌ Admin ID must be a number');
  errors++;
}

// Test MongoDB connection
console.log('\n💾 MongoDB Connection:');
async function testMongoDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log('   ✅ MongoDB connection successful');
    await mongoose.disconnect();
  } catch (error) {
    console.log('   ❌ MongoDB connection failed:', error.message);
    errors++;
  }
}

// Check UPI details
console.log('\n💳 Payment Configuration:');
const upiId = process.env.UPI_ID;
const upiName = process.env.UPI_NAME;
if (upiId && upiId.includes('@')) {
  console.log(`   ✅ UPI ID: ${upiId}`);
} else {
  console.log('   ❌ UPI ID format invalid (should be: name@bank)');
  warnings++;
}
if (upiName && upiName.length > 2) {
  console.log(`   ✅ UPI Name: ${upiName}`);
} else {
  console.log('   ❌ UPI Name looks too short');
  warnings++;
}

// Check payment amount
const amount = process.env.PAYMENT_AMOUNT;
if (amount && !isNaN(amount) && parseInt(amount) > 0) {
  console.log(`   ✅ Payment Amount: ₹${amount}`);
} else {
  console.log('   ⚠️  Payment amount not set or invalid');
  warnings++;
}

// Run MongoDB test
testMongoDB().then(() => {
  // Summary
  console.log('\n━'.repeat(50));
  console.log('\n📊 Summary:');
  console.log(`   Errors: ${errors}`);
  console.log(`   Warnings: ${warnings}`);

  if (errors === 0 && warnings === 0) {
    console.log('\n✅ All checks passed! Your bot is ready to run.');
    console.log('\n🚀 Start your bot with: npm start\n');
  } else if (errors === 0) {
    console.log('\n⚠️  Setup OK but has warnings. Bot should work.');
    console.log('   Fix warnings for best experience.\n');
  } else {
    console.log('\n❌ Setup has errors. Please fix them before running bot.\n');
    console.log('📖 Check .env.example and README.md for help.\n');
  }

  process.exit(errors > 0 ? 1 : 0);
});
