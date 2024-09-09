import baseUploads from "../storage/baseUploads.js";
import slugify from "slugify"
import path from 'path'
import unlinkFile from "./unlinkFile.js";
const upload = (files) => {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace('.', '');
    const filenameUnique = `${timestamp}-${slugify(files.name, {trim: true, lower: true })}`

    const uploadPath = path.join(baseUploads, filenameUnique);
    
    files.mv(uploadPath)
    if (uploadPath) {
        unlinkFile(files.tempFilePath)
    }
    return filenameUnique;
}


// const { baseUpload } = require("../storage/baseUploads");
// const { Storage } = require('@google-cloud/storage');
// const path = require("path");
// const { removeTemp } = require("./removeFile");
// const slugify = require("slugify");
// import slugify from "slugify"
// import unlinkFile from "./unlinkFile.js"
// import path from "path"

// import FileStorage from 'npmexpresscloud';
// import baseUploads from "../storage/baseUploads.js"
// const upload = async (files) => {
//     try {
//         // const projectId = process.env.PROJECT_ID
//         // const bucketName = process.env.BUCKET_NAME
//         // const serviceKey = path.join(path.resolve(),  'storageservice.json')
//         // const storage = new FileStorage(`${process.env.CLOUD_API}/api`, 'tutorazzi', '1396649A2E582C5BAFDBD1DBE1399')

        
//         // const filenameUnique = `${timestamp}-${slugify(files.name, { trim: true, lower: true })}`
//         const uploadPath = await storage.uploadFile(files)
// console.log(uploadPath)
//         if (uploadPath) {
//             unlinkFile(files.tempFilePath)
//         }

//         // const uploadPath = baseUpload + files.name;
//         // files.mv(uploadPath)
        
//         return uploadPath.path;

//     } catch (error) {
//         console.log('error in file upload', error.message);
//     }
// }


export default upload 