require('dotenv').config();
const mongoose = require('mongoose');

console.log('Attempting to connect...');
console.log('URI (password hidden):', process.env.MONGODB_URI.replace(/:[^:]*@/, ':***@'));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });