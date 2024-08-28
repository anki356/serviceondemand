import moment from "moment";
import mongoose from "mongoose";

const SubServicesRatingSchema = new mongoose.Schema({
 
    rating: {
        type: Number,
       
    },
  sub_services_id:{
type:mongoose.Schema.Types.ObjectId,
ref:'SubService',
required:true
  },
  user_id:{
type:mongoose.Schema.Types.ObjectId ,
ref:'User',
required:true
  },

    createdAt: {
        type: String,
        default:()=> moment().format("YYYY-MM-DDTHH:mm"),
        required: false
    }
 
    
     
    
      
}, {
    versionKey: false
})


  SubServicesRatingSchema.set('toJSON', { virtuals: true });
 


export default mongoose.model("SubServicesRating", SubServicesRatingSchema)