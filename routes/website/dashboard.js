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
const router=express.Router()

router.get("/services",async(req,res)=>{
  let query={}

  let options={
    limit:req.query.limit,
    page:req.query.page,
    
  }
  let pipeline=Service.aggregate([
    {
      $lookup: {
        from: 'subservices', // The name of the SubService collection
        localField: '_id',
        foreignField: 'service_id',
        as: 'subservices'
      }
    },
    {
      $addFields: {
        subServiceCount: { $size: '$subservices' } // Count the number of subservices
      }
    },
    {
      $project: {
        name: 1,
        icon_image_url: {
          $cond: {
            if: { $ne: ['$image_icon', null] },
            then: { $concat: [process.env.CLOUD_API, '/static/', '$image_icon'] },
            else: null
          }
        },
        subServiceCount: 1
      }
    },{
      $sort:{
        _id:-1
      }
    }
  ]);
 await Service.aggregatePaginate(pipeline,options,(err,results)=>{
  return res.json(responseObj(true,results,""))
 })
 
      // Generate a random password
     
  
      // Hash the password
 
      // Send the password to the user's email
     
  
     
        
      
    
})
router.get("/most-bought-services",async(req,res)=>{
  const subservices=await SubService.aggregate([
    {
      $lookup: {
        from: 'orders', // The 'Order' collection
        localField: '_id', // The _id field of 'SubService'
        foreignField: 'sub_services_id', // The sub_services_id field in 'Order'
        as: 'orders',
        pipeline: [], // Empty pipeline to preserve null or empty results
      }
    },
    {
      $addFields: {
        orderCount: { $size: '$orders' } // Count the number of orders for each sub-service
      }
    },{
      $match:{
        orderCount:{
          $gte:1
        }
      }
    },
    {
      $lookup: {
        from: 'subservicesratings', // The 'SubServicesRating' collection
        localField: '_id', // The _id field of 'SubService'
        foreignField: 'sub_services_id', // The sub_services_id field in 'SubServicesRating'
        as: 'ratings',
        pipeline: [], // Empty pipeline to preserve null or empty results
      }
    },
    {
      $addFields: {
        averageRating: {
            $ifNull: [{ $avg: '$ratings.rating' }, 0] // Set to 0 if averageRating is null
          }, // Calculate the average rating
        reviewCount: { $size: '$ratings' }, // Count the number of reviews
        cover_photo_url: {
          $cond: {
            if: { $and: [{ $ne: ['$cover_photo', null] }, { $ne: ['$cover_photo', ''] }] },
            then: { $concat: [process.env.APP_URL, 'static/', '$cover_photo'] },
            else: null
          }
        }
      }
    },
    {
      $sort: { orderCount: -1 } // Sort by the number of orders in descending order
    },
    {
      $limit: 5 // Limit to the top 5 results
    },
    {
      $project: {
        name: 1,
        averageRating: 1,
        reviewCount: 1,
        rate: 1,
        cover_photo_url: 1 // Include the cover_photo_url in the output
      }
    }
  ])
  
      return res.json(responseObj(true,subservices,""))
      
})
router.get("/home-services",authVerify,async(req,res)=>{
  const services=await SubService.find({
    isHome:true
  },{
    name:1,
    cover_photo:1
  }).sort({
    _id:-1
  }).limit(5)
  return res.json(responseObj(true,services,""))
})
router.get("/search",async(req,res)=>{
  let isSearch=await Search.findOne({
    title:req.query?.keyword
  })
  if(!isSearch&&req.query.keyword!==""){
    await Search.create({
      title:req.query.keyword
    })
  }
  else if (req.query.keyword!==""){
    await Search.updateOne({
      title:req.query.keyword
    },{
      $inc:{
        count:1
      }
    })
  }

  let query={
    name:{
      $regex:req.query?.keyword,
      $options:"i"
    }
  }
  let services=await 
 Service.aggregate([
  {
    $match:{
      ...query
    }
  },{
    $lookup:{
      from:"subservices",
      localField:"_id",
      foreignField:"service_id",
      pipeline:[
        {
          $lookup: {
            from: 'subservicesratings', // The 'SubServicesRating' collection
            localField: '_id', // The _id field of 'SubService'
            foreignField: 'sub_services_id', // The sub_services_id field in 'SubServicesRating'
            as: 'ratings',
            pipeline: [], // Empty pipeline to preserve null or empty results
          }
        },
        {
          $addFields: {
            averageRating: {
                $ifNull: [{ $avg: '$ratings.rating' }, 0] // Set to 0 if averageRating is null
              }, // Calculate the average rating
            reviewCount: { $size: '$ratings' }, // Count the number of reviews
            cover_photo_url: {
              $cond: {
                if: { $and: [{ $ne: ['$cover_photo', null] }, { $ne: ['$cover_photo', ''] }] },
                then: { $concat: [process.env.APP_URL, 'static/', '$cover_photo'] },
                else: null
              }
            }
          }
        }
      ],
      as:"sub_services"
    }
  }
 ])
 return res.json(responseObj(true,services,""))
})
router.get("/trending-searches",authVerify,async(req,res)=>{
  let results=await Search.find({}).sort({
    count:-1
  }).limit(10)
  return res.json(responseObj(true,results,""))
})
router.get("/top-services",authVerify,async(req,res)=>{
  const services=await Service.aggregate([
    {
      $lookup: {
        from: 'subservices', // The 'Order' collection
        localField: '_id', // The _id field of 'SubService'
        foreignField: 'services_id', // The sub_services_id field in 'Order'
        as: 'subservices',
        pipeline: [], // Empty pipeline to preserve null or empty results
      }
    },
   
    {
      $lookup: {
        from: 'subservicesratings', // The 'SubServicesRating' collection
        localField: '_id', // The _id field of 'SubService'
        foreignField: 'sub_services._id', // The sub_services_id field in 'SubServicesRating'
        as: 'ratings',
        pipeline: [], // Empty pipeline to preserve null or empty results
      }
    },
    {
      $addFields: {
        // Count the number of reviews
        cover_photo_url: {
          $cond: {
            if: { $and: [{ $ne: ['$cover_photo', null] }, { $ne: ['$cover_photo', ''] }] },
            then: { $concat: [process.env.APP_URL, '/static/', '$cover_photo'] },
            else: null
          }
        },
        avgRating: {
          $cond: {
            if: { $gt: [{ $size: '$ratings' }, 0] }, // Check if there are any ratings
            then: { $avg: '$ratings.rating' }, // Calculate the average rating
            else: null
          }
        }
      }
    },
    {
      $sort: { avgRating: -1 } // Sort by the number of orders in descending order
    },
    {
      $limit: 7// Limit to the top 5 results
    },
    {
      $project: {
        name: 1,
      

        cover_photo_url: 1 // Include the cover_photo_url in the output
      }
    }
  ])
  return res.json(responseObj(true,services,""))
})
export default router