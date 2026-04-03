const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Payment = require('../models/payment');
const { verifyPayment } = require('../utils/razorpay');

router.post('/razorpay', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ status: 'failed', message: 'Missing required fields' });
    }

    if (!verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      return res.status(400).json({ status: 'failed', message: 'Invalid signature' });
    }

    // Find the pending payment record by order ID
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id, status: 'pending' },
      {
        razorpayPaymentId: razorpay_payment_id,
        status: 'completed',
        verifiedAt: new Date(),
      },
      { new: true }
    );

    if (!payment) {
      console.warn('⚠️ Payment record not found for order:', razorpay_order_id);
      return res.status(404).json({ status: 'failed', message: 'Payment record not found' });
    }

    // Activate premium access for the user
    const subscriptionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await User.findOneAndUpdate(
      { telegramId: payment.telegramId },
      {
        isPaid: true,
        subscriptionExpiry,
        updatedAt: new Date(),
      }
    );

    console.log(`✅ Payment verified for user ${payment.telegramId}: ${razorpay_payment_id}`);
    return res.json({ status: 'success' });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ status: 'error' });
  }
});

module.exports = router;
