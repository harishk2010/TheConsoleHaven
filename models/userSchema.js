const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const userSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
       
    },
    mobile: {
        type: Number,
        required: true,
       
    },
    password:{
        type:String,
        required:true

    },
    isBlocked:{
        type:Boolean,
        default:false
    }
    ,
    image:{
        type:Array,
    }

})
const User=mongoose.model('user',userSchema);
module.exports={
    User
}