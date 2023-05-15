const mongoose= require('mongoose');
const Schema= mongoose.Schema;


const categorySchema= new Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        uppercase: true 
    },
    description:{
        type:String
    },
    categoryStatus:{
        type:Boolean,
        default:true
    },
    
    createdAt: {
        type: Date,
        default: Date.now
      }

})


module.exports=mongoose.model('Category',categorySchema);