import express from 'express'
const router=express.Router()
// import AuthRouter from "./auth.js"
import Dashboard from "./dashboard.js"
import ServiceRouter from "./service.js"
// import ProfileRouter from "./Profile.js"
// router.use("/app/",AuthRouter)
router.use("/website/",Dashboard)
router.use("/website/",ServiceRouter)
// router.use("/app/",ProfileRouter)
export default router