import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String, required:true},
    password:{type:String, required:true},
    resetPasswordOtp: {type:Number, default:null},
    resetPasswordExpires: {type:Date, default:null},
    cartData:{type:Object, default:{}}
}, {minimize:false})

const userModel = mongoose.model.user || mongoose.model('user', userSchema);

export default userModel;