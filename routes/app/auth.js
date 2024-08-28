import express from 'express'
import { responseObj } from '../../utils/responseObj.js';
import { newUserEmail } from '../../utils/SignUpEmailFormat.js';
import sendEmail from '../../utils/SendEmail.js';
import { body } from 'express-validator';
import validationError from '../../middleware/validationError.js';
import User from "../../models/User.js"
import generatePassword from '../../utils/GeneratePassword.js';
import bcrypt from 'bcrypt'
const router=express.Router()
const signupemailVaildation=[
    body('email').notEmpty().withMessage("Email is required")
]
router.post("/sign-up-email",signupemailVaildation,validationError,async(req,res)=>{
    const { email } = req.body;

  
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.json(responseObj(false,null,"User Already Exists. Please Sign in."))
      }
  
      // Generate a random password
      const password = generatePassword();
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create and save the new user
      const newUser = new User({ email, password: hashedPassword });
      await newUser.save();
  
      // Send the password to the user's email
     
  
      const content=newUserEmail(email,password)
     await sendEmail(email,"Your Auto-Generated Password and Account Instructions",content)
        return res.json(responseObj(true,null,"User registered successfully. Password sent to your email."))
      
    
})
export default router