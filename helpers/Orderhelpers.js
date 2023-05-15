var collection = require('../config/collection');
var db = require('../config/connection');
const { ObjectId } = require('mongoose');

// const bcrypt=require('bcrypt')
const { LongWithoutOverridesClass } = require('bson');
const { resolve, reject } = require('promise');
// const { response } = require('../app')

var objectId = require('mongodb').ObjectId;
const productSchema = require('../model/productModel');
const categorySchema = require('../model/categoryModel');
const cartSchema = require('../model/cartModel');
const orderSchema = require('../model/orderModel');
const cartHelper = require('../helpers/cartHelpers');
const razorPayServices = require('../services/razorpay');
require = require('esm')(module);
const { nanoid } = require('nanoid');
const { response } = require('express');



// Order Creation -CASH ON DELIVERY & CARD PAYMENT
const createOrder =  (userId) => {
  return new Promise(async(resolve, reject) => {
  try {
    let newOrder;

    //Unique order id Creation
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 100000); // generate a random number between 0 and 99999
    const year = new Date().getFullYear().toString().slice(-2); // get the last two digits of the current year
    const uniqueId = nanoid(5); // generate a unique ID with 5 characters
    const orderId = year + timestamp + random + uniqueId;

    const cartDetails=await cartHelper.getCartDetails(userId);
    const totalPrice = await cartHelper.cartTotalAmount(userId);
    const products = await cartHelper.cartProductArray(userId);
    const paymentMethod = await cartHelper.cartPaymentMethod(userId);
    const discountPrice = await cartHelper.discountedPriceFromCart(userId);
    // console.log('Discounted Price from user helper: ' + discountPrice);
    // console.log('Payment method from user helper: ' + paymentMethod);
    // console.log('CreateOrders helpers:' + products);
    const shippingAddressId = await cartHelper.getAddressfromCartCol(userId);
    const razorpayId=await cartDetails[0].razorpayPaymentId;
    console.log("razorpay id from order helper",razorpayId)

    let order;

    if (!discountPrice) {
      order = {
        customer: userId,
        orderId: orderId,
        products: products,
        totalPrice: totalPrice,
        deliveryAddress: shippingAddressId,
        PaymentMethod: paymentMethod,
        
      };
    } else {
      order = {
        customer: userId,
        orderId: orderId,
        products: products,
        totalPrice: discountPrice,
        deliveryAddress: shippingAddressId,
        PaymentMethod: paymentMethod,
      };
    }
    if(razorpayId){
      console.log(razorpayId)

      order.razorpayPaymentId=razorpayId;
    } 

    newOrder = new orderSchema(order);
    try {
      await newOrder.save().then((status)=>{
        console.log("Saving Status:",status)
        console.log('Order placed successfully!');
       resolve(status)
      });
      
      
    } catch (err) {
      console.error(err);
    }
  } catch (error) {
    console.log(error);
    return;
  }
})
};

//Return Order Request from User side

const requestReturnOrder=async(orderId)=>{
  try{
    await orderSchema.findByIdAndUpdate({_id:orderId},
    {
      $set:{
        returnRequested:true
      } 
    } ).then((response)=>{
      console.log(response);
    }).catch((error)=>{
      console.log(error)
    })

  }catch(error){
    throw error;
  }
}

//Accept Return request from admin Side

const acceptReturn=async(orderId)=>{
  return new Promise(async(resolve,reject)=>{
    try{
      await orderSchema.findByIdAndUpdate({_id:orderId},
        {
          $set:{
            orderStatus:"Returned"
          }
        }).then((response)=>{
          // console.log("Response From Order Retrun accept",response)
          resolve(response) ;
        }).catch((error)=>{
          console.log(error);
          throw new Error("Operation failed")
        })
    }catch(error){
        console.log(error);
        throw error;
    }
  }
  )}


//Order Page rendering in Admin side
const orderDetails = async () => {
  const orderDetails = await orderSchema
    .find()
    .populate('customer deliveryAddress')
    .populate({
      path: 'products.product',
      select: 'name price ',
    })
    .sort({ dateCreated: -1 })
    .lean();
  if (!orderDetails) {
    throw new Error('Nothing inside order list');
  }
  return orderDetails;
};

// Admin order Status modification
const orderStatusModification = async (orderId, modification) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await orderSchema.updateOne(
        { _id: objectId(orderId) },
        {
          $set: {
            orderStatus: modification,
          },
        }
      );
      console.log(response);
      resolve(response);
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

//Single order Details to Order Page

const orderDetailsOfThisId = async (orderId) => {
  try {
    orderId = objectId(orderId);
    console.log(orderId);
    const orderDetails = await orderSchema
      .findById(orderId)
      .populate('customer')
      .populate('deliveryAddress')
      .populate({
        path: 'products.product',
        select: 'name price productImages description',
      })
      .lean();
    if (!orderDetails) {
      throw new Error('Nothing inside order list');
    }
    return orderDetails;
  } catch (err) {
    throw err;
  }
};

//Refff

module.exports = {
  createOrder,
  requestReturnOrder,
  acceptReturn,
  orderDetails,
  orderDetailsOfThisId,
  orderStatusModification,
  
};
