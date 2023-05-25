const userHelper = require('../helpers/userHelpers');
const producthelper = require('../helpers/producthelpers');
const otp_api = require('../middleware/twilioOtp');
const { response } = require('../app');
const session = require('express-session');
const { ObjectId } = require('mongodb');
const { resolve, reject } = require('promise');
const addressModel = require('../model/addressModel');
const cartSchema = require('../model/cartModel');
const productSchema = require('../model/productModel');
const cartHelper = require('../helpers/cartHelpers');
const orderHelper = require('../helpers/Orderhelpers');
const couponsHelpers = require('../helpers/couponHelpers');
const { cartTotalAmount } = require('../helpers/cartHelpers');
const { paginatedResults } = require('../middleware/paginatedResults');
const razorPayServices = require('../services/razorpay');
const stockManagement = require('../helpers/inventoryMangament');

// HomePage rendering

const homePageRendering = async (req, res, next) => {
  try {
    const banners = await producthelper.bannerDetails();
    const products = await producthelper.getAllActiveProducts();
    if (req.session.user) {
      var loggedInStatus = true;
      var {
        session: { user: user },
      } = req;
      var loggedInUser = user.name;
      // console.log(loggedInUser)
      // generate a unique ID with 5 characters

      res.render('homepage', { user: true, loggedInUser, products, banners });
    } else {
      res.render('homepage', { user: true, products, banners });
    }
  } catch (err) {
    res.render('error', { user: true });
    next(err);
  }
};

//Sign-IN Page Rendeirng
const signInPage = (req, res) => {
  try {
    res.render('user/userlogin', { user: true });
  } catch (error) {
    res.render('error', { user: true });
  }
};

//Sign In Page Post
const signInPost = async (req, res) => {
  try {
    await userHelper
      .UserLogIn(req.body)
      .then((response) => {
        req.session.loggedIn = true;
        req.session.user = response.validuser;
        console.log(req.session.user);
        res.redirect('/');
      })
      .catch((error) => {
        console.log('Login failed');
        res.render('user/userlogin', { loginerr: true, user: true });
      });
  } catch (error) {
    res.render('error', { user: true });
  }
};

//user-signUp rendering
const userSignUpPageRendering = (req, res) => {
  try {
    res.render('user/usersignup', { user: true });
  } catch (error) {
    res.render('error', { user: true });
  }
};

//user SignUp page post
const signUpPost = (req, res, next) => {
  try {
    console.log('Hello from signup con');
    // const {name,email,password,phone}=req.body;
    console.log(req.body);
    userHelper
      .Signup(req.body)
      .then((status) => {
        console.log('Status', status);
        res.status(201).json({ success: true, registered: true });
        //res.render('user/usersignup', { registered: true, user: true });
      })
      .catch((error) => {
        let existingUser = error.status;
        console.log('Error', error);
        res.status(500).json({ error: existingUser });
        //res.render('user/usersignup', { existingUser, user: true });
      });
  } catch (error) {
    res.render('error', { user: true });
  }
};

//user Forgot password page rendering
const userForgotPasswordPage = (req, res) => {
  try {
    res.render('user/forgotPassword', { user: true });
  } catch (error) {
    res.render('error', { user: true });
  }
};

//user Forgot password post method
const userForgotPassword = (req, res, next) => {
  try {
    let email = req.body.email;
    let newPassword = req.body.newPassword;
    userHelper
      .passwordReset(email, newPassword)
      .then((response) => {
        console.log(response);
        res.render('user/userlogin', { user: true, success: true }); // success message has to be displayed in the login page
      })
      .catch((err) => {
        console.log(err);
        res.render('user/forgotPassword', { fail: true });
      });
  } catch (error) {
    res.render('error', { user: true });
  }
};

//User detials updation
const updateUserDetails = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    let {
      session: {
        user: { _id: userId },
      },
    } = req;
    const userUpdatedDetails = {};
    if (name) userUpdatedDetails.name = name;
    if (email) userUpdatedDetails.email = email;
    if (phone) userUpdatedDetails.phone = phone;

    console.log(userUpdatedDetails);
    userId = ObjectId(userId);
    console.log(userId);
    await userHelper
      .updateUserDetails(userId, userUpdatedDetails)
      .then((response) => {
        console.log('Res from con ' + response);
        res.status(200).json({ message: 'Address updated successfully.' });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({ message: 'Failed to update Address' });
        throw new Error('Error updating user details');
      });
  } catch (error) {
    res.render('error', { user: true });
  }
};

//User Log-Out
const userLogOut = (req, res, next) => {
  try {
    req.session.loggedIn = false;
    req.session.user = null;
    res.redirect('/');
  } catch (error) {
    res.render('error', { user: true });
  }
};
// OTP login using twilio api page rendering
const OtpLogin = (req, res) => {
  try {
    res.render('user/otpLogin', {
      otpLoginErr: req.session.otpLoginErr,
      user_header: true,
      user: true,
    });
    req.session.otpLoginErr = false;
  } catch (error) {
    res.render('error', { user: true });
  }
};

// OTP login using twilio api Post
const postOtpLogin = (req, res) => {
  try {
    userHelper
      .findUserByMob(req.body.mobile)
      .then((user) => {
        otp_api.send_otp(user.phone).then((status) => {
          req.session.otpStatus = 'OTP sent successfully ';
          req.session.mobile = req.body.mobile;
          // console.log(status);
          otpVerify(req, res);
        });
      })
      .catch((err) => {
        req.session.otpLoginErr = 'Invalid phone number';
        console.log(err);
        res.redirect('/otplogin');
      });
  } catch (error) {
    res.render('error', { user: true });
  }
};

// verfying otp entering page rendering
const otpVerify = (req, res) => {
  try {
    res.render('user/otpverify', {
      otpStatus: req.session.otpStatus,
      otpErr: req.session.otpErr,
      user: true,
    });
    req.session.otpStatus = false;
    req.session.otpErr = false;
  } catch (error) {
    res.render('error', { user: true });
  }
};

// veriying for the user and giving access
const postOtpVerify = async (req, res) => {
  try {
    let mobile = req.session.mobile;
    let enteredOtp = req.body.otp;
    let user = await userHelper.findUserByMob(mobile);
    otp_api
      .verifying_otp(mobile, enteredOtp)
      .then((status) => {
        if (status.valid) {
          req.session.user = user;
          res.redirect('/');
        } else {
          console.log('hey2');
          req.session.otpErr = ' OTP does not match';
          res.render('user/otpverify', {
            otpStatus: req.session.otpStatus,
            user: true,
            otpErr: req.session.otpErr,
          });
        }
      })
      .catch((error) => {
        console.log(error);
        res.redirect('/login');
      });
  } catch (error) {
    console.log(error);
    res.render('error', { user: true });
  }
};

//PRODUCTS PAGE

//Products List page rendering

const productsListPageRendering = async (req, res) => {
  try {
    const activeCategories = await producthelper.getAllActiveCategories();

    const productsPaginated = res.paginatedResults;
    console.log('Paginated result:', productsPaginated);
    if (req.session.user) {
      const {
        session: { user: user },
      } = req;
      const loggedInUser = user.name;

      // let totalPrice = await userHelper.cartTotalAmount(userId);

      res.render('user/products', {
        productsPaginated,
        user: true,
        loggedInUser,
        activeCategories,
      });
    } else {
      res.render('user/products', {
        productsPaginated,
        user: true,
        activeCategories,
      });
    }
  } catch (error) {
    console.log(error);
    res.render('error', { user: true });
  }
};

//Products under certain Cateogories only

const productsUnderCategory = async (req, res) => {
  try {
    const { id: categoryId } = req.params;

    // const categoryId=await producthelper.categoryIdFromName(categoryName)
    const activeCategories = await producthelper.getAllActiveCategories();
    await producthelper
      .productUnderCategory(categoryId)
      .then((product) => {
        console.log('Products', product);
        res.render('user/categorywiseProducts', {
          product,
          user: true,
          activeCategories,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (error) {
    console.log(error);
    res.render('error', { user: true });
  }
};

//Product(specific page) rendering

const productPageForEachItem = async (req, res) => {
  try {
    const similarProducts = await producthelper.getAllActiveProducts();
    if (req.session.user) {
      var loggedInStatus = true;
      var {
        session: { user: user },
      } = req;
      const { id: productId } = req.params;
      var loggedInUser = user.name;
      await producthelper.getProductdetails(productId).then((product) => {
        res.render('user/specificProductPage', {
          user: true,
          product,
          loggedInUser,
          similarProducts,
        });
        console.log(product);
      });
    } else {
      const { id: productId } = req.params;
      await producthelper.getProductdetails(productId).then((product) => {
        res.render('user/specificProductPage', {
          user: true,
          product,
          similarProducts,
        });
        console.log(product);
      });
    }
  } catch (error) {
    res.render('error', { user: true });
  }
};

//Product Search
const productSearch = async (req, res) => {
  // const loggedInUser = user.name;

  try {
    let { search: name } = req.query;
    name = name.trim();
    console.log('name:' + name);
    const user = req.session.user;
    let searchResult = await productSchema
      .find({ name: { $regex: new RegExp('^' + name + '.*', 'i') } })
      .limit(10)
      .lean();
    let activeCategories = await producthelper.getAllActiveCategories();
    console.log('Search Result:' + searchResult);
    res.render('user/productSearchResult', {
      user: true,
      searchResult,
      activeCategories,
    });
  } catch (error) {
    res.render('error', { user: true });
  }
};

//WishList Mangement

//Wishlist page rendering
const wishlistPageRendering = async (req, res) => {
  try {
    const {
      session: { user: user },
    } = req;
    const loggedInUser = user.name;
    const userId = user._id;
    const wishlist = await userHelper.wishlistDetails(userId);

    res.render('user/wishlist', { user: true, wishlist, loggedInUser });
  } catch (error) {
    console.log(error);
    res.render('error', { user: true });
  }
};

//Add to WishList
const addToWishlist = async (req, res) => {
  try {
    const {
      session: {
        user: { _id: userId },
      },
      body: { productId: productId },
    } = req;
    console.log('Add to Wishlist ', userId);
    await userHelper
      .addToWishlist(productId, userId)
      .then((response) => {
        res.status(200).send('Added to Wishlist');
      })
      .catch((error) => {
        res.status(500).send('Add to wishlist failed');
      });
  } catch (error) {
    console.log(error);
    res.status(500).send('Operation Failed');
  }
};

//Remove From Wishlist

const removeFromWishlist = async (req, res) => {
  try {
    if (req.body.productId) console.log('1');
    if (req.data) console.log(req.data);
    if (req.body.data) console.log('3');
    const {
      session: {
        user: { _id: userId },
      },
      body: { productId: productId },
    } = req;
    console.log('Hello from user Con delete wishlist', productId, userId);
    await userHelper
      .removeFromWishlist(productId, userId)
      .then((response) => {
        console.log(response);
        res.status(200).send('Removed');
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send('Unable to Remove');

        // throw new Error("Error removing wishlist")
      });
  } catch (error) {
    console.log(error);
    res.status(500).send('Unable to Remove');
  }
};

//Cart Management

//CheckOut Page Renderding
const checkOutPage = async (req, res) => {
  try {
    const user = req.session.user;
    const userId = user._id;
    const loggedInUser = user.name;

    const totalCartPrice = await userHelper.cartTotalAmount(userId);
    const address = await userHelper.getAddressfromAddressCollection(userId);
    const discountPrice =
      (await cartHelper.discountedPriceFromCart(userId)) || 0;
    await cartHelper.getCartDetails(userId).then((cartDetails) => {
      res.render('user/checkOut', {
        user: true,
        cartDetails,
        totalCartPrice,
        address,
        loggedInUser,
        discountPrice,
      });
    });
  } catch (error) {
    //  res.render('/user/userError', { message: 'Order already Placed' });
    console.log(error);
    res.render('error', { user: true });
  }
};

//Payment page rendering- //When the user clicks proceed to Payment Button
const checkOutPost = async (req, res) => {
  try {
    const user = req.session.user;
    let userId = user._id;
    userId = ObjectId(userId);

    console.log(userId);
    let { selectedValue: addressId } = req.body;
    console.log(addressId);
    await userHelper
      .addShippingAddressIdToCart(userId, addressId)
      .then(() => {
        console.log('address id added to cart');
        res.status(200).send({ message: 'Addredd Selected successfully' });
        // res.redirect('back');
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send({ message: 'Addredd Selected failed' });

        // res.redirect('/checkout');
      });
  } catch (error) {
    console.log(error);
    res.render('error', { user: true });
  }
};

//Adding new Address to the Address collections
const addNewAddress = async (req, res) => {
  try {
    const {
      session: {
        user: { _id: userId },
      },
      body: address,
    } = req;
    console.log(userId);
    console.log(req.body);

    address.userId = userId;
    console.log(address);
    await userHelper
      .addNewAddress(address)
      .then((address) => {
        console.log('address id added to cart: ' + address);
        res.redirect('back');
        // return res.send({
        //   success: true,
        //   message: 'Address added successfully',
        // });
      })
      .catch((err) => {
        console.log(err);
        res.redirect('back');

        // return res
        //   .status(500)
        //   .json({ success: false, message: 'Failed to add address' });
      });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to add address' });
  }
};

// Address Editing page rendering

const editAddressPageRendering = async (req, res) => {
  try {
    const { id: addressId } = req.params;
    const {
      session: { user: user },
    } = req;
    const loggedInUser = user.name;

    res.render('user/editAddress', {
      user: true,
      loggedInUser,
      userAccount: true,
      addressId,
    });
  } catch (error) {
    console.log(error);
    res.render('error', { user: true });
  }
};

//Deleteting address from address collection

const deleteAddress = async (req, res) => {
  try {
    console.log(req.params);
    const { id: addressId } = req.params;
    console.log(addressId);
    await userHelper
      .deleteAddress(addressId)
      .then((response) => {
        console.log(response);
        return res.json({
          success: true,
          message: 'Address Deleted successfully',
        });
      })
      .catch((error) => {
        throw new Error('Error');
      });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to delete address' });
  }
};

//Updating Existing Address

const updateAddress = async (req, res) => {
  try {
    const { id: addressId } = req.params;
    console.log('req.body:' + JSON.stringify(req.body));
    const {
      name,
      houseNo,
      street,
      city,
      district,
      state,
      country,
      pinCode,
      phone,
      email,
    } = req.body;

    const updatedFields = {};

    if (name) updatedFields.name = name;
    if (houseNo) updatedFields.houseNo = houseNo;
    if (street) updatedFields.street = street;
    if (city) updatedFields.city = city;
    if (district) updatedFields.district = district;
    if (state) updatedFields.state = state;
    if (country) updatedFields.country = country;
    if (pinCode) updatedFields.pinCode = pinCode;
    if (phone) updatedFields.phone = phone;
    if (email) updatedFields.email = email;
    console.log(addressId);
    await userHelper
      .updateAddress(addressId, updatedFields)
      .then((address) => {
        console.log('address:' + address);
        res.status(200).json({ message: 'Address updated successfully.' });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ error: 'Failed to update address.' });
      });
  } catch (error) {
    console.log(error);
    res.render('error', { user: true });
  }
};
//unknown function
const addAddressFromDatabase = async (req, res) => {
  try {
    const user = req.session.user;
    let userId = user._id;
    userId = ObjectId(userId);

    console.log(userId);
    let address = req.body;
    address.userId = userId;
    await userHelper.addAddressFromCheckOut(address).then((addressId) => {
      console.log('address doc created with id ' + addressId);
      res.redirect('/checkout');
    });
  } catch (error) {
    console.log(errror);
    res.render('error', { user: true });
  }
};

//User Profile Page Rendering
const userProfilePageRendering = async (req, res) => {
  try {
    const {
      session: { user: user },
    } = req;
    const loggedInUser = user.name;
    const userId = user._id;
    await userHelper.getUserdetails(userId).then((userDetails) => {
      res.render('user/profileOverview', {
        userDetails,
        loggedInUser,
        user: true,
        userAccount: true,
      });
    });
  } catch (err) {
    console.log(err);
    res.render('error');
  }
};
//Order page rendering
const orderPage = async (req, res) => {
  try {
    const user = req.session.user;
    let userId = user._id;
    const loggedInUser = user.name;
    // console.log(res.paginatedResults)
    await userHelper
      .orderDetails(userId)
      .then((orderDetails) => {
        console.log('order page');
        res.render('user/orders', {
          user: true,
          userAccount: true,
          orderDetails,
          loggedInUser,
        });
      })
      .catch((error) => {
        console.log(error);
        throw new Error('Order Page is currently unavailable');
      });
  } catch (error) {
    res.render('error', { user: true });
  }
};

//Order Detaial page rendering
const orderDetailPage = async (req, res) => {
  try {
    const user = req.session.user;
    let userId = user._id;
    const loggedInUser = user.name;
    const {
      params: { id: orderId },
    } = req;
   let paymentStatus="Returned";
    await orderHelper
      .orderDetailsOfThisId(orderId)
      .then(async (orderDetails) => {
        
        if (orderDetails.PaymentMethod == 'Card Payment'){
           paymentStatus= await razorPayServices.checkPaymentStatus(
            orderDetails.razorpayPaymentId
          );
          paymentStatus=paymentStatus.status;
        }
        console.log('order page:' + orderDetails ,"PaymentStatus",paymentStatus);
        
        res.render('user/orderDetail', {
          user: true,
          userAccount: true,
          loggedInUser,
          orderDetails,
          paymentStatus,
        });
      })
      .catch((error) => {
        console.log(error);
        throw new Error('Order Page is currently unavailable');
      });
  } catch (error) {
    res.render('error', { user: true });
  }
};

//Order Return Request

const returnRequest = async (req, res) => {
  try {
    const {
      params: { id: orderId },
    } = req;
    console.log(orderId);
    await orderHelper.requestReturnOrder(orderId);
    res.redirect('back');
  } catch (error) {
    console.log(error);
    res.render('error', { user: true });
  }
};
//Saved Address Page rendering

const savedAddressesPageRendering = async (req, res) => {
  try {
    const {
      session: { user: user },
    } = req;
    const loggedInUser = user.name;
    const userId = user._id;
    await userHelper
      .getAddressfromAddressCollection(userId)
      .then((addresses) => {
        console.log('Saved Addresses:', addresses);
        res.render('user/savedAddress', {
          user: true,
          userAccount: true,
          loggedInUser,
          addresses,
        });
      });
  } catch (error) {
    console.log(error);
    res.render('error', { user: true });
  }
};

//Payment selection page rendering

const paymentSelectionPage = async (req, res) => {
  // const user = req.session.user;
  // const userId = user._id;
  // const address=await getAddressfromAddressCollection(userId)
  try {
    res.render('user/prePayment', { user: true });
  } catch (errro) {
    res.render('error', { user: true });
  }
};

//Create Order- UseLess COde
const createOrder = async (req, res) => {
  const user = req.session.user;
  const userId = user._id;
  await orderHelper
    .createOrder(userId)
    .then((status) => {
      console.log('Order Status:', status);
      userHelper.deleteCart(userId).then(() => {
        res.redirect('/orders');
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

//UseLess COde
const orderCancelation = async (req, res) => {
  try {
    const {
      params: { id: orderId },
    } = req;
    const orders = await orderHelper.orderDetailsOfThisId(orderId);
    const amount = orders.totalPrice;
    const razorpayPaymentId = orders.razorpayPaymentId;
    console.log(
      'Order Details to RazorPay',
      amount,
      razorpayPaymentId,
      orderId
    );
    if (razorpayPaymentId) {
      await razorPayServices.initiateRazorPayRefund(
        razorpayPaymentId,
        amount,
        orderId
      );
    }
    await userHelper.orderCancelation(orderId).then(async () => {
      const products = orders.products;
      await stockManagement.stockAddition(products);
      res.redirect('back');
    });
  } catch (error) {
    console.log(error);
  }
};

//Sample Page rendering
const trailPageRendering = async (req, res) => {
  try {
    // const user = req.session.user;
    // let userId = user._id;
    // const loggedInUser = user.name;
    // await userHelper
    //   .orderDetails(userId)
    //   .then((orderDetails) => {
    //     console.log('order page');
    res.render('user/sample', {
      user: true,
    });
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     throw new Error('Order Page is currently unavailable');
    //   });
    // // const nonDeletedUsers=await userHelper.nonDeletedUsers();
    // console.log('trail page renderin');
  } catch (error) {
    console.log(error);
    res.render('error');
  }
};

module.exports = {
  homePageRendering,
  signInPost,
  signInPage,
  signUpPost,
  userSignUpPageRendering,
  userForgotPasswordPage,
  userForgotPassword,
  updateUserDetails,
  userLogOut,
  OtpLogin,
  postOtpLogin,
  otpVerify,
  postOtpVerify,
  productPageForEachItem,
  productsListPageRendering,
  productsUnderCategory,
  productSearch,
  wishlistPageRendering,
  addToWishlist,
  removeFromWishlist,
  checkOutPage,
  addNewAddress,
  editAddressPageRendering,
  updateAddress,
  addAddressFromDatabase,
  checkOutPost,
  userProfilePageRendering,
  savedAddressesPageRendering,
  deleteAddress,
  orderPage,
  orderDetailPage,
  returnRequest,
  paymentSelectionPage,
  createOrder,
  orderCancelation,
  trailPageRendering,
};
