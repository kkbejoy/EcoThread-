const cloudinary = require('cloudinary').v2;

const cloudinaryName=process.env.CLOUDINARY_NAME 
const apiKey=process.env.CLOUDINARY_API_KEY
const apiSecret=process.env.CLOUDINARY_API_SECRET




// Configuration 
cloudinary.config({
    cloud_name: cloudinaryName,
    api_key: apiKey,
    api_secret: apiSecret
  });

