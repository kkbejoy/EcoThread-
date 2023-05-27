// var collection = require('../config/collection')
var db = require('../config/connection');
// const bcrypt=require('bcrypt')
const { LongWithoutOverridesClass } = require('bson');
const { resolve, reject } = require('promise');
// const { response } = require('../app')

var objectId = require('mongodb').ObjectId;
const productSchema = require('../model/productModel');
const categorySchema = require('../model/categoryModel');
const couponSchema=require('../helpers/couponHelpers')
const cartSchema = require('../model/cartModel');
const orderSchema = require('../model/orderModel');
const couponHelper = require('../helpers/couponHelpers');
const { response } = require('express');





//Products list inside cart

const getCartDetails = async (userId) => {
  try {
    const cart = await cartSchema
      .find({ user: userId })
      .populate({
        path: 'products.product',
        select: 'name price productImages description _id quantity',
      }).populate('couponApplied')
      .lean();
     
    return cart;
  } catch (error) {
    // console.error("From GetCartDetails:",error);
    throw error;
  }
};

// //Unncecessary, can be done in front end
// const cartSubtotal = async (cartId) => {
//   try{
//     const subTotal = await cartSchema.findById(cartId).then((cart) => {
//       const productsArray = cart.products;
//       const subTotal = productsArray.map();
//     })
//   }catch(error){
//     console.log(error)
//   }
 
// };

//Adding payement Mode to cart
const paymentModeSelectionToCart = async (userId, paymentMethod) => {
  try {
    const result = await cartSchema.updateOne(
      { user: userId },
      { $set: { paymentMethod: paymentMethod } }
    );
    if (result.nModified === 0) {
      // console.log('Payment mode additiion failed');
      // throw new Error(`Cart not found or shipping address already set`);
    }
    // console.log('Payment mode Selected');
  } catch (error) {
    // console.error(error);
    throw new Error(`Error adding Payment method `);
  }
};

//Total amount from cart
const cartTotalAmount = async (userId) => {
  const cart = await cartSchema
    .findOne({ user: userId })
    .populate('products.product')
    .lean();
  if (!cart) {
    // console.log('Empty cart');
    throw new Error('Cart not found for user ' + userId);
  }
  let totalPrice = 0;
  cart.products.forEach((item) => {
    totalPrice += item.product.price * item.quantity;
  });
  // console.log(totalPrice);
  return totalPrice;
};

//Cart Products Data
const cartProductArray = async (userId) => {
  try {
    let products;
    await cartSchema.findOne({ user: userId }).then((cart) => {
      products = cart.products;
    });
    if (!products) {
      reject();
    }
    return products;
  } catch (error) {
    // console.log(error);
    return;
  }
};

// Modify Product quantity in cart
const modifyProductQuantity = async (
  cartId,
  productId,
  incrementAmount,
  currentValue
) => {
  try {
    if (incrementAmount == -1 && currentValue <= 1) {
      cartSchema
        .updateOne(
          { _id: objectId(cartId) },
          {
            $pull: { products: { product: { $in: [objectId(productId)] } } },
          }
        )
        .then((response) => {
          // console.log(response);
          resolve({ removeProduct: true });
        });
    } else {
      const result = await cartSchema.updateOne(
        { _id: cartId, 'products.product': productId },
        { $inc: { 'products.$.quantity': incrementAmount } }
      );
      resolve({ success: true, message: 'Cart updated successfully' });
      // console.log(result);
      // if (result.nModified === 0) {
      //     reject ({ success: false, message: 'Cart or product not found' });
      //   }

      //   resolve({ success: true, message: 'Cart updated successfully' }) ;
    }
  } catch (error) {
    // console.error(error);
    reject({
      success: false,
      message: 'An error occurred while updating the cart',
    });
  }
};

//Remove product from cart
const removeProductFromCart = async (userId, productId) => {
  try {
    // console.log(objectId(productId));
    const result = await cartSchema.updateOne(
      { user: userId },
      { $pull: { products: { product: objectId(productId) } } }
    );
    // console.log(result);
    if (result.modifiedCount === 0) {
      throw new Error('Product not found inside the cart');
    }
    return result;
  } catch (error) {
    // console.log(error);
    return error;
  }
};




//Cart Payment method Information
const cartPaymentMethod = async (userId) => {
  try {
    let PaymentMethod;
    await cartSchema.findOne({ user: userId }).then((cart) => {
      PaymentMethod = cart.paymentMethod;
    });

    return PaymentMethod;
  } catch (error) {
    // console.log(error);
  }
};

//Address retrieval from cart
const getAddressfromCartCol = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let shippingAddressId;
      await cartSchema.find({ user: userId }).then((cart) => {
        // console.log(cart);
        shippingAddressId = cart[0].shippingAddress;
      });
      // console.log("Shipping address id:"+ shippingAddressId )
      if (!shippingAddressId) {
        // console.log('No address found');
        reject();
      }
      resolve(shippingAddressId);
    } catch (error) {
      // console.log(error);
      reject(error);
    }
  });
};


//Delete Cart

const deleteCart = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      await cartSchema.deleteOne({ user: userId }).then((status) => {
        // console.log('from cart deleting');
        // console.log(status);
      });
      resolve();
    } catch (error) {
      // console.log(error);
      reject(error);
    }
  });
};

//New Discounted Price Calculator Function
const cartDiscountedPrice = async (couponCode, userId) => {
  try {
    const discountPercentage = await couponHelper.couponDiscount(couponCode);
    const couponMaxDiscountAmount = await couponHelper.maxRedeemableAmount(couponCode);
    const minAmountReqToUseCoupon = await couponHelper.minAmountReqToUseCoupon(couponCode);
    const actualCartPrice = await cartTotalAmount(userId);
    const discountAmount = (actualCartPrice * discountPercentage) / 100;
    let discountedPrice = actualCartPrice;
    // console.log(discountPercentage, actualCartPrice);
    if (actualCartPrice < minAmountReqToUseCoupon) {
      return discountedPrice;
    }
    if (discountAmount > couponMaxDiscountAmount) {
      discountedPrice = actualCartPrice - couponMaxDiscountAmount;
    } else {
      discountedPrice = actualCartPrice - discountAmount;
    }
    // console.log('Discounted Price:' + discountedPrice);
    return discountedPrice;
  } catch (error) {
    // console.log(error);
    throw error;
  }
};


//Adding discounted price to Cart
const DiscountPriceToCart = async (discountedPrice, userId) => {
  try {
    // console.log('Hello from DiscountPriceToCart ');
    await cartSchema
      .updateOne(
        { user: userId },
        {
          $set: {
            discountedPrice: discountedPrice,
          },
        }
      )
      .then((response) => {
        // console.log(response);
      })
      .catch((error) => {
        // console.log(error);
      });
  } catch (error) {
    // console.log(error);
    throw error;
  }
};

//Adding applied coupon code to Cart
const couponAppliedIdToCart = async (userId, couponCode) => {
  try {
    const couponId=await couponSchema.couponIdFromCode(couponCode);
    // console.log("Coupon Id:"+couponId);
    await cartSchema
      .updateOne(
        { user: userId },
        {
          $set: {
            couponApplied: couponId,
          },
        }
      )
      .then((response) => {
        // console.log(response);
        // console.log('Coupon Id added to cart');
      })
      .catch((error) => {
        // console.log(error);
        throw new Error('Error adding');
      });
  } catch (error) {
    // console.log(error);
  }
};


//RazorPay Id to cart
const razorpayIdToCart = async (userId, razorpayPayMentId) => {
  try {
    // const couponId=await couponSchema.couponIdFromCode(couponCode);
    // console.log("Razor Id:"+razorpayPayMentId);
    await cartSchema
      .updateOne(
        { user: userId },
        {
          $set: {
            razorpayPaymentId: razorpayPayMentId,
          },
        }
      )
      .then((response) => {
        // console.log(response);
        // console.log('RazorPay Id added to cart');
      })
      .catch((error) => {
        // console.log(error);
        throw new Error('Error adding');
      });
  } catch (error) {
    // console.log(error);
  }
};
//Discounted price from cart Database
async function discountedPriceFromCart(userId) {
  try {
    const cart = await cartSchema.findOne({user:userId}).populate('couponApplied');
    // console.log("cart From Discount Helper:"+ cart)
    if (!cart || !cart.couponApplied) {
      return null;
    }
    const couponCode = cart.couponApplied.code;
    // console.log(couponCode);

    let discountPrice=await cartDiscountedPrice(couponCode,userId);
    discountPrice=Math.round(discountPrice)
    return discountPrice
  } catch (error) {
    // console.error(error);
    throw new Error('Failed to retrieve coupon discount percentage');
  }
}

module.exports = {
  getCartDetails,
  cartTotalAmount,
  cartProductArray,
  razorpayIdToCart,
  paymentModeSelectionToCart,
  cartPaymentMethod,
  getAddressfromCartCol,
  deleteCart,
  cartDiscountedPrice,
  DiscountPriceToCart,
  discountedPriceFromCart,
  couponAppliedIdToCart,
  modifyProductQuantity,
  removeProductFromCart
  
};
