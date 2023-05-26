const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  orderId:{
    type:String,
    unique:true
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
  }],
  totalPrice:Number,
  deliveryAddress:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'address'
  },
  PaymentMethod: {
    type: String,
    enum: ['COD', 'EMI', 'Card Payment'],
    default: 'COD'
  },
  razorpayPaymentId:String,
  orderStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered','Cancelled','Returned'],
    default: 'Pending'
  },
  couponApplied: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
    
      },
  returnRequested:{
    type:Boolean,
    default:false
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    },
  dateCreated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
