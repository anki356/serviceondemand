import express from 'express'
import { responseObj } from '../../utils/responseObj.js';
import { newUserEmail } from '../../utils/SignUpEmailFormat.js';
import sendEmail from '../../utils/SendEmail.js';
import { body } from 'express-validator';
import validationError from '../../middleware/validationError.js';
import User from "../../models/User.js"
import generatePassword from '../../utils/GeneratePassword.js';
import bcrypt from 'bcrypt'
import { sendOtp } from '../../utils/otp.js';
import generateOTP from '../../utils/generateOtp.js';
import Otp from '../../models/Otp.js';
import crypto from 'crypto'
import { sendMailAsync } from '../../utils/emailTransport.js';
import authVerify from '../../middleware/authVerify.js';
import Search from "../../models/Search.js"
import Service from '../../models/Service.js';
import SubService from '../../models/SubService.js';
import SubServicesRating from '../../models/SubServicesRating.js';
import mongoose from 'mongoose';
import UserAddress from '../../models/UserAddress.js';
import upload from "../../utils/upload.js"
import Order from '../../models/Order.js';
import Support from "../../models/Support.js"
import SupportResponse from "../../models/SupportResponse.js"
const router=express.Router()
router.post("/address",authVerify,[body('flat_no').notEmpty().withMessage("Flat No Is Required"),body('area').notEmpty().withMessage("Area is required"),body('city').notEmpty().withMessage("City Is Required"),body('state').notEmpty().withMessage("State is Required"),body('pincode').isPostalCode('IN').withMessage("Postal Code Invalid"),body('category').isIn(["Home","Other"]).withMessage("Invalid Value")],validationError,async(req,res)=>{
   let no_addresses=await UserAddress.countDocuments({
    user_id:req.user._id
   })
   if(no_addresses===10){
    return res.json(responseObj(false,null,"Max Limit reached of Addresses"))
   }
    await UserAddress.create({
user_id:req.user._id,
...req.body,
default:await UserAddress.findOne({
    user_id:req.user._id
})===null
    })
    return res.json(responseObj(true,null,"Address Added"))
})
router.get("/address-by-id",authVerify,async(req,res)=>{
    let address=await UserAddress.findById(req.query.id)
    return res.json(responseObj(true,address,""))
})
router.get("/default-address",authVerify,async(req,res)=>{
let defaultAddress=await UserAddress.findOne({
    user_id:req.user._id,
    default:true
})
return res.json(responseObj(true,defaultAddress,""))
})
router.patch("/change-address/:id",authVerify,async(req,res)=>{
    await UserAddress.updateOne({
        user_id:req.user._id,
        default:true
    },{
        $set:{
            default:false
        }
    })
    await UserAddress.updateOne({
        _id:req.params.id
    },{
        $set:{
            default:true
        }
    })
    return res.json(responseObj(true,null,"Default Address Changed"))
})

router.get("/my-bookings",authVerify,async(req,res)=>{
    let userAddress=await UserAddress.find({
        user_id:req.user._id
    })
     Order.paginate({
        user_address_id:{$in:userAddress.map((data)=>data._id)}
     },{
        limit:req.query.limit,
        page:req.query.page,
        select:{
           current_status:1,slot_date:1,slot_time_start:1,slot_time_end:1 ,sub_services_quantity:1
        },
        populate:{
            path:"sub_services_quantity.sub_services_id",select:{
                name:1
            }
        }
     },(err,result)=>{
        return res.json(responseObj(true,result,""))
     })
})
router.patch("/address/:id",authVerify,async(req,res)=>{
    await UserAddress.updateOne({
        _id:req.params.id
    },{
        $set:{
            ...req.body
        }
    })
    return res.json(responseObj(true,null,"User Address updated"))
})
router.delete("/address/:id",authVerify,async(req,res)=>{
    await UserAddress.deleteOne({
        _id:req.params.id
    })
    return res.json(responseObj(true,null,"User Address deleted"))
})

router.get("/user",authVerify,async(req,res)=>{
    let userDetails=await User.findOne({
       _id: req.user._id
    },{
        firstname:1,lastname:1,mobile_number:1,dob:1
    })
    return res.json(responseObj(true,userDetails,""))
})
router.patch("/user",authVerify,async(req,res)=>{
    
    await User.updateOne({
        _id: req.user._id
    },{
        $set:{
            ...req.body
        }
    })
    return res.json(responseObj(true,null,"User Details Edited"))
})
router.patch("/change-password",authVerify,[body('password').notEmpty().withMessage("Password is required"),body('old_password').notEmpty().withMessage("Old Password")],validationError,async(req,res)=>{
   let hashed= await bcrypt.hash(req.body.password,10)
   const passwordDetails=await User.findOne({
    _id:req.user._id
   },{
    password:1
   })
   if(!await bcrypt.compare(req.body.old_password,passwordDetails.password)){
    return res.json(responseObj(false,null,"Invalid Password"))
   }
    await User.updateOne({
        _id: req.user._id
    },{
        $set:{
            password:hashed
        }
    })
    return res.json(responseObj(true,null,"Password Changed"))
})
router.get("/booking-details",authVerify,async(req,res)=>{
    let booking=await Order.findOne({
        _id:req.query.id
    }).populate({
        path:"sub_services_quantity.sub_services_id",
        select:{
            name:1
        }
    }).populate({
        path:"user_address_id"
    }).populate({
        path:"payment_id",
        select:{
            net_amount:1
        }
    })
    let status=["Slot to be Selected","Finding Professional","Assigned Professional","Booking Cancelled","Job Complete"]
    let currentStatus=status.findIndex((data)=>{
return data===booking.current_status
    })
    let nextStatus=null
    if(currentStatus!==status.length-1){
        nextStatus=status[currentStatus+1]
    }
return res.json(responseObj(true,{booking,nextStatus},""))
    
})
router.post("/chat",authVerify,async(req,res)=>{
   let chatDetails=await Support.findOne({
    user_id:req.user._id,
    is_open:true
   })
   if(!chatDetails){
    chatDetails=await Support.create({
        user_id:req.user._id,
        is_open:true
    })
   }
const response=   await SupportResponse.create({
    is_sender:true,
    support_id:chatDetails._id,
    response:req.body.response??null,
    response_document_path:req.files.attachment?await upload(req.files.attachment):null,
    response_document:req.files.attachment?req.files.attachment.name:null
   })
   return res.json(responseObj(true,{chatDetails,response},""))
})
router.get("/chat-Details",authVerify,async(req,res)=>{
    let chatDetails=await Support.findOne({
        user_id:req.user._id,
        is_open:true
    })
    let response=await SupportResponse.findOne({
        support_id:chatDetails._id
    })
    return res.json(responseObj(true,{chatDetails,response},""))
})

export default router