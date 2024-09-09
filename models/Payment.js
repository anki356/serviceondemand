import moment from "moment";
import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
 
    coupon_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Coupon"
       
    },
    taxes:{
        type:Number,
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
   } ,
trx_ref_no:{
    type:String
}
    
      
}, {
    versionKey: false
})


  PaymentSchema.set('toJSON', { virtuals: true });
 


export default mongoose.model("Payment", PaymentSchema)