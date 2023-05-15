const mongoose=require('mongoose')

const addressSchema = new mongoose.Schema({
    createdAt : {
        type : Date,
        default : Date.now()
    },
    name:String,
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
      },
    houseNo:String,
    street : String,
    city : String,
    district:String,
    state : String,
    country : String,
    pinCode : Number,
    phone:Number,
    email:String,
});

module.exports =  mongoose.model('address', addressSchema);
