const express = require('express');
const router = express.Router();
const userHelpers = require('../helpers/userHelpers');
const session_check = require('../middleware/sessionHandling');
const producthelper = require('../helpers/producthelpers');
const user_controller = require('../controllers/userControllers');
const { Message } = require('twilio/lib/twiml/MessagingResponse');
const { UserContextImpl } = require('twilio/lib/rest/conversations/v1/user');
const orderController = require('../controllers/orderControllers');
const { paginatedResults } = require('../middleware/paginatedResults');
const orderSchema = require('../model/orderModel');
const productSchema = require('../model/productModel');

// import { Router } from 'express';
// import { session_check } from '../middleware/sessionHandling';
// import * as userHelpers from '../helpers/userHelpers';
// import * as producthelper from '../helpers/producthelpers';
// import * as user_controller from '../controllers/userControllers';
// const router = Router();

// router.use(session_check);

//Home Page rendering Route
router.get('/',session_check.userHomePageAuthCheck, user_controller.homePageRendering),
  //Login Page rendering
  router.get(
    '/login',
    session_check.authenticationCheck,
    user_controller.signInPage
  ),
  //Login Post
  router.post('/login', user_controller.signInPost);


//Prodct rendering page
router.get('/products', session_check.userHomePageAuthCheck,paginatedResults(productSchema),user_controller.productsListPageRendering);

//Products under specific categories
router.get('/products/:id',session_check.userHomePageAuthCheck, user_controller.productsUnderCategory);

router.get('/productsfiltered',session_check.userHomePageAuthCheck, user_controller.fileteredProductPageRendering);

//Specific product page rendering
router.get('/product/:id',session_check.userHomePageAuthCheck, user_controller.productPageForEachItem);


//Product Search
router.get('/productsearch',session_check.userHomePageAuthCheck,user_controller.productSearch);


//Wishlist
//Wishlist page rendering
router.route('/wishlist')
.get(user_controller.wishlistPageRendering)
.post(user_controller.addToWishlist)
.delete(user_controller.removeFromWishlist);

// OTP login using mobile number..
router
  .route('/otplogin')
  .get(session_check.authenticationCheck, user_controller.OtpLogin)
  .post(user_controller.postOtpLogin);

// sending OTP to registered mobile number...
// get method has to be deleted otherwise anyone can direclty enter into the verifcation pag eand the app crashes.
router
  .route('/otpverify')
  .get(user_controller.otpVerify)
  .post(user_controller.postOtpVerify);

//SignUp page rendering
router.get(
  '/signup',
  session_check.authenticationCheck,
  user_controller.userSignUpPageRendering
),
  //SignUp page Post
  router.post('/signup', user_controller.signUpPost),
  //Forgot Password page rendering
  router.get('/passwordreset', user_controller.userForgotPasswordPage);

//Forgot Password post method
router.post('/passwordreset', user_controller.userForgotPassword);


//Check-Out Page
//CheckOut Page rendering
router.get(
  '/checkout',
  session_check.userChecking,
  user_controller.checkOutPage
);

//Add New Address From checkOut Page
router.post(
  '/addnewaddressfromcheckout',
  session_check.userChecking,
  user_controller.addNewAddress
);

//CheckOut page post link to add address id to the cart
router.post(
  '/addaddressidtocart',
  session_check.userChecking,
  user_controller.checkOutPost
);

//prE-Payment page rendering
// router.get('/checkout/payment',  session_check.userChecking,
// user_controller.paymentSelectionPage);

//OrderConfirmation link
router.get('/checkout/confirm-cod-order',  session_check.userChecking,
orderController.createCodOrder);

//Order Cancelation from user side
router.get('/cancelorder/:id',  session_check.userChecking,
user_controller.orderCancelation);

//Order Return Request
router.get('/requestreturn/:id',  session_check.userChecking,
user_controller.returnRequest)

//User Profile Section
//Profile Overview Page rendering
router.get('/profile',   session_check.userChecking,
user_controller.userProfilePageRendering);

//Orders Page Rendering
router.get('/orders', session_check.userChecking, user_controller.orderPage);

//Order Detail Page rendering
router.get('/orderdetails/:id', session_check.userChecking, user_controller.orderDetailPage);


//Saved addresses of users
router.get('/savedaddress',  session_check.userChecking,
user_controller.savedAddressesPageRendering);

//Add New Address
router.post('/addnewaddress',  session_check.userChecking,
user_controller.addNewAddress);

//Edit Address- 
router.get('/editaddress/:id',  session_check.userChecking,
user_controller.editAddressPageRendering);

//Update Address from user Profle
router.patch('/updateaddress/:id',  session_check.userChecking,
user_controller.updateAddress);

//Update user details from user side
router.patch('/updateuserdetails',  session_check.userChecking,
user_controller.updateUserDetails);

//Delete Address document
router.delete('/deleteaddress/:id',  session_check.userChecking,
user_controller.deleteAddress);


// User Logout
router.get('/logout', user_controller.userLogOut);


//trail page for sample HBS
router.get('/trail',user_controller.trailPageRendering)

module.exports = router;
