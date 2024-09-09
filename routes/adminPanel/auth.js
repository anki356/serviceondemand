import express from 'express'
import { responseObj } from '../../utils/responseObj.js';
import { body } from 'express-validator';
import validationError from '../../middleware/validationError.js';
import User from "../../models/User.js"

import bcrypt from 'bcrypt'
const router=express.Router()
const signinvalidation=[
    body('email').notEmpty().withMessage("Email is required"),
    body('password').notEmpty().withMessage("Password is required")
  ]
  router.post("/sign-in",signinvalidation,validationError,async(req,res)=>{
    const { email,password } = req.body;
  
  
      // Check if user already exists
      const existingUser = await User.findOne({ email,isAdmin:true });
      if (!existingUser) {
        return res.json(responseObj(false,null,"User Does not Exist. Please Sign up."))
      }
  const passwordResponse=await bcrypt.compare(password,existingUser.password)
  if(!passwordResponse){
    return res.json(responseObj(false,null,"Invalid Password."))
  }
      // Generate a random password
     
  
      // Hash the password
   
      // Send the password to the user's email
     
  
    const token=existingUser.signJWT()
        return res.json(responseObj(true,{token,existingUser},"Sign In Successful"))
      
    
  })
  export default router