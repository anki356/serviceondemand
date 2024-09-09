import mongoose from "mongoose";
import moment from "moment";
const SearchSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
       
    },
    count:{
        type:Number,
       default:0
    } ,
   

    createdAt: {
        type: String,
        default:()=> moment().format("YYYY-MM-DDTHH:mm"),
        required: false
    }
    
})
// otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 5 * 60 });
export default mongoose.model("Search",SearchSchema)
