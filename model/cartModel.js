const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
        min: 1,
      },
      subTotal:Number,
    },
  ],
  shippingAddress:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'address'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'EMI', 'Card Payment'],
      default: 'COD'
    },
  totalPrice: Number,
  razorpayPaymentId:String,
  couponApplied: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
    unique:false
      },
  discountedPrice:Number

});


module.exports = mongoose.model('Cart', cartSchema);
