
import {  marked } from "marked"
const newUserEmail=(email,password)=>{


let content=`Hello user,

Thank you for signing up with us! Your account has been created successfully.

**Your auto-generated password is:**

**${password}**

For security reasons, we strongly recommend that you change your password as soon as possible.

**To change your password, follow these steps:**

1. Reset your account using the ${email} and follow the instructions
assistance, feel free to contact our support team.

Thank you,  
*The Service On Demand Team
*
`
return  marked.parse(content) 
}
export {newUserEmail}

