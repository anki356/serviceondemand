import moment from "moment";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
const UserSchema = new mongoose.Schema({
 
    email: {
        type: String,
        unique: true,
        required:true
    },
    firstname:{
        type:String,
        default:null
    },
    lastname:{
type:String,
default:null
    },
    password: {
        type: String,
        
    },
    dob:{
type:String,
default:null
    },
    mobile_number: {
        type: Number,
        default:null
       
    },
  isAdmin:{
    type:Boolean,
    default:null
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
     ,
    resetToken:{
type:String
    }
      
}, {
    versionKey: false
})

UserSchema.methods.signJWT =function () {
    const user = this;
    if (user) {
      user.password = undefined;
      user.createdAt = undefined;
    }

    return jwt.sign({ user }, process.env.JWT_SECRET);
  }
  UserSchema.set('toJSON', { virtuals: true });
 


export default mongoose.model("User", UserSchema)