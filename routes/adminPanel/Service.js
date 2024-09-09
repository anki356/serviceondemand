import express from 'express'
import { responseObj } from '../../utils/responseObj.js';
import { body } from 'express-validator';
import validationError from '../../middleware/validationError.js';
import User from "../../models/User.js"

import bcrypt from 'bcrypt'
import authVerify from '../../middleware/authVerify.js';
import Service from "../../models/Service.js"
import upload from '../../utils/upload.js';
import SubService from '../../models/SubService.js';
import UserAddress from '../../models/UserAddress.js';
import Coupon from '../../models/Coupon.js';
const router=express.Router()
const servicevalidation=[
    body('name').notEmpty().withMessage("Service name is required")
  ]
  router.post("/service",authVerify,servicevalidation,validationError,async(req,res)=>{
    const { name } = req.body;
  if(!req.files.icon||!req.files.cover_photo){
return res.json(responseObj(false, null,"Image Icon or cover photo missing"))
  }
  
      // Check if user already exists
     
      // Generate a random password
     
  
      // Hash the password
   
      // Send the password to the user's email
     
  let cover_photo=await upload(req.files.cover_photo)
  let image_icon=await upload(req.files.icon)
    await Service.create({name,cover_photo,image_icon})
        return res.json(responseObj(true,null,"Service Added"))
      
    
  })
  const subservicevalidation=[
    body('isHome').notEmpty().withMessage(("Is Home Required")),
    body('service_id').notEmpty().withMessage("Service Id Is Required"),
    body('rate').notEmpty().withMessage("Rate is Required"),
    body('duration').notEmpty().withMessage("Duration is Required"),
    body('name').notEmpty().withMessage("Name is Required"),
    body('description').notEmpty().withMessage("Description is required"),
    body('features').notEmpty().withMessage("Features is required"),
    body('features.*.name').notEmpty().withMessage("Features name is required"),
    body('features.*.status').notEmpty().withMessage("Features Status is required"),
    body('faq').notEmpty().withMessage("FAQ is required"),
    body('faq.*.question').notEmpty().withMessage("FAQ Question is required"),
    body('faq.*.answer').notEmpty().withMessage("FAQ Answer is required")
  ]
  router.post("/sub-service",authVerify,subservicevalidation,validationError,async(req,res)=>{
   if( !req.files.cover_photo){
      return res.json(responseObj(false, null,"Cover photo missing"))
        }
  req.body.features=JSON.parse(req.body.features)
  req.body.faq=JSON.parse(req.body.faq)
      // Check if user already exists
     
      // Generate a random password
     
  
      // Hash the password
   
      // Send the password to the user's email
     
  req.body.cover_photo=await upload(req.files.cover_photo)

    await SubService.create({...req.body})
        return res.json(responseObj(true,null,"Sub Service Added"))
      
    
  })
  router.post("/add-coupon",authVerify,[body('name').notEmpty().withMessage("Promo Code is required"),body('discount').notEmpty().withMessage("Discount is required"),body('max_value').notEmpty().withMessage("Max Value is required")],validationError,async(req,res)=>{
    await Coupon.create({
      ...req.body
    })
    return res.json(responseObj(true,null,"Coupon Added"))
  })
  export default router