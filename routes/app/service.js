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
const router=express.Router()
import Payment from "../../models/Payment.js"
import OrderHistory from "../../models/OrderHistory.js"
router.get("/coupons",authVerify,async(req,res)=>{
    let user_address_id=await UserAddress.find({
        user_id:req.user._id
    })
   let couponsUsed=await Order.find({
user_address_id:{
    $in:user_address_id.map((data)=>{
        return data._id
    })
}
    })
await Coupon.paginate({
        _id:{
            $nin:couponsUsed.map((data)=>data.id)
        }
    },{
        limit:req.query.limit,
        page:req.query.page
    },(err,couponDetails)=>{
        return res.json(responseObj(true,couponDetails,null))
    })
  
})
router.post("/record-help",authVerify,[body('text').notEmpty().withMessage("Response is required"),body('helpful').notEmpty().withMessage("Helpful is required")],validationError,async(req,res)=>{
    let helpful=await GeneralHelp.findOneAndUpdate({
        text:req.query.text,
        user_id:req.user._id
    },{
        $set:{
            helpful:req.body.helpful
        }
    })
    if(!helpful){
      helpful=  await GeneralHelp.create({
        ...req.body,user_id:req.user._id
      })
    }
    else{
        helpful=await GeneralHelp.findOne({
            text:req.query.text,
        user_id:req.user._id
        })
    }
    return res.json(responseObj(true,helpful,""))
})

router.post("/order",authVerify,[body('sub_services_quantity').notEmpty().isArray().withMessage("Sub Service Id Array is required"),body('address_id').notEmpty().withMessage("Address is Required"),body('amount').isFloat({min:1}).notEmpty().withMessage("Amount is Required"),body('taxes').notEmpty().withMessage("Taxes is required"),body('mode_of_payment').notEmpty().isIn("Online","Offline").withMessage("Mode of Payment required"),body('loyalty_points_discount').notEmpty().withMessage("Loyalty Points Discount is Required"),body('discount').notEmpty().withMessage("Coupon Discount is Required")],async(req,res)=>{
    let paymentDetails
    let loyalty_points=0
    if(req.body.loyalty_points_discount){
let loyalty_points_details=await User.findOne({
    _id:req.user._id
},{
    loyalty_points:1
})
loyalty_points=loyalty_points_details.loyalty_points
    }
    if(req.body.mode_of_payment==="Online"){
        paymentDetails= await Payment.findOne({
            trx_ref_no:req.body.trx_ref_no
        })
        if(paymentDetails){
            return res.json(responseObj(false,null,"Duplicate trx ref no"))
        }
    }
    let discount=0
if(req.body.coupon_id){
  let discountDetails=await Coupon.findOne({
    _id:req.body.coupon_id
  })
  discount=discountDetails.discount
}
     paymentDetails=await Payment.create({
     coupon_id:req.body.coupon_id?req.body.coupon_id:null,
     taxes:req.body.taxes,
     amount:req.body.amount,
     net_amount:req.body.amount+req.body.taxes-discount-loyalty_points,
     mode_of_payment:req.body.mode_of_payment,
     status:req.body.mode_of_payment==="Online"?"Paid":"Pending",
     trx_ref_no:req.body.mode_of_payment==="Online"?req.body.trx_ref_no:null



        })
        let orderArray=[]
for(let data of req.body.sub_services_quantity ){
   let orderDetails= await Order.create({
        user_address_id:req.body.address_id,
        sub_services_quantity:data,
        payment_id:paymentDetails._id,
        current_status:"Slot to be Selected",
        loyalty_points_discount:loyalty_points,
        discount:req.body.discount
    })
    await OrderHistory.create({
        order_id:orderDetails._id,
        status:"Slot to be Selected"
    })
    orderArray.push(orderDetails)
}

await Cart.deleteOne({
    user_id:req.user._id
})
await User.updateOne({
    _id:req.user._id
},{
    $inc:{
        loyalty_points:100
    }
})
return res.json(responseObj(true,orderArray,"New Service Request Raised"))
})
router.get("/address",authVerify,async(req,res)=>{
    let address=await UserAddress.find({
      user_id:req.user._id
    },{
        status:0,createdAt:0
    })
    return res.json(responseObj(true,address,""))
  })
const ObjectId=mongoose.Types.ObjectId
import Cart from "../../models/Cart.js"
import UserAddress from '../../models/UserAddress.js';
import Order from '../../models/Order.js';
import moment from 'moment';
import { start } from 'repl';
import Coupon from '../../models/Coupon.js';
import GeneralHelp from '../../models/GeneralHelp.js';
router.get("/service-details",authVerify,async(req,res)=>{
    let serviceDetails=await Service.findOne({
        _id:req.query.id
    },{
        image_icon:0
    })
  
    return res.json(responseObj(true,{serviceDetails},""))
})
router.get("/sub-service-list",authVerify,async(req,res)=>{
    let subservicesList = SubService.aggregate([
        {
            $match: {
                service_id: new ObjectId(req.query.id) // Match the specific service ID
            }
        },
        {
            $lookup: {
                from: 'carts', // Lookup in the 'carts' collection
                let: { subServiceId: "$_id" }, // Set subservice ID to match
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$user_id", new ObjectId(req.user._id)] } // Match the cart to the user
                        }
                    },
                    {
                        $unwind: "$sub_services_quantity" // Unwind the sub_services_quantity array
                    },
                    {
                        $match: {
                            $expr: { $eq: ["$sub_services_quantity.sub_services_id", "$$subServiceId"] } // Match subservice ID from cart
                        }
                    },
                    {
                        $project: {
                            quantity: "$sub_services_quantity.quantity" // Project only the quantity
                        }
                    }
                ],
                as: "cartData" // Store the lookup result in 'cartData'
            }
        },
        {
            $addFields: {
                cover_photo_url: {
                    $cond: {
                        if: { $and: [{ $ne: ['$cover_photo', null] }, { $ne: ['$cover_photo', ''] }] }, // Check if cover photo exists
                        then: { $concat: [process.env.CLOUD_API, '/static/', '$cover_photo'] }, // Concatenate cover photo URL
                        else: null
                    }
                },
                quantity: {
                    $cond: {
                        if: { $gt: [{ $size: "$cartData" }, 0] }, // If cartData has entries
                        then: { $first: "$cartData.quantity" }, // Use the first quantity found
                        else: 0 // If no cart data, default to 0
                    }
                }
            }
        },
        {
            $project: {
                name: 1,
                cover_photo_url: 1,
                rate: 1,
                duration: 1,
                description: 1,
                quantity: 1, // Include the quantity in the projection
                _id: 1
            }
        }
    ]);
    
    
    let options={
        limit:req.query.limit,
        page:req.query.page,
       
      }
    SubService.aggregatePaginate(subservicesList,options,(err,results)=>{
        return res.json(responseObj(true,results,""))
    })
})
const cartValidation=
    [body('sub_services_id').notEmpty().withMessage("Sub Service is required")]

router.post("/add-to-cart",authVerify,cartValidation,validationError,async(req,res)=>{
let cartDetails=await Cart.findOne({
    user_id:req.user._id,
    sub_services_quantity:{
        $elemMatch:{
            "sub_services_id":req.body.sub_services_id
        }
    }
})
if(cartDetails){
    return res.json(responseObj(false,null,"Item is already in Cart"))
}
let subservices=await SubService.findOne({
    _id:req.body.sub_services_id
})
   cartDetails=await Cart.findOne({
    user_id:req.user._id
   })
   if(!cartDetails){
    cartDetails=await Cart.create({
        user_id:req.user._id,
        sub_services_quantity:{
            sub_services_id:req.body.sub_services_id,
            quantity:1
        },
        amount:subservices.rate
    })
   }else{

    await Cart.updateOne({
        user_id:req.user._id
    },{
        $push:{
            sub_services_quantity:{
                sub_services_id:req.body.sub_services_id,
            quantity:1
            }
        }
    })
    await Cart.updateOne({
        user_id:req.user._id
    },{
        $inc:{
            amount:subservices.rate
        }
    })
    cartDetails=await Cart.findOne({
        user_id:req.user._id
    })

   }
   return res.json(responseObj(true,cartDetails,""))
})
router.patch("/increase-quantity",authVerify,cartValidation,validationError,async(req,res)=>{
    let cartDetails=await Cart.findOne({
        user_id:req.user._id,
        sub_services_quantity:{
            $elemMatch:{
                "sub_services_id":req.body.sub_services_id
            }
        }
    })
    if(!cartDetails){
        return res.json(responseObj(false,null,"Item is not in Cart"))
    }
    let subservices=await SubService.findOne({
        _id:req.body.sub_services_id
    })
    
    await Cart.updateOne({
        user_id:req.user._id,"sub_services_quantity.sub_services_id":req.body.sub_services_id
    },{
        
            $inc: { "sub_services_quantity.$.quantity": 1 }
        
    })  
    await Cart.updateOne({
        user_id:req.user._id
    },{
        $inc:{
            amount:subservices.rate
        }
    })
    cartDetails=await Cart.findOne({
        user_id:req.user._id
    })

   
   return res.json(responseObj(true,cartDetails,""))
})
router.patch("/decrease-quantity",authVerify,cartValidation,validationError,async(req,res)=>{
    let cartDetails=await Cart.findOne({
        user_id:req.user._id,
        sub_services_quantity:{
            $elemMatch:{
                "sub_services_id":req.body.sub_services_id
            }
        }
    })
    if(!cartDetails){
        return res.json(responseObj(false,null,"Item is not in Cart"))
    }
    let subservices=await SubService.findOne({
        _id:req.body.sub_services_id
    })
    const subService = cartDetails.sub_services_quantity.find(
        (item) => item.sub_services_id.equals(req.body.sub_services_id)
    );
    if(subService.quantity>1){
        await Cart.updateOne({
            user_id:req.user._id,"sub_services_quantity.sub_services_id":req.body.sub_services_id
        },{
            
                $inc: { "sub_services_quantity.$.quantity": -1 }
            
        })  
        await Cart.updateOne({
            user_id:req.user._id
        },{
            $inc:{
                amount:-subservices.rate
            }
        })
    }
    else{
        await Cart.updateOne(
            {
                user_id: req.user._id
            },
            {
                $pull: {
                    sub_services_quantity: { sub_services_id: req.body.sub_services_id }
                }
            }
        );
        await Cart.updateOne({
            user_id:req.user._id
        },{
            $inc:{
                amount:-subservices.rate
            }
        })
    }
  
    cartDetails=await Cart.findOne({
        user_id:req.user._id
    })
if(cartDetails.sub_services_quantity.length===0){
    await Cart.deleteOne({
        user_id:req.user._id
    })
    return res.json(responseObj(true,null,""))
}
   
   return res.json(responseObj(true,cartDetails,""))
})
router.get("/duration",authVerify,async(req,res)=>{
    let durationDetails=await Order.findOne({
        _id:req.query.order_id
    }).populate({
        path:"sub_services_quantity.sub_services_id"
    })
    let totalDuration=0
    for(const data of durationDetails.sub_services_quantity){
        totalDuration+=data.sub_services_id.duration*data.quantity
    }
    return res.json(responseObj(true,totalDuration,""))
})
router.get("/percentage",authVerify,async(req,res)=>{
    let totalUseraApp=await User.countDocuments({
       user_type:"General" ,
       isAdmin:{
        $in:[null,false]
       }
    })
    let UserFoundHelpful=await GeneralHelp.countDocuments({
        helpful:true,
        text:req.query.text
    })
    let percentage=0
    console.log(totalUseraApp)
    if(totalUseraApp>0){
percentage=UserFoundHelpful/totalUseraApp
    }
    return res.json(responseObj(true,percentage,""))
})
router.get("/cart-details",authVerify,async(req,res)=>{
    let cartDetails=await Cart.findOne({
        user_id:req.user._id
    }).populate({
        path:"sub_services_quantity.sub_services_id",
        select:{
            cover_photo:1,name:1,rate:1,duration:1
        },

        populate:{
            path:"service_id", select:{
                name:1
            }
        }
    })
    let groupedServices = {}
    if(!cartDetails){
        return res.json(responseObj(true,[],""))
    }
    cartDetails.sub_services_quantity.forEach(item => {
        const subService = item.sub_services_id;
        const serviceId = subService.service_id._id;
    
        if (!groupedServices[serviceId]) {
            groupedServices[serviceId] = {
                service: subService.service_id,
                sub_services: []
            };
        }
    
        // Add sub-service and its quantity
        groupedServices[serviceId].sub_services.push({
            sub_service: subService,
            quantity: item.quantity,
            amount:subService.rate*item.quantity
        });

    });

   
    // Convert the grouped services object back to an array if needed
    let groupedServicesArray = Object.values(groupedServices);
   let result ={totalDocs: groupedServicesArray.length,
    limit: Number(req.query.limit),
    page: Number(req.query.page),
    totalPages: Math.ceil(groupedServicesArray.length/Number(req.query.limit)),
    pagingCounter: (Number(req.query.page) - 1) * Number(req.query.limit) + 1,
    hasPrevPage: Number(req.query.page) > 1,
    hasNextPage: Number(req.query.page) < Math.ceil(groupedServicesArray.length/Number(req.query.limit)),
    prevPage: Number(req.query.page) > 1 ? Number(req.query.page) - 1 : null,
    nextPage: Number(req.query.page) < Math.ceil(groupedServicesArray.length/Number(req.query.limit)) ? Number(req.query.page) + 1 : null}
    return res.json(responseObj(true,{result:{docs:result.filter((data,index)=>index>=(Number(page)-1)*Number(limit)&&index<=((Number(page)-1)*Number(limit))+Number(limit)-1)},amount:cartDetails.amount},""))
})
router.patch("/remove-item",authVerify,cartValidation,validationError,async(req,res)=>{
    let cartDetails=await Cart.findOne({
        user_id:req.user._id,
        sub_services_quantity:{
            $elemMatch:{
                "sub_services_id":req.body.sub_services_id
            }
        }
    })
    if(!cartDetails){
        return res.json(responseObj(false,null,"Item is not in Cart"))
    }
    await Cart.updateOne(
        {
            user_id: req.user._id
        },
        {
            $pull: {
                sub_services_quantity: { sub_services_id: req.body.sub_services_id }
            }
        }
    );
    cartDetails=await Cart.findOne({
        user_id:req.user._id
    })
if(cartDetails.sub_services_quantity.length===0){
    await Cart.deleteOne({
        user_id:req.user._id
    })
}
    return res.json(responseObj(true,null,"Cart Item is deleted"))
})
router.get('/slots-date',authVerify,async(req,res)=>{
    let daysArray=[
        
    ]
    let dayArray=["Sun","Mon","Tue","Wed","Thu","Fri","Sat",]
    for(let i=0;i<4;i++){
        daysArray.push({
            date:moment().add(i,'d').date(),
            day:dayArray[moment().add(i,'d').day()]
        })
    }
    return res.json(responseObj(true,daysArray,""))
})
router.post("/book-slots",authVerify,[body('slots_date').notEmpty().withMessage("Slots Date is Required"),body('order_id').notEmpty().withMessage("Order Id is Required"),body('slot_time_start').notEmpty().withMessage("Slots Time Start is Required"),body('end_time').notEmpty().withMessage("Slots Time End is required")],validationError,async(req,res)=>{
    let Professional=await User.find({
        user_type:"Professional"
    })

    let durationDetails=await Order.findOne({
        _id:req.body.order_id
    }).populate({
        path:"sub_services_quantity.sub_services_id"
    })
    let totalDuration=0
    for(const data of durationDetails.sub_services_quantity){
        totalDuration+=data.sub_services_id.duration*data.quantity
    }
    let isProfessional=true
    let timeslotPassed=true
    let start_time=req.body.slot_time_start
       let end_time=moment(req.body.slot_time_start,"HH:mm:ss").add(totalDuration,'m').format("HH:mm:ss")
    while(true){
        
       if(moment(start_time,"HH:mm:ss").diff(moment(req.body.end_time,"HH:mm:ss"))>0){
        break;
       }
       if(moment(req.body.slots_date+"T"+start_time).diff(moment())<0){
        
        start_time=end_time
        end_time=moment(start_time,"HH:mm:ss").add(totalDuration,'m').format("HH:mm:ss")
    continue
       }
        let professionalBusy=await Order.find({
            slot_date:req.body.slots_date,
           $or:[
            {
                slot_time_start:{
                    $lte:start_time
                },
                slot_time_end:{
                    $gte:end_time
                }
            },{
                slot_time_start:{
                    $gte:start_time
                },
                slot_time_start:{
                    $lte:end_time
                },
              
            },
            {
                slot_time_start:{
                    $gte:start_time
                },
                slot_time_end:{
                    $lte:end_time
                }
            },
            {
                slot_time_end:{
                    $gte:start_time
                },
                slot_time_end:{
                    $lte:end_time
                }
            },
           
    
           ]
        })
        if(Professional.length-professionalBusy.length===0){
    isProfessional=false
        }
        else{
            isProfessional=true
            timeslotPassed=false
            break
        }
        start_time=end_time
        end_time=moment(start_time,"HH:mm:ss").add(totalDuration,'m').format("HH:mm:ss")

    }
    if(!isProfessional){
        return res.json(responseObj(false,null,"No Professional is free in this time slot.Please Select another"))
    }
    if(timeslotPassed){
        return res.json(responseObj(false,null,"Time Slot has passed. Please Select Another"))
    }

    
  await Order.updateOne({
    _id:req.body.order_id
  },{
    $set:{
        
        slot_date:req.body.slots_date,
                slot_time_start:start_time,
              slot_time_end:end_time,
              current_status:"Finding Professional"
    }
  })
  return res.json(responseObj(true,null,"Slot Booked"))
})

router.get("/sub-service-details",authVerify,async(req,res)=>{
    const subServiceDetails=await SubService.findOne({
        _id:req.query.id
    })
    let reviews = await SubServicesRating.aggregate([
        {
            $match:{sub_services_id:new ObjectId(req.query.id),
          
            
            }
        },
      
        {
            $group: {
                _id: '$sub_services_id', // Group reviews by teacher
                averageRating: { $avg: '$rating' }, // Calculate the average rating for each teacher,
               
                no_of_reviews:{$sum:1},
                
            },
        },
        {
            $project:{
                _id:1,
                averageRating:1,
                no_of_reviews:1
            }
        }
    ])
        if (reviews.length===0){
            reviews=
                {_id:req.query.id,
                averageRating:0,
                no_of_reviews:0
            }
            
        }
        else{
            reviews=reviews[0]
        }
        let reviewCategorization=await SubServicesRating.aggregate([
            {
                $match:{sub_services_id:new ObjectId(req.query.id),
              
                }
            },
            {
                $group:{
                    _id:"$rating",
                    no_of_reviews:{
                        $sum:1
                    }
                }
            },{
                $project:{
                    _id:1,
                    no_of_reviews:1
                }
            }
        ])
        let reviewArray=[]
        for (let i=1;i<=5;i++){

            let index=reviewCategorization.findIndex((data)=>{
                return data._id==i
            })
            if(index!==-1){
        
            
            reviewArray.push({
                rating:i,
                no_of_reviews:reviewCategorization[index].no_of_reviews,
                percentage:reviewCategorization[index].no_of_reviews/totalReviews*100
            })
        }
        else{
            reviewArray.push({
                rating:i,
                no_of_reviews:0,
                percentage:0
            })  
        }
                }
       
return res.json(responseObj(true,{reviews,reviewArray,subServiceDetails},""))
})
router.get("/ratings",authVerify,async(req,res)=>{
   await SubServicesRating.paginate({
        sub_services_id:req.query.id
    },{
        limit:req.query.limit,page:req.query.page,
        sort:{
            rating:-1
        },
        populate:{
            path:"user_id"
        }
    },(err,result)=>{
        return res.json(responseObj(true,result,""))
    })

})
router.get("/loyalty-points",authVerify,async(req,res)=>{
    const loyalty_points_details=await User.findOne({
        _id:req.user._id
    },{loyalty_points:1})
    return res.json(responseObj(true,loyalty_points_details,""))
})
router.get("/order-details",authVerify,async(req,res)=>{
    let booking=await Order.findOne({
        _id:req.query.id
    },{
        slots_date:1,slot_time_start:1,sub_services_quantity:1,cover_photo:1
    }).populate({
        path:"sub_services_quantity.sub_services_id",
        select:{
            name:1,duration:1,rate:1
        }
    }).populate({
        path:"user_address_id"
    })
    return res.json(responseObj(true,{booking},""))
})
export default router