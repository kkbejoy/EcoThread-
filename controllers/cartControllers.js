const userHelper = require('../helpers/userHelpers');
const producthelper = require('../helpers/producthelpers');
const cartHelper = require('../helpers/cartHelpers');
const otp_api = require('../middleware/twilioOtp');
const { response } = require('../app');
const session = require('express-session');
const { ObjectId } = require('mongodb');
const { resolve, reject } = require('promise');
const addressModel = require('../model/addressModel');
const cartSchema = require('../model/cartModel');
const couponHelper = require('../helpers/couponHelpers');

//Cart Page rendering

const cartPageRendering = async (req, res) => {
  try {
    const user = req.session.user;
    const userId = user._id;
    const loggedInUser = user.name;
    let totalPrice = await cartHelper.cartTotalAmount(userId);
    let cartDetails = await cartHelper.getCartDetails(userId);
    // let  couponId;
    // if( cartDetails.couponApplied){
    //   couponId=cartDetails.couponApplied;
    // }
    const discountPrice =
      (await cartHelper.discountedPriceFromCart(userId)) || 0;
    const couponsAvailable = await couponHelper.filteredCoupons(totalPrice);
    console.log('discountPrice from Cart controllers:' + discountPrice);
    console.log('Coupons Appliede:' + cartDetails);

    res.render('user/cart', {
      cartDetails,
      totalPrice,
      discountPrice,
      couponsAvailable,
      user: true,
      loggedInUser,
    });
  } catch (error) {
    console.log(error);
    res.render('user/userError', {
      user: true,
      emptyCart: true,
      message: 'Cart is Empty',
    });
  }
};

//Add to cart
const addToCart = (req, res) => {
  try {
    if (!req.session.user) {
      throw new Error(' Please Log IN');
    }
    const {
      session: {
        user: { _id: userId },
      },
    } = req;
    const { params: productId } = req;
    if (userId) {
      userHelper
        .addToCart(userId, productId)
        .then(() => {
          // const referer = req.headers.referer || '/cart';
          // res.redirect(referer);
          res.json({
            success: true,
            message: 'Product added to cart successfully',
          });
        })
        .catch((error) => {
          res
            .status(500)
            .json({
              success: false,
              message: 'Failed to add product to cart',
              error: error,
            });
        });
    } else {
      res.status(401).json({ success: false, message: 'Unauthorized user' });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: 'Internal server error', error: error });
  }
};
//Remove from cart
const removeProductFromCart = (req, res) => {
  try {
    const {
      params: { id: productId },
      session: { user: user },
    } = req;
    const userId = user._id.toString();
    console.log(productId);
    cartHelper
      .removeProductFromCart(userId, productId)
      .then(() => {
        res.redirect('/cart');
      })
      .catch((error) => {
        console.log(error);
        res.redirect('/cart');
      });
  } catch (error) {
    console.log(error);
  }
};

//Payment Method addition to Cart
const paymentmethodtocart = async (req, res) => {
  try {
    const user = req.session.user;
    let userId = user._id;
    userId = ObjectId(userId);
    console.log(userId);
    const { selectedValue: paymentMethod } = req.body;
    await cartHelper
      .paymentModeSelectionToCart(userId, paymentMethod)
      .then(() => {
        res.status(200).send('Payment method selected successfully');
      });
  } catch (error) {
    console.error(error);
    res.status(500).send('Payment method selection Failed');
  }
};

// Coupon verification and Modifications in coupon document and Discounted Price
const couponVerification = async (req, res) => {
  try {
    let {
      body: { couponEntred: couponEntered },
    } = req;
    const {
      session: {
        user: { _id: userId },
      },
    } = req;
    couponEntered = couponEntered.trim();
    const couponExistence = await couponHelper.verifyCouponCode(couponEntered); //True or False
    const couponUsedByUser = await couponHelper.couponUsedByUser(
      couponEntered,
      userId
    );
    //True or False
    if (couponExistence && !couponUsedByUser) {
      console.log('Coupon valid');
      const discountPrice = await cartHelper.cartDiscountedPrice(
        couponEntered,
        userId
      );
      await cartHelper.couponAppliedIdToCart(userId, couponEntered); //Coupon code is passed inside this function
      // await cartHelper.DiscountPriceToCart(discountPrice, userId);
      await couponHelper.couponUsersUsed(couponEntered, userId);
      res.status(200).send('Coupon Valid');
    } else {
      res.status(500).send('Coupon invalid');
    }
  } catch (error) {
    console.log(error);
  }
};

//Change product Quantity
const changeProductQuantity = (req, res) => {
  // console.log('controller');
  let { cartId, productId, userId, inc, quantity } = req.body;
  userId = ObjectId(userId);
  productId = ObjectId(productId);
  cartId = ObjectId(cartId);
  console.log(productId);

  cartHelper
    .modifyProductQuantity(cartId, productId, inc, quantity)
    .then(async (response) => {
      const newQty = await userHelper.cartProductQuantity(cartId, productId);
      console.log('New Qty' + newQty);
      //  const totalPrice= await userHelper.cartTotalAmount(userId);
      // response["newQty"] = newQty;
      // response["totalPrice"] = totalPrice;
      console.log(response);
      res.json({
        status: 'success',
        message: 'Cart updated successfully.',
        newQty,
        response,
      });
    })
    .catch((err) => {
      console.log(err);
      reject();
    });
};

module.exports = {
  cartPageRendering,
  addToCart,
  removeProductFromCart,
  paymentmethodtocart,
  couponVerification,
  changeProductQuantity,
};
