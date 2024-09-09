// const fs = require('fs');
// const path = require('path');
import fs from 'fs'
import path from 'path'
// const { baseUpload, tempUpload } = require("../storage/baseUploads");
import baseUploads from "../storage/baseUploads.js";
function unlinkFile(filePath) {
    try {
        const fullPath = path.join(baseUploads, filePath);

        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    } catch (error) {
        console.error(`Error deleting file '${filePath}': ${error.message}`);
    }
}

// const unlinkFile = async (filePath) => {
//     try {
//         const storage = new FileStorage(`${process.env.CLOUD_API}/api`, 'corelens', '1396649A2E582C5BAFDBD1DBE1399')
//         // const bucket = storage.bucket(bucketName);

//         // const file = bucket.file(filePath);

//         // const exists = await file.exists();
//         // if (!exists[0]) {
//         //     console.log(`File "${filePath}" does not exist in the bucket.`);
//         //     return;
//         // }
//         await storage.deleteFile(filePath)
//         console.log(`File "${filePath}" deleted successfully from the bucket.`);
        

//     } catch (error) {
//         console.log('error in file delete', error.message);
//     }
// }




export default  unlinkFile ;
