import moment from "moment";
import mongoose from "mongoose";

const CouponSchema = new mongoose.Schema({
 
   name:{
    type:String,
    required:true
   }
  ,

    createdAt: {
        type: String,
        default:()=> moment().format("YYYY-MM-DDTHH:mm"),
        required: false
    },

discount:{
    type:Number,
required:true
},max_value:{
type:Number,
required:true
}
,
 status:{
type:Boolean,
default:true
 }    
    
      
}, {
    versionKey: false
})


  CouponSchema.set('toJSON', { virtuals: true });
 


export default mongoose.model("Coupon", CouponSchema)