const { response } = require('../app');
const session = require('express-session');
const { ObjectId } = require('mongodb');
const { resolve, reject } = require('promise');
const razorPayServices = require('../services/razorpay');
const cartHelper = require('../helpers/cartHelpers');
const paymentHelper = require('../helpers/paymentHelpers');
const orderHelper = require('../helpers/Orderhelpers');
const stockManagement = require('../helpers/inventoryMangament');

const createPaymentOrder = async (req, res) => {
  try {
    const user = req.session.user;
    let userId = user._id;
    //Make sure you pass order id too with razopay order id generator
    let totalPrice;
    const discountPrice = await cartHelper.discountedPriceFromCart(userId);
    if (!discountPrice) {
      totalPrice = await cartHelper.cartTotalAmount(userId);
    } else {
      totalPrice = discountPrice;
    }
    // console.log('Total price from payment con:' + totalPrice);
    const order = await razorPayServices.createRazorPayOrder(totalPrice);
    // console.log(order);
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const {
      session: {
        user: { _id: userId },
      },
    } = req;
    // console.log('Payment Response from RazorPay:', req.body);
    await cartHelper.razorpayIdToCart(userId, razorpay_payment_id);

    const expectedSignature = paymentHelper.calculateSignature(
      razorpay_order_id,
      razorpay_payment_id
    );

    if (razorpay_signature === expectedSignature) {
      const payment = await razorPayServices.razorpay.payments.fetch(
        razorpay_payment_id
      );

      // console.log('payment Status:' + payment.status);
      if (payment.status === 'captured') {
        // Payment successful, perform necessary operations here
        // console.log('Payment Captured');

        const cart = await cartHelper.getCartDetails(userId);
        const products = cart[0].products;
        //Checking Stock availability Before Placing order
        const stockStatus = await stockManagement.stockAvailabilityChecker(
          products
        );
        if (stockStatus === 0) {
          // console.log('Stock =0');
          res.status(500).send('Product Unavailable');
          return;
        }

        //Creating Orders
        await orderHelper.createOrder(userId).then(async(status)=>{
          const products=status.products;
          // console.log(products);
          await stockManagement.stockReduction(products);
        });

        //Stock Reduction After SuccessFull order
        // await stockManagement.stockReduction(products);

        //Deleting Cart
        await cartHelper.deleteCart(userId);
        res.json({ success: true });
        // console.log('From payment controller');
      } else {
        // Payment failed, handle accordingly
        // console.log('Payment Failed else case');
        res.status(400).send('Payment failed');
      }
    } else {
      // Signature mismatch, possible fraudulent transaction
      // console.log('Payment Failed 2nd else case');
      res.status(400).send('Fraudulent transaction');
    }
  } catch (error) {
    // console.error(error);
    res.status(500).send('Internal server error');
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
};
