var collection=require('../config/collection')
var db=require('../config/connection')
// const bcrypt=require('bcrypt')
const { LongWithoutOverridesClass } = require('bson')
const { resolve } = require('promise')
var objectId=require('mongodb').ObjectId


module.exports={

    addProducts:(product)=>{
        return new Promise (async(resolve,reject)=>
                await db.get().collection(collection.PRODUCTCOLLECTION).insertOne(product).then((product)=>
                resolve(product)
                )
                
                )},
                
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>
        {
          let product= await db.get().collection(collection.PRODUCTCOLLECTION).find().toArray()
          resolve(product)
        })
    },

    
    getProductdetails:(productid)=>{
        console.log(productid)
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.PRODUCTCOLLECTION).findOne({_id:objectId(productid)}).then((product)=>{
                 resolve(product)
        })
    })
},

    deleteProducts:(productid)=>{
        return new Promise(async(resolve,reject)=>
            await db.get().collection(collection.PRODUCTCOLLECTION).deleteOne({_id:objectId(productid)}).then((response)=>
            resolve(response)))
    },

    
    updateProduct:(productid,product)=>
        {
    return new Promise(async(resolve,reject)=>
    {
       await db.get().collection(collection.PRODUCTCOLLECTION).updateOne({_id:objectId(productid)},{
            $set:
            {
                brand:product.brand,
                category:product.category,
                description:product.description,
                price:product.price,
                size:product.size,
                image:product.image

            }
        }).then((response)=>
        {
            resolve(response)
            })
            })
        },
}
