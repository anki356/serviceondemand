import mongoose from "mongoose";
const otpSchema=new mongoose.Schema({
    code:{
        type:String,
        required:true,
       
    },
    email:{
        type:String,
       
    } ,
    mobile_number:{
        type:Number
    },
    expiresAt: {
        type: Date,
        default: Date.now,
        expires: 5 * 60 // Expiry time in seconds (5 minutes)
      }
},{
    timestamps: { createdAt: 'createdAt' }
})
// otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 5 * 60 });
export default mongoose.model("Otp",otpSchema)
