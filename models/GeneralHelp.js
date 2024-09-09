import moment from "moment";
import mongoose from "mongoose";

const GeneralHelpSchema = new mongoose.Schema({
 
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
 ,
     text:{
type:String,
required:true
     },
     helpful:{
type:Boolean,
required:true
     }
    
      
}, {
    versionKey: false
})


  GeneralHelpSchema.set('toJSON', { virtuals: true });
 


export default mongoose.model("GeneralHelp", GeneralHelpSchema)