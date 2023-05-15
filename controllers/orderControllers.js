
const userHelper = require('../helpers/userHelpers');
const producthelper = require('../helpers/producthelpers');
const otp_api = require('../middleware/twilioOtp');
const { response } = require('../app');
const session = require('express-session');
const { ObjectId } = require('mongodb');
const { resolve, reject } = require('promise');
const addressModel = require('../model/addressModel');
const cartSchema = require('../model/cartModel');
const orderHelper=require('../helpers/Orderhelpers')
const cartHelper=require('../helpers/cartHelpers')
const stockManagement=require('../helpers/inventoryMangament');


//COD Order Creation 
const createCodOrder=async(req,res)=>{
    const user = req.session.user;
    const userId = user._id;

    const cart = await cartHelper.getCartDetails(userId);
    console.log("Cart:",cart)
        const products = cart[0].products;
        //Checking Stock availability Before Placing order
    const stockStatus = await stockManagement.stockAvailabilityChecker(
      products
    );
    if (stockStatus === 0) {
      console.log('Stock =0');
      res.status(500).send('Product Unavailable');
      return;
    }

    await orderHelper.createOrder(userId).then(async(status)=>{
      const products=status.products;
      console.log(products);
      await stockManagement.stockReduction(products);
      cartHelper.deleteCart(userId).then(()=>{
        res.status(200).send('Order success');
        // res.redirect('/orders');
      })
    }). catch((error)=>{
      console.log(error);
    })
  };
  
  // Order Cancellation
  const orderCancelation=async(req,res)=>{
   try{ 
    const {params:{id:orderId}}=req;
   await orderHelper.orderCancelation(orderId).then(()=>{
    res.redirect('/orders')
   })
  }catch(error){
    console.log(error)
  }
  }

  module.exports={
    createCodOrder,
     orderCancelation
  }
  