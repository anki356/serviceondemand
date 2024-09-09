import express from 'express'
const router=express.Router()
import AuthRouter from "./auth.js"
import ServiceRouter from "./Service.js"
router.use("/admin-panel/",AuthRouter)
router.use("/admin-panel/",ServiceRouter)
export default router