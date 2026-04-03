const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Payment = require('../models/payment');
const { verifyPayment } = require('../utils/razorpay');

router.post('/razorpay', async (req, res) => {
  try {
    // Sanitize all user-provided values to plain strings
    const orderId = String(req.body.razorpay_order_id || '').trim();
    const paymentId = String(req.body.razorpay_payment_id || '').trim();
    const signature = String(req.body.razorpay_signature || '').trim();

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ status: 'failed', message: 'Missing required fields' });
    }

    if (!verifyPayment(orderId, paymentId, signature)) {
      return res.status(400).json({ status: 'failed', message: 'Invalid signature' });
    }

    // Find the payment record by order ID
    const payment = await Payment.findOne({ razorpayOrderId: orderId });

    if (!payment) {
      console.warn('⚠️ Payment record not found for order:', orderId);
      return res.status(404).json({ status: 'failed', message: 'Payment record not found' });
    }

    // Idempotency: already processed
    if (payment.status === 'completed') {
      return res.json({ status: 'success' });
    }

    // Mark payment as completed
    await Payment.findByIdAndUpdate(payment._id, {
      razorpayPaymentId: paymentId,
      status: 'completed',
      verifiedAt: new Date(),
    });

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

    console.log(`✅ Payment verified for user ${payment.telegramId}: ${paymentId}`);
    return res.json({ status: 'success' });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ status: 'error' });
  }
});

module.exports = router;

