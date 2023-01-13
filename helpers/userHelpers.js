var collection=require('../config/collection')
var db=require('../config/connection')
const bcrypt=require('bcrypt')
const { LongWithoutOverridesClass } = require('bson')
const { resolve } = require('promise')
var objectId=require('mongodb').ObjectId

module.exports=
{



    adminLogin:(data)=>{
        return new Promise(async(resolve,reject)=>{
        let response={}
        // console.log(data)
        let validadmin= await db.get().collection(collection.ADMINCOLLECTION).findOne({email:data.email,password:data.password})
        
        
        if(validadmin)
        {    console.log("login sucess")
            response.validadmin=validadmin
            response.status=true
           // console.log(response)
            resolve(response)
            
        }
        else{
            console.log("loginfailed")
            response.status=false
            resolve(response)
        }
    
    })
    
},
    addUsers:(user)=>
       {   
        return new Promise(async(resolve,reject)=>
            {   let existingUser={}
            let repeatedUser=await db.get().collection(collection.USERCOLLECTION).findOne({email:user.email})
            if(repeatedUser)
            {
                existingUser.status=true
             resolve(existingUser)           
            }
            else{
                user.password= await bcrypt.hash(user.password,10)   
                db.get().collection(collection.USERCOLLECTION).insertOne(user)
                resolve({status:false})
            }
        })
    },

    getAllUsers:()=>
    {
        return new Promise(async(resolve,reject)=>
        {
          let users= await db.get().collection(collection.USERCOLLECTION).find().toArray()
          resolve(users)
        })
    },
    
    deleteuser:(userid)=>{

        return new Promise(async(resolve,reject)=>{
            console.log(userid)
            await db.get().collection(collection.USERCOLLECTION).deleteOne({_id:objectId(userid)}).then((response)=>
        {
            console.log(response);
            resolve(response)

        })
    })
},

    getUserdetails:(userid)=>{
        return new Promise(async(resolve,reject)=>{

            await db.get().collection(collection.USERCOLLECTION).findOne({_id:objectId(userid)}).then((user)=>
        {
         resolve(user)
        })
    })
},
    updateUser:(userid,user)=>
        {
    return new Promise(async(resolve,reject)=>
    {
       await db.get().collection(collection.USERCOLLECTION).updateOne({_id:objectId(userid)},{
            $set:
            {
                name:user.name,
                email:user.email
            }
        }).then((response)=>
        {
            resolve(response)
            })
            })
        },
        
    Signup:(user)=>{  
    
        return new Promise(async(resolve,reject)=>{
                let olduser={}
                let existingUser=await db.get().collection(collection.USERCOLLECTION).findOne({email:user.email})
               
                if(existingUser){
                    olduser.status=true
                    resolve(olduser)
                }
        else{
            user.password= await bcrypt.hash(user.password,10)
            db.get().collection(collection.USERCOLLECTION).insertOne(user)
            resolve({status:false})
        }
    
        resolve (user);
    })},


    UserLogIn:(user)=>{
        return new Promise(async(resolve,reject)=> {
            let response={}
            let validuser= await db.get().collection(collection.USERCOLLECTION).findOne({email:user.email})
           // console.log(validuser);
                if(validuser)
                    {
                    bcrypt.compare(user.password,validuser.password).then((status)=>
                        {
                        if(status){
                            console.log('login sucess')
                            response.validuser=validuser;
                            response.status=true
                            resolve(response)
                                    }
                         else{
                            resolve({status:false})
                             }
                    })
                    }
                else{
            
                resolve({status:false})
                    }
     })
    },
}