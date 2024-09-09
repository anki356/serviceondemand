import moment from "moment";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
const UserAddressSchema = new mongoose.Schema({
 
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    flat_no:{
        type:Number,
       required:true
    },
    default:{
        type:Boolean,
        default:true
    },
    area:{
type:String,
required:true
    },
    city: {
        type: String,
        required:true
        
    },
    state: {
        type: String,
        required:true
       
    },
 pincode:{
type:Number,
required:true
 },
 category:{
type:String,
enum:["Home",'Other'],
default:"Home"
 },
    createdAt: {
        type: String,
        default:()=> moment().format("YYYY-MM-DDTHH:mm"),
        required: false
    }
 
     ,status:{
        type:Boolean,
        default:true
      }
     
    
      
}, {
    versionKey: false
})


  UserAddressSchema.set('toJSON', { virtuals: true });
 


export default mongoose.model("UserAddress", UserAddressSchema)