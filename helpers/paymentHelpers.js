
const crypto = require('crypto');

const calculateSignature = (orderId, paymentId) => {
  // console.log("orderId:" + orderId)
  // console.log("orderId:" + paymentId)

    const secret = process.env.RAZORPAY_KEY_SECRET ; // Replace with your webhook secret
    // console.log("secret:" + secret)
    const data = orderId + '|' + paymentId;
    const hash = crypto.createHmac('sha256', secret).update(data).digest('hex');
    return hash;
  };

  module.exports={
    calculateSignature
  }