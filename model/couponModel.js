const mongoose = require('mongoose');
const { isDefined } = require('razorpay/dist/utils/razorpay-utils');
const Schema = mongoose.Schema;

const couponSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  requiredMinPurchaseLimit: {
    type: Number,
    required: true,
  },
  maxRedeemableAmount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    // required: true
  },
  startingDate: {
    type: Date,
    required: true
  },
  expirationDate: {
    type: Date,
    required: true
  },
  usersUsed: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      unique:false
    }
  ],
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
});

couponSchema.pre('save', function(next) {
  const now = Date.now();
  if (this.expirationDate > now && this.startingDate<= now) {
    this.isActive = true;
  } else {
    this.isActive = false;
  }
  next();
});

couponSchema.pre('save', function(next) {
  if (this.code) {
    this.code = this.code.toUpperCase();
  }
  next();
});

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;
