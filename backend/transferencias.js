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
const obtenerTotalCarrito = async(id_carrito) => {
    const [results] = await db.execute("CALL get_total_carrito(?);",[id_carrito])
    if (results && results.length > 0) {
  const totalResult = results[0];
  
  if (totalResult && totalResult.length > 0) {
    const total = totalResult[0].total_carrito;
    return total;
  } else {
    console.log("No results found");
    return null
  }
} else {
  console.log("Error or no results from stored procedure");
  return null; // or handle error as needed
}
}

const obtener_id_carrito = async(id_usuario) => {
    const sql = "SELECT id_carrito FROM carrito WHERE id_usuario = ? AND estado = 'activo';"
    const [result] = await db.execute(sql,[id_usuario])
    return result[0].id_carrito
}
transferenciasRouter.post('/single', validarJwt, upload.single("imagenTransferencia"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const id_usuario = req.user.userId
        const id_carrito = await obtener_id_carrito(id_usuario)
        const total_carrito = await obtenerTotalCarrito(id_carrito);
        const resultado = await transferenciaApendiente(id_carrito, total_carrito);
        console.log(resultado)
        
        if (resultado){
            return res.status(201).send("Carrito actualizado a pendiente.");
            
        }
        return res.status(400).send("Hubo un error con tu solicitud.")
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default transferenciasRouter;