import moment from "moment";
import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
 
    coupon_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Coupon"
       
    },
    taxes:{
        type:Number,
        required:true
    },slot_date:{
type:String,
required:true
    },
    slot_time_start:{
        type:String,
        required:true
    },
  slot_time_end:{
    type:String,
        required:true
  },

    createdAt: {
        type: String,
        default:()=> moment().format("YYYY-MM-DDTHH:mm"),
        required: false
    },
user_address_id:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"UserAddress",
   required:true
},
amount:{
    type:Number,
required:true
},
net_amount:{
    type:Number,
required:true
},
status:{
type:String,
enum:["Paid","Pending"],
required:true
},
   mode_of_payment :{
    type:String,
    enum:["Online","Offline"],
required:true
   } 
    
      
}, {
    versionKey: false
})


  OrderSchema.set('toJSON', { virtuals: true });
 


export default mongoose.model("Order", OrderSchema)