import moment from "moment";
import mongoose from "mongoose";
const SubServiceQuantitySchema=new mongoose.Schema({
    sub_services_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"SubService",
       required:true
    },
    quantity:{
        type:Number,
        required:true
    }
})
const CartSchema = new mongoose.Schema({
 
    sub_services_quantity: {
        type:[SubServiceQuantitySchema],
        
       required:true
    },
  

    createdAt: {
        type: String,
        default:()=> moment().format("YYYY-MM-DDTHH:mm"),
        required: false
    },
user_id:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
   required:true
},
amount:{
    type:Number,
required:true
}

     
    
      
}, {
    versionKey: false
})


  CartSchema.set('toJSON', { virtuals: true });
 


export default mongoose.model("Cart", CartSchema)