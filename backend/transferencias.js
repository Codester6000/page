import express from 'express';
import { validarJwt } from "./auth.js";
import multer from "multer"
import path from 'path'

const transferenciasRouter = express.Router();
const imgconfig = multer.diskStorage({
    destination:(req, file,callback)=>{
        callback(null,'uploads')
    },
    filename:(req, file, callback)=>{
        callback(null, `image-${Date.now()}.${file.originalname}`)
    }
})

const upload = multer({ 
    storage: imgconfig,
    limits:{fileSize:'1000000'},
    fileFilter:(req,file,callback)=>{
        const fileType = /png|jpg|webm|jpeg/
        const mimeType = fileType.test(file.mimetype)
        if(mimeType){
            return callback(null, true)
        }
        callback('Give proper file format to upload')
    
    }

 })
transferenciasRouter.post('/single', validarJwt, upload.single("imagenTransferencia"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        console.log(req.file);
        res.send("ok");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default transferenciasRouter;