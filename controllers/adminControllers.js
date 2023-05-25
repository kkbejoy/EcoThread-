const fs = require('fs');
const userHelper = require('../helpers/userHelpers');
const producthelper = require('../helpers/producthelpers');
const otp_api = require('../middleware/twilioOtp');
const { response } = require('../app');
const session = require('express-session');
const { ObjectId } = require('mongodb');
const { resolve, reject } = require('promise');
const addressModel = require('../model/addressModel');
const orderHelper = require('../helpers/Orderhelpers');
const couponHelper = require('../helpers/couponHelpers');
const reportHelper = require('../helpers/reportHelpers');
const { report } = require('../routes');
const productSchema = require('../model/productModel');
const cloudinary = require('cloudinary').v2;
const razorPayServices = require('../services/razorpay');
const stockManagement = require('../helpers/inventoryMangament');
const multer = require('multer');
const { upload, uploadBanner, deleteImage } = require('../middleware/multer');

//Admin LoginPage rendering
const adminLogInPageRendering = async (req, res) => {
  try {
    res.render('admin/adminlogin');
  } catch (error) {
    console.log(error);
     res.render("admin/adminError",{admin:true});;
  }
};

// Admin Credentials Validation
const adminLoginValidation = async (req, res) => {
  try {
    await userHelper
      .adminLogin(req.body)
      .then((response) => {
        let adminStatus = response.status;
        if (adminStatus) {
          req.session.adminloggedIn = true;
          req.session.admin = response.validadmin;
          console.log('Admin in seession', req.session.admin);
          res.redirect('dashboard');
        }
      })
      .catch((err) => {
        console.log('Login Failed');
        res.render('admin/adminlogin',{invalid:true})
      });
  } catch (error) {
    console.log(error)
    res.redirect('/')
  }
};

// /Dashboard Rendering
const dashboardRendering = async (req, res) => {
  try {
    const users = await userHelper.nonDeletedUsers();
    const ordersPendingCount = await reportHelper.totalPendingOrders();
    const monthlyOrdersData = await reportHelper.monthlyOrdersData();
    const monthlyReturnedOrders=await reportHelper.monthlyRetunedOrder();
    const monthlyReturnedOrdersArray=monthlyReturnedOrders.map((obj) => obj.count);
    const monthlyOrdersArray = monthlyOrdersData.map((obj) => obj.count);
    console.log('monthlyOrdersArray:', monthlyOrdersArray);
    const orders = await orderHelper.orderDetails();
    const totalMonthlyRevenue = await reportHelper.totalRevenue();
    const totalActiveProductsCount =
      await reportHelper.totalActiveProductsCount();
    const totalActiveCategories = await reportHelper.totalActiveCategories();
    const totalMonthlyProfit = await reportHelper.MonthlyProfit();
    const paymentStatistics = await reportHelper.paymentMethodReport();

    console.log('Length:', paymentStatistics);
    res.render('admin/dashboard', {
      orders,
      users,
      totalMonthlyRevenue,
      totalActiveCategories,
      totalMonthlyProfit,
      totalActiveProductsCount,
      ordersPendingCount,
      paymentStatistics,
      monthlyOrdersArray,
      monthlyReturnedOrdersArray,
      admin: true,
    });
  } catch (error) {
    console.log(error);
     res.render("admin/adminError",{admin:true});;
  }
};

//PRODUCTS

//Product List Page rendering

const productListPageRendering = async (req, res) => {
  try {
    producthelper.getAllProducts().then((product) => {
      res.render('admin/productsList', { product, admin: true });
    });
  } catch (error) {
    console.log(error);
     res.render("admin/adminError",{admin:true});;
  }
};

//Product Searching
const productSearch = async (req, res) => {
  try {
    let { search: name } = req.query;
    name = name.trim();
    console.log('name:' + name);
    let product = await productSchema
      .find({ name: { $regex: new RegExp('^' + name + '.*', 'i') } })
      .limit(10)
      .lean();
    console.log('Search Result:' + product);
    res.render('admin/productsList', {
      admin: true,
      product,
    });
  } catch (error) {
    console.log(error);
    res.render('error', { admin: true });
  }
};

//Product Addition Page rendering

const productAdditionPageRendering = (req, res) => {
  try {
    console.log('Hello from add Products get');
    producthelper.getAllActiveCategories().then((categories) => {
      console.log(categories);
      console.log('Pointer from add product page render route');
      res.render('admin/addProducts', { admin: true, categories });
    });
  } catch (error) {
    console.log(error);
     res.render("admin/adminError",{admin:true});;
  }
};

//Product addition To data base

const productAdditionToDB = (req, res) => {
  try {
    const files = req.files;
    console.log('File name from', files);
    if (!files) {
      // Handle the error appropriately
      console.log('No files were uploaded.');
      return res.status(400).send('No files were uploaded.');
    }
    console.log(files);
    const filename = files.map((file) => {
      console.log(file.filename);
      return file.filename;
    });

    let productDetails = req.body;
    productDetails.productImages = filename;

    producthelper
      .addProducts(productDetails)
      .then((insertionStatus) => {
        console.log(insertionStatus);
        res.redirect('back');
        // res.status(201).json('success');
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({ error: 'Failed to add Product' });
      });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add Product' });
  }
};

//Product Updatation page rendeirng
const productUpdationPageRendering = async (req, res) => {
  // console.log(req.body);
  try {
    let categories = await producthelper.getAllCategories();
    await producthelper.getProductdetails(req.params.id).then((product) => {
      //console.log(product)
      res.render('admin/updateProducts', {
        product,
        categories,
        admin: true,
        adminin: true,
      });
    });
  } catch (error) {
    console.log(error);
     res.render("admin/adminError",{admin:true});;
  }
};

//Product Updation Data to Database
const productUpdationToDB = async (req, res) => {
  try {
    // console.log(files)
    console.log('Req.File', req.files);
    let files;
    let filename;
    if (req.files) {
      files = req.files;
      console.log(files);
      filename = files.map((file) => {
        console.log(file.filename);
        return file.filename;
      });
    }
    console.log('filename:', filename);

    const {
      name,
      description,
      price,
      category,
      quantity,
      sizesAvailable,
      productStatus,
    } = req.body;
    const productId = req.params.id;
    const upadtedProductDetails = {};

    if (name) upadtedProductDetails.name = name;
    if (description) upadtedProductDetails.description = description;
    if (price) upadtedProductDetails.price = price;
    if (category) upadtedProductDetails.category = category;
    if (quantity) upadtedProductDetails.quantity = quantity;
    if (sizesAvailable) upadtedProductDetails.sizesAvailable = sizesAvailable;
    // if(productImages) upadtedProductDetails.productImages=productImages;
    if (productStatus) upadtedProductDetails.productStatus = productStatus;
    if (filename) upadtedProductDetails.productImages = filename;
    console.log('Product Id:' + productId);
    console.log('upadtedProductDetails');
    console.log(upadtedProductDetails);
    await producthelper
      .updateProduct(productId, upadtedProductDetails)
      .then((data) => {
        console.log(data);
        res.redirect('/admin/viewproducts');
      });
  } catch (error) {
    console.log(error);
     res.render("admin/adminError",{admin:true});;
  }
};

//Product Image Deleting

const imageDeletion = async (req, res) => {
  try {
    console.log('hello');
    const { imageId: publicId, productId } = req.body;
    // const publicId="Products/product_1683788512536-736551465"
    console.log(publicId);
    await deleteImage(publicId);
    await producthelper.deleteImageFromDb(productId, publicId);
    res.status(200).json({ message: 'Deletion Successfull' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Deletion Failed' });
  }
};



//Product deletion

const productDeletion = (req, res, next) => {
  try {
    let productid = req.params.id;
    console.log(productid);

    producthelper.deleteProducts(productid).then((response) => {
      console.log(response);
      res.redirect('/admin/viewproducts');
    });
  } catch (error) {
    console.log(error);
     res.render("admin/adminError",{admin:true});;
  }
};

//ORDERS
//Order Details rendering
const orderDetails = async (req, res) => {
  try {
    const orders = res.paginatedResults;
    console.log(orders);
    res.render('admin/orders', { orders, admin: true });
  } catch (error) {
    console.log(error);
     res.render("admin/adminError",{admin:true});;
  }
};

//Return Order Accepting

const acceptRetunRequest = async (req, res) => {
  try {
    const {
      params: { id: orderId },
    } = req;
    console.log(orderId);
    const orders = await orderHelper.orderDetailsOfThisId(orderId);
    const amount = orders.totalPrice;
    const razorpayPaymentId = orders.razorpayPaymentId;
    console.log(
      'Order Details to RazorPay',
      amount,
      razorpayPaymentId,
      orderId
    );
    if (razorpayPaymentId) {
      await razorPayServices.initiateRazorPayRefund(
        razorpayPaymentId,
        amount,
        orderId
      );
    }
    const orderDetails = await orderHelper.acceptReturn(orderId);
    const products = orderDetails.products;
    await stockManagement.stockAddition(products);
    res.redirect('back');
  } catch (error) {
    console.log(error);
     res.render("admin/adminError",{admin:true});;
  }
};

//Orer detials of specific order
const orderDetailsOfThisId = async (req, res) => {
  try {
    const {
      params: { id: orderId },
    } = req;
    console.log(orderId);
    let paymentStatus="Returned"
    await orderHelper
      .orderDetailsOfThisId(orderId)
      .then(async(orderDetails) => {
        if (orderDetails.PaymentMethod == 'Card Payment'){
          paymentStatus= await razorPayServices.checkPaymentStatus(
           orderDetails.razorpayPaymentId
         );
         paymentStatus=paymentStatus.status;
       }
        console.log('orderDetails:' + orderDetails, "Payment Status:",paymentStatus);
        res.render('admin/orderDetails', { admin: true, orderDetails,paymentStatus });
      })
      .catch((error) => {
        throw error;
        // console.log(error);
        // res.render("admin/adminError",{admin:true});
      });
  } catch (error) {
    console.log(error);
     res.render("admin/adminError",{admin:true});;
  }
};

//Order Status Modification
const orderStatusModification = async (req, res) => {
  try {
    const {
      params: { id: orderId },
    } = req;
    const {
      body: { orderStatus: newStatus },
    } = req;
    const orders = await orderHelper.orderDetailsOfThisId(orderId);

    if (newStatus === 'Cancelled') {
      const amount = orders.totalPrice;
      const razorpayPaymentId = orders.razorpayPaymentId;
      console.log(
        'Order Details to RazorPay',
        amount,
        razorpayPaymentId,
        orderId
      );
      const products = orders.products;
      await stockManagement.stockAddition(products);
      if (razorpayPaymentId) {
        await razorPayServices.initiateRazorPayRefund(
          razorpayPaymentId,
          amount,
          orderId
        );
      }
    }
    console.log(newStatus);
    await orderHelper
      .orderStatusModification(orderId, newStatus)
      .then((response) => {
        console.log(response);
        res.status(201).json('success');

        // res.redirect('/admin/orders');
      });
  } catch (error) {
    console.log(error);
    res.status(500).json('failed');
  }
};

//Sales Report Page rendering

const salesReportPageRendering = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const convertedStartDate = startDate
      ? new Date(`${startDate}T00:00:00Z`)
      : null;
    const convertedEndDate = endDate ? new Date(`${endDate}T23:59:59Z`) : null;

    console.log(startDate, endDate);
    const deliveredOrders = await reportHelper.salesReport(
      convertedStartDate,
      convertedEndDate
    );

    const totalOrders = deliveredOrders.length;
    let totalProductsSold = 0;
    let totalRevenue = 0;
    let totalProfit = 0;
    deliveredOrders.forEach((order) => {
      totalProductsSold += order.products.length;
      totalRevenue += order.totalPrice;
      totalProfit += order.totalPrice * 0.25;
    });
    const data = {};
    const salesReport = {
      totalOrders,
      totalProductsSold,
      totalRevenue,
      totalProfit,
      startDate,
      endDate,
    };

    res.render('admin/salesReport', { admin: true, salesReport });
  } catch (error) {
    console.log(error);
     res.render("admin/adminError",{admin:true});;
  }
};

//Sale report Download as CSV

const salesReportPrint = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const convertedStartDate = startDate
      ? new Date(`${startDate}T00:00:00Z`)
      : null;
    const convertedEndDate = endDate ? new Date(`${endDate}T23:59:59Z`) : null;
    console.log(convertedStartDate, convertedEndDate);
    const deliveredOrders = await reportHelper.salesReport(
      convertedStartDate,
      convertedEndDate
    );

    const totalOrders = deliveredOrders.length;
    let totalProductsSold = 0;
    let totalRevenue = 0;
    let totalProfit = 0;
    deliveredOrders.forEach((order) => {
      totalProductsSold += order.products.length;
      totalRevenue += order.totalPrice;
      totalProfit += order.totalPrice * 0.25;
    });
    const salesReportData = [
      { title: 'Total Orders', value: totalOrders },
      { title: 'Total Products Sold', value: totalProductsSold },
      { title: 'Total Revenue', value: totalRevenue },
      { title: 'Total Profit', value: totalProfit },
    ];
    const csvFilePath = await reportHelper.generateCsvReport(salesReportData);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="sales-report.csv"`
    );

    // Stream the file to the response
    const fileStream = fs.createReadStream(csvFilePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error generating sales report: ', error);
     res.render("admin/adminError",{admin:true});;
  }
};

//COUPONS
//Coupon Additon post method
const couponAddition = async (req, res) => {
  try {
    console.log('hey from admin controller');

    console.log(req.body);
    const couponData = req.body;
    await couponHelper
      .couponAddition(couponData)
      .then((response) => {
        console.log('sucess:' + response);
        res.status(201).json({ success: true });
      })
      .catch((error) => {
        res.status(500).json({ error: 'Failed to add coupon' });
      });
  } catch (error) {
    console.log('Coupon addition Failed from controller');
    res.status(500).json({ error: 'Failed to add coupon' });
  }
};

//Coupons Page rendering
const couponPageRendering = async (req, res) => {
  try {
    await couponHelper
      .couponDetailsFromDataBase()
      .then((coupons) => {
        console.log(coupons);
        res.render('admin/coupons', { admin: true, coupons });
      })
      .catch((error) => {
        throw error;
      });
  } catch (error) {
    console.log(error);

     res.render("admin/adminError",{admin:true});;
  }
};

//Coupon Deletion

const deleteCoupon = async (req, res) => {
  try {
    const { couponId: couponId } = req.body;
    console.log('coupon id:' + couponId);
    await couponHelper
      .deleteCoupon(couponId)
      .then((response) => {
        res.status(201).json({ status: 'success' });
      })
      .catch((error) => {
        res.status(500).json({ error: 'Failed to delete coupon' });
      });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
};

//CATEGORY MANAGEMENT

//Category Page rendering
const categoryPageRendering = async (req, res) => {
  try {
    producthelper
      .getAllCategories()
      .then((categories) => {
        res.render('admin/category', { admin: true, categories });
      })
      .catch((err) => {
        console.log(err);
        res.render('admin/category', {
          admin: true,
          categories,
          failed: true,
          message: err,
        });
      });
  } catch (error) {
     res.render("admin/adminError",{admin:true});;
  }
};

//New Category to DB
const newCatogoryAddition = async (req, res) => {
  try {
    producthelper
      .addCategory(req.body)
      .then((response) => {
        console.log(response);
        res.redirect('/admin/category', { admin: true, categories });
      })
      .catch((err) => {
        console.log(err);
        res.redirect('/admin/category');
      });
  } catch (error) {
     res.render("admin/adminError",{admin:true});;
  }
};

//Category Listing and Unlisting

// const categoryListingAndUnlisting = (req, res) => {
//   let categoryId = req.params.id;
//   producthelper.get_category_id(categoryId).then((categoryDetails) => {
//     console.log(categoryDetails);
//     res.render('admin/categoryEditPage', { categoryDetails, admin: true });
//   });
// };

//Category Listing and Unlisting
const categoryStatusAlteration = async (req, res) => {
  try {
    console.log('Category modification');
    let categoryId = req.params.id;
    let {newStatus:modification} = req.body;
    console.log('Category modification',modification);
    await producthelper.productsUnderCatStatusModification(categoryId,modification);
    producthelper.categoryListing(categoryId, modification).then((response) => {
      console.log(response);
      res.status(200).json({success:true,message:"Category and Products status modified"})
      // res.redirect('/admin/category');
    });
  } catch (error) {
    console.log(error);
     res.render("admin/adminError",{admin:true});;
  }
};

// BANNER MANAGEMENT

//Banner Page

const bannerPage=async(req,res)=>{
  try{
    const banners=await producthelper.bannerDetails();
    res.render("admin/banner",{admin:true,banners})
  }catch(error){
    console.log(error);
    res.render("admin/adminError",{admin:true})
  }
}

//Banner to dataBase
const bannerToDb=async(req,res)=>{
  try{
    const files = req.files;
    const{body:{name,url}}=req;
    console.log('File name from', files);
    if (!files) {
      console.log('No files were uploaded.');
      return res.status(400).send('No files were uploaded.');
    }
    const bannerDetails={};
    bannerDetails.name=name;
    bannerDetails.bannerUrl=url;
    bannerDetails.imageUrl=files[0].filename;
    console.log(bannerDetails)
    await producthelper.bannerToDb(bannerDetails).then((response)=>{
      console.log(response);
      res.redirect('back')
    }).catch((error)=>{
      console.log(error);
      throw error;
    })


  }catch(error){
    console.log(error);
    res.render("admin/adminError",{admin:true})
  }
}

//USERS MANAGEMENT

//Users List page rendering
const usersListPageRendering = async (req, res) => {
  try {
    const deletedUsers = await userHelper.deletedUsersList();
    await userHelper
      .nonDeletedUsers()
      .then((users) => {
        console.log(users);
        res.render('admin/usersList', {
          admin: true,
          users,
          adminin: true,
          deletedUsers,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
     res.render("admin/adminError",{admin:true});;
  }
};

//Deleted Users List page rendering
const deletedUsersListPageRendering = async (req, res) => {
  try {
    const users = await userHelper.deletedUsersList();
    res.render('admin/deletedUsersList', {
      admin: true,
      users,
      adminin: true,
    });
  } catch (error) {
    console.log(error);
     res.render("admin/adminError",{admin:true});;
  }
};

//User Profile Update Page

const userDetailsUpdatePageRendering = async (req, res) => {
  try {
    const { id: userId } = req.params;
    // console.log(userId)
    await userHelper.getUserdetails(userId).then((userDetail) => {
      // console.log(userDetail);
      res.render('admin/editUser', { userDetail, admin: true });
    });
  } catch (error) {
     res.render("admin/adminError",{admin:true});;
  }
};

//Updated User Details To Database
const updateUserDetailsToDatatabase = async (req, res) => {
  try {
    const { id: userId } = req.params;
    console.log('userr Id:' + userId);
    const { name, email, phone, dateOfBirth, access } = req.body;
    const updatedUserDetails = {};

    if (name) updatedUserDetails.name = name;
    if (email) updatedUserDetails.email = email;
    if (phone) updatedUserDetails.phone = phone;
    if (dateOfBirth) updatedUserDetails.dateOfBirth = dateOfBirth;
    if (access) updatedUserDetails.access = access;

    console.log(updatedUserDetails);
    await userHelper
      .updateUserDetails(userId, updatedUserDetails)
      .then((response) => {
        console.log(response);
        res.redirect('/admin/viewusers');
      });
  } catch (error) {
     res.render("admin/adminError",{admin:true});;
  }
};


//User Access modification

const userAccessModification = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const { access: accessStatus } = req.body;
    userHelper
      .userAccessModification(userId, accessStatus)
      .then((response) => {
        console.log(response);
        res.redirect('/admin/viewusers');
      })
      .then((error) => {
        console.log(error);
        throw new Error('Error');
      });
  } catch (error) {
     res.render("admin/adminError",{admin:true});;
  }
};

//User Deletion
const userDeletion = async (req, res) => {
  try {
    const { id: userId } = req.params;
    await userHelper.softDeleteUser(userId).then((response) => {
      location.reload();
    });
  } catch (error) {
    console.log(error);
    res.render('error');
  }
};
//Trail page loading
const trailPageRendering = async (req, res) => {
  // const nonDeletedUsers = await userHelper.nonDeletedUsers();
  // console.log('trail page renderin');
  res.render('admin/banner', {
    admin: true
  });

  // res.json(res.paginatedResults)
  // res.render('admin/sample', { orders });
};

//sample post
const trail = async (req, res) => {
  console.log(req.files);
  // const file = req.files.image;

  cloudinary.uploader.upload(
    file.tempFilePath,
    { folder: 'my_folder' },
    (error, result) => {
      if (error) {
        console.error(error);
      } else {
        console.log(result);
        // You can use the result URL or public_id to display the uploaded image on your web page
        res.send(`Uploaded image: ${result.url}`);
      }
    }
  );
};

module.exports = {
  adminLogInPageRendering,
  adminLoginValidation,
  dashboardRendering,
  productListPageRendering,
  productSearch,
  productAdditionPageRendering,
  productAdditionToDB,
  productUpdationPageRendering,
  productUpdationToDB,
  imageDeletion,
  productDeletion,
  orderDetails,
  orderStatusModification,
  acceptRetunRequest,
  salesReportPageRendering,
  salesReportPrint,
  couponPageRendering,
  couponAddition,
  deleteCoupon,
  orderDetailsOfThisId,
  categoryPageRendering,
  newCatogoryAddition,
  categoryStatusAlteration,
  bannerPage,
  bannerToDb,
  usersListPageRendering,
  deletedUsersListPageRendering,
  userDetailsUpdatePageRendering,
  updateUserDetailsToDatatabase,
  userAccessModification,
  userDeletion,
  trailPageRendering,
  trail,
};
