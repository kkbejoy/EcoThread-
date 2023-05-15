const mongoose = require('mongoose');
const { Schema } = mongoose;
const Category=require('./categoryModel')

const productSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    // required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },
  quantity: {
    type: Number,
    required: true
  },
  sizesAvailable: [{
    type: String,
    uppercase:true
  }],
  productImages: [{
    type: String
  }],
  productStatus:{
    type: Boolean,
    default: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
