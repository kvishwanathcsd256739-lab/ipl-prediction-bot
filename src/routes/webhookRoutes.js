const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { verifyPayment } = require('../utils/razorpay');

router.post('/razorpay', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      return res.status(400).json({ status: 'failed' });
    }

    const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    // Update user (you'll need to find user by order ID from Payment model)
    
    console.log('✅ Payment verified');
    return res.json({ status: 'success' });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ status: 'error' });
  }
});

module.exports = router;