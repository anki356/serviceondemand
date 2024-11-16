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
const router=express.Router()
const signupemailVaildation=[
    body('email').notEmpty().withMessage("Email is required")
]
const otpVaildation=[
    body('email').notEmpty().withMessage("Email is required"),
    body('otp').notEmpty().withMessage("OTP is required")
]
router.post("/sign-up-email",signupemailVaildation,validationError,async(req,res)=>{
    const { email } = req.body;

  
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.json(responseObj(false,null,"User Already Exists. Please Sign in."))
      }
  
      // Generate a random password
     
  
      // Hash the password
     const otp=generateOTP(4)
 await Otp.create({
    email:email,
    code:otp
  })
      // Send the password to the user's email
     
  
      const content=sendOtp(otp)
     await sendEmail(email,"Your OTP for Email Verification",content)
        return res.json(responseObj(true,otp,"Otp Sent"))
      
    
})
router.post("/verify-otp",otpVaildation,validationError,async(req,res)=>{
    const { email,otp } = req.body;

  
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.json(responseObj(false,null,"User Already Exists. Please Sign in."))
      }
  const otpResponse=await Otp.findOne({
    email:email,
    code:otp
  })
  if(!otpResponse){
    return res.json(responseObj(false,null,"Invalid or Expired OTP."))
  }
      // Generate a random password
     
  
      // Hash the password
   const password=generatePassword()
   const hashedPassword = await bcrypt.hash(password, 10);
 await User.create({
    email:email,
  password:hashedPassword
  })
      // Send the password to the user's email
     
  
      const content=newUserEmail(email,password)
     await sendEmail(email,"Your Auto-Generated Password and Account Instructions",content)
        return res.json(responseObj(true,null,"User registered successfully. Password sent to your email."))
      
    
})
const signinvalidation=[
  body('email').notEmpty().withMessage("Email is required"),
  body('password').notEmpty().withMessage("Password is required")
]
router.post("/sign-in",signinvalidation,validationError,async(req,res)=>{
  const { email,password } = req.body;


    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.json(responseObj(false,null,"User Does not Exists. Please Sign up."))
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
router.post("/reset-password",signupemailVaildation,validationError,async(req,res)=>{
  const { email } = req.body;


    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.json(responseObj(false,null,"User Does not Exists. Please Sign up."))
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const mailOptions = {
        to: req.body.email,
        subject: 'Password Reset',
        html: "./utils/reset-link.ejs",
    };
    const options = { resetToken }
    const userResponse=await User.updateOne({email:req.body.email},{resetToken:resetToken})
   // Create a transporter using the Ethereal account
  sendMailAsync(mailOptions, options)
 return res.json(responseObj(true,null,"Email Sent"))
      // return res.json(responseObj(true,{token,existingUser},"Sign In Successful"))
    
  
})
const passwordValidation=[
  body('password').notEmpty().withMessage("Password is required")
]
router.post("/Change-password/:token",passwordValidation,validationError,async(req,res)=>{
  const { token } = req.params;
  const { password } = req.body;

  const tokenUser = await User.findOne({ resetToken: token });

  if (!tokenUser) {
      return res.render('reset-password', { token, errorMessage: 'Invalid or expired reset token.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await tokenUser.updateOne({
      password: hashedPassword,
      token: null
  });

  // const response = responseJson(true, null, 'Password has changed successfuly', StatusCodes.OK, []);
  return res.render('reset-password-confirmed', { message: 'Password has changed successfuly.' });

  
})


export default router