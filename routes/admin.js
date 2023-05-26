const { query } = require('express');
const express = require('express');
const { response } = require('../app');
const producthelpers = require('../helpers/producthelpers');
const router = express.Router();
const userHelpers = require('../helpers/userHelpers');
const session_check = require('../middleware/sessionHandling');
const multer = require('../middleware/multer');
const path = require('path');
const adminControllers = require('../controllers/adminControllers');
const { paginatedResults } = require('../middleware/paginatedResults');
const orderSchema = require('../model/orderModel');
const productSchema = require('../model/productModel');


//ADMIN Root ROUTE
router.get('/', (req, res) => {
  res.redirect('/admin/login');
});

//Dashboard route
router.get(
  '/dashboard',
  session_check.checkingAdmin,
  adminControllers.dashboardRendering
),
  //ADMIN AUTHENTICATION
  router.get(
    '/login',
    session_check.adminAuthenticationCheckLogIn,
    adminControllers.adminLogInPageRendering
  );

//Admin Login Credentials Authenticaton
router.post('/login', adminControllers.adminLoginValidation);

//PRODUCT ROUTES

//Prouct DISPLAY
router.get(
  '/viewproducts',
  session_check.checkingAdmin,
  paginatedResults(productSchema),
  adminControllers.productListPageRendering
);

//Product Search
router.get(
  '/productsearch',
  session_check.checkingAdmin,
  adminControllers.productSearch
);

//Product Addition page
router.get(
  '/addproducts',
  session_check.checkingAdmin,
  adminControllers.productAdditionPageRendering
);

//Product Addition Data to server
router.post(
  '/addproducts',
  session_check.checkingAdmin,
  multer.upload.array('productImages'),
  adminControllers.productAdditionToDB
);

//Product UPDATION page
router.get(
  '/updateproduct/:id',
  // session_check.checkingAdmin,
  adminControllers.productUpdationPageRendering
);

//Product UPDATION Data to the server
router.post(
  '/updateproduct/:id',
  // session_check.checkingAdmin,
  multer.uploadBanner.array('productImages'),
  adminControllers.productUpdationToDB
);

//Product DELETION
router.get(
  '/deleteproduct/:id',
  session_check.checkingAdmin,
  adminControllers.productDeletion
);

//Product Image Deleting
router.delete('/deleteimage', adminControllers.imageDeletion);

//CATEGORY MANAGEMENT SECTION
// category page rendering
router.get(
  '/category',
  session_check.checkingAdmin,
  adminControllers.categoryPageRendering
);

// category data to database:
router.post(
  '/category',
  session_check.checkingAdmin,
  adminControllers.newCatogoryAddition
);

// // List and Unlist category:
// router.get(
//   '/categorylisting/:id',
//   session_check.checkingAdmin,
//   adminControllers.categoryListingAndUnlisting
// );

//Category status Modification -Listing and Unlisting
router.post(
  '/categorylisting/:id',
  session_check.checkingAdmin,
  adminControllers.categoryStatusAlteration
);

//Banner Management

//Banner Addition page rendering
router
  .route('/banner')
  .get(adminControllers.bannerPage)
  .post(multer.uploadBanner.array('banner'), adminControllers.bannerToDb);

//USER SECTION

//User List Page rendering
router.get(
  '/viewusers',
  session_check.checkingAdmin,
  adminControllers.usersListPageRendering
);

//Deleted users List

router.get(
  '/viewdeletedusers',
  session_check.checkingAdmin,
  adminControllers.deletedUsersListPageRendering
);

//User Addition get and post route
router.get('/adduser', session_check.checkingAdmin, (req, res) => {
  res.render('admin/adduser', { admin: true, adminin: true });
});

//This feature is unncessary..
//User Addition data to server
router.post('/adduser', session_check.checkingAdmin, (req, res) => {
  console.log(req.body);
  userHelpers
    .addUsers(req.body)
    .then((result) => {
      console.log(result);
      res.redirect('/admin/adduser');
    })
    .catch((err) => {
      console.log(err);
      let existingUser = user.status;
      res.render('admin/adduser', { admin: true, existingUser, adminin: true });
    });
});

//User Update page
router.get(
  '/updateuser/:id',
  session_check.checkingAdmin,
  adminControllers.userDetailsUpdatePageRendering
);

//User update data to server and database operations
router.post(
  '/updateuser/:id',
  session_check.checkingAdmin,
  adminControllers.updateUserDetailsToDatatabase
);

//User access modification
router.get(
  '/useraccess/:id',
  session_check.checkingAdmin,
  adminControllers.userAccessModification
);

//Users deletion
router.delete(
  '/userdelete/:id',
  session_check.checkingAdmin,
  adminControllers.userDeletion
);

//Order Page rendering
router.get(
  '/orders',
  session_check.checkingAdmin,
  paginatedResults(orderSchema),
  adminControllers.orderDetails
);

//Order Status modification
router.post(
  '/orderstatusmodification/:id',
  session_check.checkingAdmin,
  adminControllers.orderStatusModification
);

//Return Request Accepting
router.get('/acceptreturnrequest/:id', adminControllers.acceptRetunRequest);
//Order-Details page
router.get(
  '/orderdetails/:id',
  session_check.checkingAdmin,
  adminControllers.orderDetailsOfThisId
);

//Sales report
router.get('/sales-report', adminControllers.salesReportPageRendering);

//Sales Report Download

router.get('/sales-report-download', adminControllers.salesReportPrint);
//Coupons page rendering
router.get(
  '/coupons',
  session_check.checkingAdmin,
  adminControllers.couponPageRendering
);

//Coupon Addition
router.post(
  '/newcouponaddition',
  session_check.checkingAdmin,
  adminControllers.couponAddition
);

//Coupon Deletion
router.delete(
  '/deletecoupon',
  session_check.checkingAdmin,
  adminControllers.deleteCoupon
);

//trail purposes only

router
  // .route('/trails')
  //  .get(('/trails'), adminControllers.trailPageRendering)
  .post(
    '/trails',
    (req, res) => {
      console.log('Hello from Trails');
      next();
    },
    multer.uploadBanner.array('productImages'),
    adminControllers.trail
  );

router.get('/trails', adminControllers.trailPageRendering);
//admin Log-Out
router.get('/logout', (req, res, next) => {
  req.session.loggedInad = false;
  req.session.admin = null;
  res.redirect('/admin');
}),
  (module.exports = router);
