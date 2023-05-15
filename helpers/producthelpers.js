var collection = require('../config/collection');
var db = require('../config/connection');
// const bcrypt=require('bcrypt')
const { LongWithoutOverridesClass } = require('bson');
const { resolve, reject } = require('promise');
// const { response } = require('../app')

var objectId = require('mongodb').ObjectId;
const productSchema = require('../model/productModel');
const categorySchema = require('../model/categoryModel');
const cartSchema = require('../model/cartModel');
const bannerSchema=require('../model/bannerModel')
const { response } = require('express');

//Product Mangement
const addProducts = (product) => {
  try{

  
  return new Promise(async (resolve, reject) => {
    console.log(product);
    let categoryName = product.category;
    let categoryDetail = await categorySchema.findOne({ name: categoryName });

    await productSchema.create(product).then((product) => resolve(product));
  });
}catch(error){
  console.log(error);
  throw error;
}
}

const getAllProducts = () => {
  return new Promise(async (resolve, reject) => {
    let product = await productSchema
      .find()
      .populate('category')
      .sort({ createdAt: -1 })
      .lean();
    resolve(product);
  });
};

//Retrieves all active Products
const getAllActiveProducts = () => {
  try {
    return new Promise(async (resolve, reject) => {
      let product = await productSchema
        .find({ productStatus: true })
        .populate('category')
        .sort({ createdAt: -1 })
        .lean();
      resolve(product);
    });
  } catch (error) {
    console.log(error);
    res.render('error', { user: true });
  }
};

//Product under certain Category

const productUnderCategory = async (categoryId) => {
  try {
    const products = await productSchema
      .find({ category: categoryId })
      .populate('category')
      .sort({ price: -1 })
      .lean();
    console.log(products);
    return products;
  } catch (error) {
    throw error;
  }
};

//Product Details with iD
const getProductdetails = (productid) => {
  try {
    console.log(productid);
    return new Promise(async (resolve, reject) => {
      await productSchema
        .findOne({ _id: objectId(productid) })
        .populate('category')
        .lean()
        .then((product) => {
          resolve(product);
        });
    });
  } catch (error) {
    console.log(error);
    res.render('error');
  }
};

//Delete Product
const deleteProducts = (productid) => {
  return new Promise(
    async (resolve, reject) =>
      await productSchema
        .deleteOne({ _id: objectId(productid) })
        .then((response) => resolve(response))
  );
};

//Update Products

// const updateProduct = (productid, updatedProductDetails) => {
//   try {
//     return new Promise(async (resolve, reject) => {
//       updatedProductDetails.updatedAt = Date.now(); //Updating the last updated time for every Submit in the edit product
//       console.log(updateProduct);
//       await productSchema
//         .updateOne(
//           { _id: objectId(productid) },
//           {
//             $set: {
//               name: updatedProductDetails.name,
//               description: updatedProductDetails.description,
//               price: updatedProductDetails.price,
//               category: updatedProductDetails.category,
//               quantity: updatedProductDetails.quantity,
//               sizesAvailable: updatedProductDetails.sizesAvailable,
//               productStatus: updatedProductDetails.productStatus,
//               updatedAt: updatedProductDetails.updatedAt,
//             },
//             $push: {
//               productImages: { $each: updatedProductDetails.newImages || [] },
//             },
//           }
//         )
//         .then((response) => {
//           console.log(response);
//           resolve(response);
//         });
//     });
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// };

const updateProduct = (productid, updatedProductDetails) => {
  try {
    return new Promise(async (resolve, reject) => {
      updatedProductDetails.updatedAt = Date.now(); // Updating the last updated time for every Submit in the edit product
      console.log(updateProduct);
      const product = await productSchema.findById(productid);
      if (!product) {
        throw new Error('Product not found'); // Handle product not found error
      }
      
      if (updatedProductDetails.productImages) {
        product.productImages =  [...product.productImages, ...updatedProductDetails.productImages];
        console.log("New P",product.productImages)
      }
      if (updatedProductDetails.name) {
        product.name = updatedProductDetails.name;
      }
      if (updatedProductDetails.description) {
        product.description = updatedProductDetails.description;
      }
      if (updatedProductDetails.price) {
        product.price = updatedProductDetails.price;
      }
      if (updatedProductDetails.category) {
        product.category = updatedProductDetails.category;
      }
      if (updatedProductDetails.quantity) {
        product.quantity = updatedProductDetails.quantity;
      }
      if (updatedProductDetails.sizesAvailable) {
        product.sizesAvailable = updatedProductDetails.sizesAvailable;
      }
      if (updatedProductDetails.productStatus) {
        product.productStatus = updatedProductDetails.productStatus;
      }
      if (updatedProductDetails.updatedAt) {
        product.updatedAt = updatedProductDetails.updatedAt;
      }
      
      const response = await product.save();
      console.log(response);
      resolve(response);
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

//Delete Product Image

const deleteImageFromDb=async(productId,publicId)=>{
  try{
    await productSchema.updateOne({_id:productId},
      {
        $pull:{
        productImages:publicId
      }}).then((response)=>{
        console.log(response);
      }).catch((error)=>{
        console.log(error);
      })

  }catch(error){
    cosole.log(error);
    throw error;
  }
}


// Category Management
const addCategory = async (category) => {
  try {
    const response = await categorySchema.create({ ...Object(category) });
    resolve(response);
  } catch (error) {
    if (
      error.code === 11000 &&
      error.keyPattern &&
      error.keyPattern.name === 1
    ) {
      throw new Error('Category already exists');
    } else {
      throw new Error(error);
    }
  }
};

//All active Category Details
const getAllActiveCategories = () => {
  return new Promise(async (resolve, reject) => {
    let categories = await categorySchema.find({ categoryStatus: true }).lean();
    // console.log(categories);
    resolve(categories);
  });
};

//All categories
const getAllCategories = () => {
  return new Promise(async (resolve, reject) => {
    let categories = await categorySchema.find().lean();
    console.log(categories);
    resolve(categories);
  });
};

//Category Id from Category Name

const categoryIdFromName = async (categoryName) => {
  try {
    console.log(categoryName.toString());
    categoryName = categoryName;
    // const categoryDetails=
    await categorySchema.find({ name: 'Winter Wear' }).then((category) => {
      console.log(category);
      // console.log(categoryDetails);
    });
    // return categoryId=categoryDetails._id;
  } catch (error) {
    throw error;
  }
};
const get_category_id = (categoryId) => {
  return new Promise(async (resolve, reject) => {
    let categoryDetails = await categorySchema
      .find({ _id: objectId(categoryId) })
      .lean();
    // console.log(categoryDetails);
    resolve(categoryDetails);
  });
};

//Admin Catergory status modification
const categoryListing = (categoryId, modification) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await categorySchema.updateOne(
        { _id: objectId(categoryId) },
        {
          $set: {
            categoryStatus: modification,
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

//BANNER MANAGEMENT

//All Banner Details

const bannerDetails=async()=>{
  try{
    const banners=await bannerSchema.find().lean();
    console.log(banners)
    return banners;

  }catch(error){
    console.log(error);
    throw error;
  }
}

//Banner URL and Image Id to db

const bannerToDb=async(bannerDetails)=>{
  try{
    const{name,bannerUrl,imageUrl}=bannerDetails;
    await bannerSchema.create({
      name:name,
      imageUrl:imageUrl,
      bannerUrl:bannerUrl
    }).then((response)=>{
      console.log(response);
    }).catch((error)=>{
      console.log(error);
      throw error;
    })
  }catch(error){
    throw error;
  }
}

module.exports = {
  categoryListing,
  categoryIdFromName,
  get_category_id,
  getAllActiveCategories,
  getAllCategories,
  addCategory,
  updateProduct,
  deleteProducts,
  getProductdetails,
  getAllProducts,
  getAllActiveProducts,
  productUnderCategory,
  addProducts,
  deleteImageFromDb,
  bannerDetails,
  bannerToDb
};
