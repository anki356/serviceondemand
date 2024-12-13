
import express from "express";
const app = express();
import cors from "cors";
import http from "http";
import mongoose from "mongoose";
const server = http.createServer(app);
import dotenv from "dotenv";
import nodeCron from 'node-cron'
import fileUpload from 'express-fileupload'
import path from "path";
import fs from 'fs'
import "express-async-errors";

// import fileUpload from 'express-fileupload'
dotenv.config({ path: `.env.${process.env.NODE_ENV?.trim() || 'production'}` });


const router=express.Router()
// app.use(upload.any())
 app.use(
    express.json({  limit: "500mb" })
  );
  app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    useTempFiles: true,
    tempFileDir:path.resolve()+ '/storage/temp',
    parseNested: true
  }))
  app.use(express.urlencoded({extended: true, parameterLimit: 100000}))
 app.use(cors());
 app.use('/static', express.static('./storage/uploads/'));
 import AppRouter from "./routes/app/index.js"
 import AdminPanelRouter from "./routes/adminPanel/index.js"
import websiteRouter from "./routes/website/index.js"
import errorHandlerMiddleware from "./middleware/errorHandlerMiddleware.js";
import notFound from "./middleware/notFound.js";
app.use("/api/",AppRouter)
app.use("/api/",AdminPanelRouter)

app.use("/api/",websiteRouter)
app.set('view engine', 'ejs');

app.set('views', "./utils" + '/views');
app.get('/reset-password/:token', (req, res) => {
  const token = req.params.token;
  return res.render('reset-password', { token, errorMessage: null });
});

app.use(errorHandlerMiddleware);
app.use(notFound);
 const start = async () => {

    try {
     await mongoose.connect(process.env.DB_URL, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      }, { timestamps: true });
      const port = process.env.PORT || 9000;
      const urlHost = process.env.APP_URL;
  
      server.listen(port, () => console.log(`server is listening at ${urlHost}`));
    } catch (error) {
      console.log(error);
    }
  };
  
  start();
  


