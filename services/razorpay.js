const Razorpay = require('razorpay');

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

//RazorPay Order Creation
const createRazorPayOrder = (totalAmount) => {
  return new Promise((resolve, reject) => {
    const options = {
      amount: totalAmount * 100,
      currency: 'INR',
      // receipt: `${orderId}`,
      payment_capture: 1,
    };
    razorpay.orders.create(options, function (err, order) {
      if (err) {
        console.log(err);
      } else {
        // console.log(order.receipt+" this is it");
        resolve(order);
      }
    });
  });
};

//RazorPay Refund Function
const initiateRazorPayRefund = (paymentId, refundAmount, orderId) => {
  console.log('Refund razorpay');
  const refundData = {
    amount: refundAmount * 100,
    speed: 'normal',
   
    receipt: orderId,
  };

  razorpay.payments.refund(paymentId, refundData, function (err, refund) {
    if (err) {
      console.error(err);
      return;
    }

    // Check the refund status
    const refundStatus = refund.status;
    if (refundStatus === 'processed') {
      console.log('Refund processed successfully');
    } else {
      console.log('Refund processing failed');
    }
  });
};

//Payment Status Checking
const checkPaymentStatus=async(paymentId)=>{
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('Error retrieving payment status:', error);
    throw error;
  }
}

module.exports = {
  createRazorPayOrder,
  initiateRazorPayRefund,
  checkPaymentStatus,
  razorpay,
};
