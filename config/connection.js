
const mongoose = require('mongoose');
require('dotenv').config();
// const Admin= require('../model/adminModel');
// const Category=require('../model/categoryModel');

const password=encodeURIComponent("g6OVlaCQYE0Wznja")
const username=encodeURIComponent("ecoThread")
const userSchema= require('../model/userModel');
const uri = process.env.MONGO_URI;

mongoose.connect(uri,
    { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () { console.log('Connection to MongoDB established successfully!'); });
module.exports = db; 


// const user = new userSchema({
//     email: 'kkbejo1y@ymail.com',
//     password: '123',
//     name: 'Bejoy',
//     // phone:'9400822788'
//   });
  
//   user.save().then((user)=>{
//     console.log('user added successfully')
//   })
//   .catch((error)=>{
//     console.log(error);
//   });

// const newCategory = new Category({
//     name: 'trail',
//     description:'hello'
//   });
  
//   newCategory.save().then((cat)=>{
//     console.log('Category added successfully')
//   })
//   .catch((error)=>{
//     console.log(error);
//   });
    
  
  module.exports = db; 