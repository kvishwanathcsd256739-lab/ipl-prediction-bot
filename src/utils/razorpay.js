const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrder = async (amount, userId, username) => {
  try {
    const order = await razorpay.orders.create({
      amount: amount,
      currency: 'INR',
      receipt: `user_${userId}_${Date.now()}`,
      notes: {
        user_id: userId,
        username: username,
      },
    });

    console.log('✅ Order created:', order.id);
    return order;
  } catch (error) {
    console.error('❌ Order creation error:', error);
    return null;
  }
};

const verifyPayment = (orderId, paymentId, signature) => {
  try {
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === signature;
    if (isValid) {
      console.log('✅ Payment signature verified:', paymentId);
    } else {
      console.log('❌ Invalid signature for payment:', paymentId);
    }
    return isValid;
  } catch (error) {
    console.error('❌ Verification error:', error);
    return false;
  }
};

module.exports = {
  razorpay,
  createOrder,
  verifyPayment,
};