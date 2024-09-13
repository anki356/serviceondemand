import moment from "moment";
import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import mongoosePaginate from 'mongoose-paginate-v2'
const ServiceSchema = new mongoose.Schema({
 
    name: {
        type: String,
        unique: true
    },
    cover_photo:{
        type: String,
        required:true
    },image_icon:{
        type: String,
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
      }
     
    
      
}, {
    versionKey: false
})


  ServiceSchema.set('toJSON', { virtuals: true });
  ServiceSchema.virtual('icon_image_url').get(function () {
    if(this.image_icon!==undefined&& this.image_icon!==null) {
 
        return process.env.CLOUD_API+"/static/"+this.image_icon
    }
    else if (this.image_icon===null){
      return null
    }
 })
 ServiceSchema.virtual('cover_photo_url').get(function () {
    if(this.cover_photo!==undefined&& this.cover_photo!==null) {
 
        return process.env.CLOUD_API+"/static/"+this.cover_photo
    }
    else if (this.cover_photo===null){
      return null
    }
 })
ServiceSchema.plugin(mongoosePaginate)
ServiceSchema.plugin(mongooseAggregatePaginate)

export default mongoose.model("Service", ServiceSchema)