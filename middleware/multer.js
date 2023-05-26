try{


const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const cloudinaryName=process.env.CLOUDINARY_NAME 
const apiKey=process.env.CLOUDINARY_API_KEY
const apiSecret=process.env.CLOUDINARY_API_SECRET




//Cloudinary Configuration 
cloudinary.config({
    cloud_name: cloudinaryName,
    api_key: apiKey,
    api_secret: apiSecret
  });

//Products Image Storage in Cloudinary
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req,res)=>{
        const uniqueFilename = Date.now() + '-' + Math.round(Math.random() * 1E9);
        console.log("uniwue file", uniqueFilename)
        return {
            folder: 'Products',
            public_id: 'product_' + uniqueFilename,
            format: 'jpg',
            transformation: [
              { width: 800, height: 800, crop: 'limit' }, // Resize the image to fit within 800x800 pixels
              { quality: 'auto' }, // Use auto quality compression
              { fetch_format: 'auto', flags: 'lossy' }, // Use lossy compression
              { effect: 'auto_contrast' } // Apply the auto contrast effect
            ]
          };
        }
      });

      const upload = multer({ storage: storage });

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, './public/productImages')
//     },
//     filename: (req, file, cb) => {
//         console.log(file);
//         const uniqueFileName = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.jpg';
//         cb(null, uniqueFileName);
//     }
// });


//Banner Image Storage in Cloudinary
const bannerStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req,res)=>{
    // console.log(req);
      const uniqueFilename = Date.now() + '-' + Math.round(Math.random() * 1E9);
      console.log("uniwue file", uniqueFilename)
      return {
          folder: 'banner',
          public_id: 'banner' + uniqueFilename,
          format: 'jpg',
          transformation: [
            { width: 1920, height: 800, crop: 'limit' }, // Resize the image
            { quality: 100 }, // Use auto quality compression
            { fetch_format: 'auto', flags: 'lossy' }, // Use lossy compression
            { effect: 'auto_contrast' } // Apply the auto contrast effect
          ]
        };
      }
    });

    const uploadBanner=multer({storage:bannerStorage})





// Delete Image from Cloudinary
const deleteImage=async(id)=>{
  try{
    const result= await cloudinary.api.delete_resources([id]);
    console.log("Image Deleted Succssfully", result)
  }catch(error){
    console.log("Error Deleting Image",error)
  }
}


module.exports = {
    storage,
    upload,
    uploadBanner,
    deleteImage
}

}catch(error){
  console.log("Error From Multer-Cloudinary",error)
}