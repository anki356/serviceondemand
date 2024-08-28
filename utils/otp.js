
import {  marked } from "marked"
const sendOtp=(otp)=>{


let content=`Hello User,

To verify your email address, please use the following One-Time Password (OTP):

**${otp}**

This OTP is valid for 5 minutes. Please do not share this OTP with anyone.

If you did not request this verification, please ignore this email.

Thank you,  
*The Service On Demand Team*

`
return  marked.parse(content) 
}
export {sendOtp}






