import { validationResult } from "express-validator";
import { responseObj } from "../utils/responseObj.js";
// responseObj
const validationError=async (req, res,next) => {
    const result = validationResult(req);
console.log(req.body)
    if (!result.isEmpty()) {
        res.json(responseObj(false, null, `${result.errors[0].msg}`, result.array()));
       
    }
    else{
        next()
    }

}
export default validationError