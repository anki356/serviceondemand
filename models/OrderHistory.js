import moment from "moment";
import mongoose from "mongoose";

const OrderHistorySchema = new mongoose.Schema({
 
   
   
  

    createdAt: {
        type: String,
        default:()=> moment().format("YYYY-MM-DDTHH:mm"),
        required: false
    },
order_id:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Order",
   required:true
},
status:{
    type:String,
    enum:["Slot to be Selected","Finding Professional","Assigned Professional","Booking Cancelled","Job Complete"],
required:true
},

      
}, {
    versionKey: false
})


  OrderHistorySchema.set('toJSON', { virtuals: true });
 


export default mongoose.model("OrderHistory", OrderHistorySchema)