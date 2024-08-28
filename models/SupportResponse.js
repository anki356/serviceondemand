import moment from "moment";
import mongoose from "mongoose";

const SupportResponseSchema = new mongoose.Schema({
 
    support_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Support",
        required: true
    },
 

    createdAt: {
        type: String,
        default:()=> moment().format("YYYY-MM-DDTHH:mm"),
        required: false
    }
 
     ,is_sender:{
        type:Boolean,
        default:true
      },
      response:{
        type:String
        
      },
      response_document:{
        type:String
       
      },
      response_document_path:{
type:String
      }
     
    
      
}, {
    versionKey: false
})


  SupportResponseSchema.set('toJSON', { virtuals: true });
  SupportResponseSchema.virtual('response_document_url').get(function () {
    if(this.response_document_path!==undefined&& this.response_document_path!==null) {
 
        return process.env.APP_URL+"/static/"+this.response_document_path
    }
    
 })


export default mongoose.model("SupportResponse", SupportResponseSchema)