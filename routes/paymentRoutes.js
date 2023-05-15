const express = require('express');
const router = express.Router();


const paymentControllers = require('../controllers/paymentControllers');


// Razorpay Order generating route
router.get('/create-razororder', paymentControllers.createPaymentOrder);

//Razorpay Payment Verification
router.post('/verifypayment', paymentControllers.verifyPayment)

module.exports = router;
