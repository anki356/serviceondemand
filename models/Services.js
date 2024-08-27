import moment from "moment";
import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema({
 
    name: {
        type: String,
        unique: true
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


  ServiceSchema.set('toJSON', { virtuals: true });
 


export default mongoose.model("Service", ServiceSchema)