import moment from "moment";
import mongoose from "mongoose";

const SubServiceSchema = new mongoose.Schema({
 
    name: {
        type: String,
        unique: true
    },
  service_id:{
type:mongoose.Schema.Types.ObjectId,
ref:'Service',
required:true
  },
  isHome:{
type:Boolean,
required:true
  },

    createdAt: {
        type: String,
        default:()=> moment().format("YYYY-MM-DDTHH:mm"),
        required: false
    }
 
     ,status:{
        type:Boolean,
        default:true
      },
   rate:   {
type:Number,
required:true
      },
      duration:{
        type:Number,
        required:true

      }
     
    
      
}, {
    versionKey: false
})


  SubServiceSchema.set('toJSON', { virtuals: true });
  SubServiceSchema.virtual('duration_string').get(function () {
    if(this.duration!==undefined&& this.duration!==null) {
 
        return this.duration>60?`${Math.round(moment.duration(duration,'m').asHours())} hours`:`${this.duration} minutes`
    }
    else if (this.durtion===null){
      return null
    }
 })


export default mongoose.model("SubService", SubServiceSchema)