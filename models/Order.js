import moment from "moment";
import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2"
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
const OrderSchema = new mongoose.Schema({
 
   slot_date:{
type:String,

    },
    slot_time_start:{
        type:String,
        
    },
  slot_time_end:{
    type:String,
       
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
discount:{
type:Number,
default:0
},
   professional_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    default:null
   },
   sub_services_quantity:{
type:[SubServiceQuantitySchema],

required:true
   }
   ,
   loyalty_points_discount:{
type:Number,
default:0
   },
   current_status:{
    type:String,
    enum:["Slot to be Selected","Finding Professional","Assigned Professional","Booking Cancelled","Job Complete"],
required:true
},
   payment_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Payment',
    required:true
   }  
}, {
    versionKey: false
})


  OrderSchema.set('toJSON', { virtuals: true });
 

  OrderSchema.virtual('date_string').get(function () {
      if(this.slot_date&&this.slot_time_end&&this.slot_time_start){
         return moment(this.slot_date).format("ll")+" at "+moment(this.slot_time_start).format("HH:mm A")+" - "+moment(this.slot_time_end).format("HH:mm A")
      
      }
     
  })
OrderSchema.plugin(mongoosePaginate)
export default mongoose.model("Order", OrderSchema)