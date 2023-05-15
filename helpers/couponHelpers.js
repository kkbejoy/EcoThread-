// var collection = require('../config/collection')
var db = require('../config/connection');
// const bcrypt=require('bcrypt')
const { LongWithoutOverridesClass } = require('bson');
const { resolve, reject } = require('promise');
const { response } = require('../app');

var objectId = require('mongodb').ObjectId;
const productSchema = require('../model/productModel');
const categorySchema = require('../model/categoryModel');
const cartSchema = require('../model/cartModel');
const orderSchema = require('../model/orderModel');
const couponSchema = require('../model/couponModel');

//Coupon Addition
const couponAddition = async (couponBody) => {
  try {
    const newCoupon = new couponSchema(couponBody);
    await newCoupon
      .save()
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log('Error:' + error);
        throw new Error('Failed to add coupon');
      });
  } catch (error) {
    console.error('Error adding coupon');
    throw error;
  }
};

//Coupon details Rendering
const couponDetailsFromDataBase = async () => {
  try {
    const coupons = await couponSchema.find().lean();
    return coupons;
  } catch (error) {
    throw error;
  }
};

//Retrieving all coupons
const getAllCoupons = async () => {
  try {
    const coupons = await couponSchema.find().catch((error) => {
      console.log(error);
      throw new Error('Failed Looking into Coupons Database ');
    });
    return coupons;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

//Cart Specific Coupon Filter
const filteredCoupons = (price) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('Price:' + price);
      const coupons = await couponSchema
        .find({
          // $and: [
          //   { requiredMinPurchaseLimit: { $gt: price } },
          //   { isActive: true }
          // ]
        })
        .lean();
      let filteredCoupons = coupons.filter((coupon) => {
        if (coupon.requiredMinPurchaseLimit <= price) {
          return coupon;
        }
      });
      // console.log(filteredCoupons)
      resolve(filteredCoupons);
    } catch (error) {
      console.log(error);
      reject();
    }
  });
};

//Coupon doc Modification- Users used( Linked to cart Helpers )
const couponUsersUsed = async (couponCode, userId) => {
  await couponSchema.updateOne(
    { code: couponCode },
    {
      $push: {
        usersUsed: userId,
      },
    }
  );
};

//Coupon % Extraction Function

const couponDiscount = async (couponCode) => {
  const coupon = await couponSchema.find(
    { code: couponCode },
    'discountPercentage'
  );
  const discountPercentage=coupon[0].discountPercentage;
  console.log("coupon discount percentage: " + discountPercentage);
  return discountPercentage;
};

//Verify coupon code

const verifyCouponCode = (couponCode) => {
  return new Promise(async (resolve, reject) => {
    try {
      const couponFound = await couponSchema.findOne({code:couponCode});
      console.log(couponFound);
      if (couponFound) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  });
};


//Verify this user used the cooupon or not
const couponUsedByUser=async(couponCode,userId)=>{
    const coupon=await couponSchema.findOne({code:couponCode})
   try{
    if(coupon && coupon.usersUsed.includes(userId)){
      console.log("Coupon already used")  
      return(true);
    }
      else{
        return(false)
      }
   } catch(error){
        console.log("Error retrieving coupon")
        console.log(error);
      }
      
    }


 //Coupon Id retriving using coupon Code
 
 const couponIdFromCode=async(couponCode)=>{
  try{
    const coupon= await couponSchema.findOne({code:couponCode});
    couponId=coupon._id;
    return couponId;
  }catch(error){
    throw error;
  }

 }

 //Max Redeemable amount for a  coupon

 const maxRedeemableAmount=async (couponCode) => {
  const coupon = await couponSchema.find(
    { code: couponCode },
    'maxRedeemableAmount'
  );
  const maxRedeemableAmount=coupon[0].maxRedeemableAmount;
  console.log("coupon max alloweded discount amount: " + maxRedeemableAmount);
  return maxRedeemableAmount;
};
//Minimum amount required to use coupon
const minAmountReqToUseCoupon=async (couponCode) => {
  const coupon = await couponSchema.find(
    { code: couponCode },
    'requiredMinPurchaseLimit'
  );
  const minAmountReqToUseCoupon=coupon[0].requiredMinPurchaseLimit;
  console.log("Min Discount amount required: " + minAmountReqToUseCoupon);
  return minAmountReqToUseCoupon;
};

 const deleteCoupon=async(couponId)=>{
    try{
      await couponSchema.deleteOne({_id:couponId}).then((response)=>{
        console.log(response);
      }).catch((error)=>{
        console.log(error)
        });
      }catch(error){
      console.log(error);
    }
 }

module.exports = {
  couponAddition,
  couponDetailsFromDataBase,
  getAllCoupons,
  filteredCoupons,
  couponUsersUsed,
  couponDiscount,
  verifyCouponCode,
  couponUsedByUser,
  couponIdFromCode,
  maxRedeemableAmount,
  minAmountReqToUseCoupon,
  deleteCoupon
};
