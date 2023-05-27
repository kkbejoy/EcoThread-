const db = require('../config/connection');
const cartSchema = require('../model/cartModel');
const orderHelper=require('../helpers/Orderhelpers')
const productSchema=require('../model/productModel');
const { response } = require('express');


//Stock Checking function
const stockAvailabilityChecker=(products)=>{
    try{
        console.log("Products Ffrom Stock availability Checker",products);

       for (const product of products){
            if(product.product.quantity<product.quantity) {
                // console.log("hello From stock availability checker-0")
                return 0;

            }
            // console.log(product.product.name);

            // console.log(product.product.quantity);
            // console.log("hello From stock availability checker-1")
        }
           
            

        return 1;
    }catch(error){
        // console.log(error)
    }
}

// Stock Reduction Base Function
const stockReduction=async(products)=>{
    try{
    products.forEach(product => {
        let{product:productId,quantity:value}=product;
        // console.log("Stock Reduction inventory:",productId,value )
        productId=productId.toString()
         decrementProductQuantity(productId,value);
        
    });
}catch(error){
    // console.log(error)
    throw error;
}
   return;
}


// Stock Addition Base Function
const stockAddition=async(products)=>{ 
    try{ 
        // console.log("Poprducts from Inventory:",products);
        // console.log("from inventory:", products )

        products.forEach(async product=>{
            const value=product.quantity;
            const productId=product.product;
            await incrementProductQuantity(productId,value);
        })        
        }catch(error){
        // console.log(error);
        throw error;
    }
   }

//Helper Funnction for Decrementing Product Stock
const decrementProductQuantity=async(productId,value)=>{
    try{
    await productSchema.findByIdAndUpdate(productId,
        {
            $inc:{
                quantity:-value
            }
        }).then((response)=>{
            // console.log(response)
        }).catch((error)=>{
            // console.log(error)
        })
    }catch(error){
        // console.log(error);
        throw error;
    }
}


//Helper Funnction for Incrementing Product Stock
const incrementProductQuantity=async(productId,value)=>{
    try{
        await productSchema.findByIdAndUpdate(productId,
            {
                $inc:{
                    quantity:value
                }
            }).then((response)=>{
                // console.log(response)
            }).catch((error)=>{
                // console.log(error)
            })

    }catch(error){
            // console.log(error);
            throw error;
        }
}


module.exports={
    stockAvailabilityChecker,
    decrementProductQuantity,
    incrementProductQuantity,
    stockReduction,
    stockAddition
}