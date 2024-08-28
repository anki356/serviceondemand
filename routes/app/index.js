import express from 'express'
const router=express.Router()
import AuthRouter from "./auth.js"
router.use("/app/",AuthRouter)
export default router