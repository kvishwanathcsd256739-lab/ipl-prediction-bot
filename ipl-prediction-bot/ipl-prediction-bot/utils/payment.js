const QRCode = require('qrcode');
const crypto = require('crypto');

/**
 * Generate UPI payment QR code
 */
async function generatePaymentQR(amount, transactionId, upiId, name) {
  try {
    // UPI payment string format
    const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${encodeURIComponent('IPL Premium ' + transactionId)}`;
    
    // Generate QR code as buffer
    const qrBuffer = await QRCode.toBuffer(upiString, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 400,
      margin: 2
    });
    
    return qrBuffer;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

/**
 * Generate unique transaction ID
 */
function generateTransactionId() {
  return 'IPL' + crypto.randomBytes(6).toString('hex').toUpperCase();
}

/**
 * Generate UPI payment link (for manual payment)
 */
function generateUPILink(amount, transactionId, upiId, name) {
  return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${encodeURIComponent('IPL Premium ' + transactionId)}`;
}

module.exports = {
  generatePaymentQR,
  generateTransactionId,
  generateUPILink
};
