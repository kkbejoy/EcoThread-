const express = require('express');
const router = express.Router();
const userHelpers = require('../helpers/userHelpers');
const session_check = require('../middleware/sessionHandling');
const producthelper = require('../helpers/producthelpers');
const user_controller = require('../controllers/userControllers');
const { Message } = require('twilio/lib/twiml/MessagingResponse');
const { UserContextImpl } = require('twilio/lib/rest/conversations/v1/user');
const cartController = require('../controllers/cartControllers');

//Cart Rendering
router.get('/', session_check.userChecking, cartController.cartPageRendering);
//Cart Quantity modification
router.post('/changeproductquantity', cartController.changeProductQuantity);

//Add to cart request
router.get('/addtocart/:id',  cartController.addToCart);

//Remove products from cart
router.get(
  '/removeitem/:id',
  session_check.userChecking,
  cartController.removeProductFromCart
);

// Payment Mode selection To Cart Data
router.post('/paymentmethodtocart',  session_check.userChecking,cartController.paymentmethodtocart);

//Coupon Verification route
router.post('/verifycoupon', session_check.userChecking, cartController.couponVerification);

module.exports = router;
