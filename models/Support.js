import moment from "moment";
import mongoose from "mongoose";

const SupportSchema = new mongoose.Schema({
 
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
 

    createdAt: {
        type: String,
        default:()=> moment().format("YYYY-MM-DDTHH:mm"),
        required: false
    }
 
     ,is_open:{
        type:Boolean,
        default:true
      }
     
    
      
}, {
    versionKey: false
})


  SupportSchema.set('toJSON', { virtuals: true });
 


export default mongoose.model("Support", SupportSchema)