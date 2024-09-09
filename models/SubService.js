import moment from "moment";
import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2'
const featureSchema=new mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  status:{
    type:Boolean,
    required:true
  }
})
const faqSchema=new mongoose.Schema({
  question:{
    type:String,
    required:true
  },
  answer:{
    type:String,
    required:true
  }
})

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
    },
    cover_photo:{
      type: String,
      required:true
  },
     status:{
        type:Boolean,
        default:true
      },
   rate:   {
type:Number,
required:true
      },
      features:{
type:[featureSchema]
      },
      faq:{
type:[faqSchema]
      },
      duration:{
        type:Number,
        required:true

      },
      description:{
        type:String,
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
 SubServiceSchema.virtual('cover_photo_url').get(function () {
  if(this.cover_photo!==undefined&& this.cover_photo!==null) {

      return process.env.CLOUD_API+"/static/"+this.cover_photo
  }
  else if (this.cover_photo===null){
    return null
  }
})
SubServiceSchema.plugin(mongoosePaginate)

export default mongoose.model("SubService", SubServiceSchema)