var collection = require('../config/collection');
var db = require('../config/connection');
const bcrypt = require('bcrypt');
const { LongWithoutOverridesClass } = require('bson');
const { resolve, reject } = require('promise');
// const { response } = require('../app');
const adminSchema = require('../model/adminModel');
const userSchema = require('../model/userModel');
const cartSchema = require('../model/cartModel');
const productSchema = require('../model/productModel');
const orderSchema = require('../model/orderModel');
const addressSchema = require('../model/addressModel');
const WishlistSchema = require('../model/wishlistModel');
const orderHelper = require('../helpers/Orderhelpers');
const cartHelper = require('../helpers/cartHelpers');
const { response } = require('express');
const wishlistModel = require('../model/wishlistModel');
var objectId = require('mongodb').ObjectId;

//Admin Login
const adminLogin = (formData) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = {};
      let dbResponse = await adminSchema
        .findOne({
          email: formData.email,
          password: formData.password,
        })
        .lean();
      if (dbResponse) {
        console.log('login sucess');
        response.validadmin = dbResponse;
        response.status = true;
        resolve(response);
      } else {
        console.log('login Failed');
        response.status = false;
        reject(response);
      }
    } catch (error) {
      console.log('Login Failed');
      reject(error);
    }
  });
};

//Update USER details Patch Method -from admin and user side

const updateUserDetails = async (userId, updatedDetails) => {
  try {
    await userSchema
      .updateOne(
        { _id: userId },
        {
          $set: updatedDetails,
        }
      )
      .then((response) => {
        console.log('Res from helper:' + response);
      })
      .catch((error) => {
        console.log(error);
        throw new Error('Failed to update user details to db');
      });
  } catch (error) {
    throw error;
  }
};

// This feature is unnecessary...!!!
// const addUsers = (user) => {
//   {
//     return new Promise(async (resolve, reject) => {
//       try {
//         let existingUser = {};
//         let repeatedUser = await userSchema.findOne({ email: user.email });
//         console.log(repeatedUser);
//         if (repeatedUser) {
//           existingUser.status = true;
//           throw existingUser;
//         } else {
//           user.password = await bcrypt.hash(user.password, 10);
//           userSchema.insertOne(user);
//           resolve({ status: false });
//         }
//       } catch (error) {
//         throw error;
//       }
//     });
//   }
// };

const getAllUsers = () => {
  return new Promise(async (resolve, reject) => {
    try {
      //sensitive informations have to be hidden
      let users = await userSchema.find({}, { password: 0 }).lean();
      resolve(users);
    } catch (error) {
      reject(error);
    }
  });
};

//Soft Delete User

const softDeleteUser = async (userId) => {
  try {
    await userSchema.findByIdAndUpdate(userId, {
      access: false,
      deleted: true,
    });
  } catch (error) {
    console.error(error);
    throw new Error('Failed to soft delete user');
  }
};

//User Access modification
const userAccessModification = (userid, accessStatus) => {
  return new Promise(async (resolve, reject) => {
    console.log(userid);
    await userSchema
      .updateOne(
        { _id: objectId(userid) },
        {
          $set: {
            access: accessStatus,
          },
        }
      )
      .then((response) => {
        // console.log(response);
        resolve(response);
      });
  });
};

const getUserdetails = (userid) => {
  return new Promise(async (resolve, reject) => {
    await userSchema
      .findOne({ _id: objectId(userid) })
      .lean()
      .then((user) => {
        resolve(user);
      });
  });
};
const findUserByMob = (phoneInput) => {
  return new Promise(async (resolve, reject) => {
    let user = await userSchema.findOne({ phone: phoneInput }).lean();
    console.log(user);
    if (user) {
      resolve(user);
    } else {
      reject({ status: ' there is no such user' });
    }
  });
};

// add user Address for taking orders.
const addAddressFromCheckOut = (address) => {
  return new Promise((resolve, reject) => {
    addressSchema
      .create(address)
      .then((newAddress) => {
        const addressId = newAddress._id;
        console.log(`New address created with ID ${addressId}`);

        resolve(addressId); // return the address ID to the calling function
      })
      .catch((error) => {
        console.error(error);
        reject(error); // propagate the error to the calling function
      });
  });
};

//Adding new Address to Address collection from user side
const addNewAddress = (address) => {
  return new Promise((resolve, reject) => {
    addressSchema
      .create(address)
      .then((newAddress) => {
        const addressId = newAddress._id;
        console.log(`New address created with ID ${addressId}`);

        resolve(addressId); // return the address ID to the calling function
      })
      .catch((error) => {
        console.error(error);
        reject(error); // propagate the error to the calling function
      });
  });
};

//Update existing address in address collection

const updateAddress = async (addressId, newAddressFileds) => {
  try {
    await addressSchema
      .updateOne({ _id: addressId }, newAddressFileds, { new: true })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
        throw new Error('Error');
      });
  } catch (error) {
    throw error;
  }
};

//Retieving user Address from address collection using User id filed
const getAddressfromAddressCollection = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const address = await addressSchema.find({ userId }).lean();
      // console.log(address + " this is the address")
      if (!address) {
        console.log('No address found');
        reject();
      }
      resolve(address);
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

//Delete address with address ID

const deleteAddress = async (addressId) => {
  try {
    await addressSchema
      .deleteOne({ _id: addressId })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
        throw new Error('Error Deleting Address doc');
      });
  } catch (error) {
    throw error;
  }
};

//Retrieve user address-Subject to trails
const getUserAddress = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await userSchema.findById(userId).exec();
      if (!user) {
        reject();
      }
      resolve(user.address);
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

//List of non-deleted users
const nonDeletedUsers = async () => {
  try {
    const nonDeletedUsers = await userSchema.find({ deleted: false }).lean();
    return nonDeletedUsers;
  } catch (error) {
    console.log(error);
    resolve.render('error');
  }
};

//List Of Deleted Users

const deletedUsersList = async () => {
  try {
    const nonDeletedUsers = await userSchema.find({ deleted: true }).lean();
    return nonDeletedUsers;
  } catch (error) {
    console.log(error);
    resolve.render('error');
  }
};

const updateUser = (userid, user) => {
  return new Promise(async (resolve, reject) => {
    await userSchema
      .updateOne(
        { _id: objectId(userid) },
        {
          $set: {
            name: user.name,
            email: user.email,
          },
        }
      )
      .then((response) => {
        resolve(response);
      });
  });
};

const Signup = (user) => {
  return new Promise(async (resolve, reject) => {
    try {
      let olduser = {};
      //console.log(user);
      let existingUser = await userSchema
        .findOne({
          $or: [{ email: user.email }, { phone: user.phone }],
        })
        .lean();
      // console.log(existingUser);
      if (existingUser) {
        olduser.status = true;
        console.log('Existing user');
        reject(olduser);
      } else {
        user.password = await bcrypt.hash(user.password, 10);
        await userSchema.create(user);
        resolve({ Message: 'User added successfully' });
      }
    } catch (err) {
      reject(err);
    }
  });
};

const UserLogIn = (user) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = {};
      let validuser = await userSchema
        .findOne({
          email: user.email,
          access: true,
          deleted: false,
        })
        .lean();
      if (validuser) {
        let passwordMatch = await bcrypt.compare(
          user.password,
          validuser.password
        );

        if (passwordMatch) {
          console.log('login sucess');
          response.validuser = validuser;
          response.status = true;
          resolve(response);
        } else {
          reject({ status: false });
        }
      } else {
        reject({ status: false });
      }
    } catch (error) {
      reject({ status: false, Message: 'Some issue occured' });
    }
  });
};

const passwordReset = (email, newPassword) => {
  return new Promise(async (resolve, reject) => {
    try {
      newPassword = await bcrypt.hash(newPassword, 10);
      let validUser = await userSchema.updateOne(
        { email: email },
        {
          $set: {
            password: newPassword,
          },
        }
      );
      if (!validUser) {
        reject(new Error('Email not found'));
      } else {
        resolve(validUser);
      }
    } catch (err) {
      reject(err);
    }
  });
};

//CART MANAGEMENT...

//Add to Cart
const addToCart = async (userId, productId) => {
  try {
    productId = objectId(productId);
    console.log('user', userId);
    let cart = await cartSchema.findOne({ user: userId });
    if (!cart) {
      cart = new cartSchema({ user: userId, products: [] });
      console.log('New Cart:' + cart);
    }
    const cartProduct = await cart.products.find((product) =>
      product.product.equals(productId)
    );
    console.log("Cart Quantityyyyyy",cartProduct)
    if (cartProduct) {
      
      cartProduct.quantity += 1;

    } else {
      const product = await productSchema.findById(productId);
      cart.products.push({ product: product });
      console.log("CT:",cart.products);
    }
    await cart.save();
    return cart;
  } catch (error) {
    console.log(error);
  }
};

//Total amount from cart
const cartTotalAmount = async (userId) => {
  const cart = await cartSchema
    .findOne({ user: userId })
    .populate('products.product')
    .lean();
  if (!cart) {
    console.log('Empty cart');
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
      console.log(cart);
      products = cart.products;
    });
    if (!products) {
      reject();
    }
    return products;
  } catch (error) {
    console.log(error);
    return;
  }
};

//Cart Items Quantity
const cartProductQuantity = async (cartId, productId) => {
  try {
    cartId = objectId(cartId);
    productId = productId.toString();
    const cart = await cartSchema.findById(cartId);
    // console.log(cart);
    console.log(productId);
    console.log(productId.length);
    //Porduct array is empty- issue need resolution
    let product = cart.products.filter((product) => {
      console.log(product.product.toString());
      console.log(productId.length);
      if (product.product.toString() === productId) {
        const filteredProduct = product;
        console.log(filteredProduct);
        return filteredProduct;
      }
      console.log('nothing that matches');
    });
    console.log('Cart product quantity Helper');

    console.log(product);
    return product;
  } catch (error) {
    console.error(error);
    throw new Error(
      'An error occurred while getting the cart product quantity'
    );
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
        console.log('No address found');
        reject();
      }
      resolve(shippingAddressId);
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

// //Delete Cart

// const deleteCart = (userId) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       await cartSchema.deleteOne({ user: userId });
//       resolve();
//     } catch (error) {
//       console.log(error);
//       reject(error);
//     }
//   });
// };

//ORDER MANAGEMENT

// Adding address for shipping to Cart database

const addShippingAddressIdToCart = async (userId, shippingAddressId) => {
  try {
    const result = await cartSchema.updateOne(
      { user: userId },
      { $set: { shippingAddress: shippingAddressId } }
    );
    if (result.nModified === 0) {
      console.log('Address id additiion to cart failed');
      throw new Error(`Cart not found or shipping address already set`);
    }
    console.log('Shipping address added to cart');
  } catch (error) {
    console.error(error);
    throw new Error(`Error adding shipping address to cart `);
  }
};

// Order Creation
const createOrder = async (userId) => {
  try {
    const totalPrice = await cartTotalAmount(userId);
    const products = await cartProductArray(userId);
    const paymentMethod = await cartHelper.cartPaymentMethod(userId);
    console.log('Payment method from user helper: ' + paymentMethod);
    console.log('CreateOrders helpers:' + products);
    const shippingAddressId = await getAddressfromCartCol(userId);
    const order = {
      customer: userId,
      products: products,
      totalPrice: totalPrice,
      deliveryAddress: shippingAddressId,
      PaymentMethod: paymentMethod,
    };
    const newOrder = new orderSchema(order);
    try {
      await newOrder.save();
      console.log('Order placed successfully!');
    } catch (err) {
      console.error(err);
    }
  } catch (error) {
    console.log(error);
    return;
  }
};

//Retrieve Order data from orders To Client side

const orderDetails = async (userId) => {
  try {
    const orderDetails = await orderSchema
      .find({ customer: userId })
      .populate({
        path: 'products.product',
        select: 'name price productImages',
      })
      .populate('customer deliveryAddress')
      .sort({ dateCreated: -1 })
      .lean();
    console.log('order details:' + orderDetails);
    return orderDetails;
  } catch (error) {
    console.log(error);
  }
};

//Order Cancellation from user side
const orderCancelation = async (orderId) => {
  try {
    const status = await orderSchema
      .updateOne({ _id: orderId }, { $set: { orderStatus: 'Cancelled' } })
      .then((status) => {
        console.log(status);
        if ((modifiedCount = 0)) {
          console.log('cant do the operation right now');
        }
      });
  } catch (error) {
    console.log(error);
  }
};

//Wishlists

//Wishlist Items
const wishlistDetails = async (userId) => {
  try {
    const wishlist = await WishlistSchema.find({ userId: userId })
      .populate('products')
      .lean();
    return wishlist;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

//Add to Wishlist

const addToWishlist = async (productId, userId) => {
  try {
    const wishlist = await WishlistSchema.findOneAndUpdate(
      { userId: userId },
      { $addToSet: { products: productId } },
      { upsert: true, new: true }
    );
    console.log(`Added product to wishlist`);
    return wishlist;
  } catch (error) {
    console.error(`Error adding product to wishlist for user : ${error}`);
    throw error;
  }
};

//Remove from wishlist

const removeFromWishlist = async (productId, userId) => {
  try {
    await WishlistSchema.updateOne(
      { userId: userId },
      { $pull: { products: { $in: [productId] } } }
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = {
  wishlistDetails,
  addToWishlist,
  removeFromWishlist,
  orderCancelation,
  orderDetails,
  createOrder,
  addShippingAddressIdToCart,
  getAddressfromCartCol,
  cartProductArray,
  cartProductQuantity,
  cartTotalAmount,
  addToCart,
  passwordReset,
  UserLogIn,
  Signup,
  addAddressFromCheckOut,
  addNewAddress,
  updateAddress,
  getAddressfromAddressCollection,
  getUserAddress,
  deleteAddress,
  nonDeletedUsers,
  deletedUsersList,
  updateUser,
  findUserByMob,
  getUserdetails,
  softDeleteUser,
  userAccessModification,
  getAllUsers,
  updateUserDetails,
  adminLogin,
};
