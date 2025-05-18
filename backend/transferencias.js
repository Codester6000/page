import express from 'express';
import { validarJwt } from "./auth.js";
import multer from "multer"
import path from 'path'
import { db } from './database/connectionMySQL.js';

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

const transferenciaApendiente = async (id, total_a_pagar) => {
    const sql = "UPDATE carrito SET estado = 'Pendiente', fecha_finalizada = CURRENT_TIMESTAMP(), total_a_pagar = ? WHERE id_carrito = ? ;";
    const [response] = await db.execute(sql,[total_a_pagar,id]);
    return response?.affectedRows > 0;

}
const obtenerTotalCarrito = async(id_productos) => {
    const sql = "SELECT SUM(p.precio_pesos_iva) FROM precios p INNER JOIN carrito_detalle cd ON p.id_producto = cd.id_producto WHERE id_carrito = ?; "
}
transferenciasRouter.post('/single', validarJwt, upload.single("imagenTransferencia"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        console.log(req.file);
        const {id_carrito, id_productos} = req.body;
        
        
        res.send("ok");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default transferenciasRouter;