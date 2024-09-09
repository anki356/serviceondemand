import jwt from 'jsonwebtoken'
import { responseObj } from '../utils/responseObj.js';
const authVerify=async(req,res,next)=>{
    
        let token = req.header('Authorization');
    
        if (!token) {
            const response = responseObj(false, null, 'Access denied. Token missing.');
            return res.status(200).json(response);
        }
    
        token = token.replace("Bearer ", "");
    
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                console.log(err);
                const response = responseObj(false, null, 'Token has expired.');
                return res.status(200).json(response);
            }

            req.user = user.user; // Store the user data from the token
            next();
        });
    
}
export default authVerify