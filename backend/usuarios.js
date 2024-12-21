import express from "express"
import { body, validationResult } from "express-validator";
import { db } from "./database/connectionMySQL.js";
import bcrypt from "bcrypt"
import { validarBodyRegister } from "./middleware/validaciones.js";
import { validarJwt, validarRol } from "./auth.js";
const usuarioRouter = express.Router();

usuarioRouter.get("/", validarJwt,validarRol(2),async (req,res) => {
    const [result] = await db.execute("SELECT * FROM usuarios")
    res.status(200).send({resultado:result})
})
usuarioRouter.post("/",validarBodyRegister(),async (req,res) => {

    const errores = validationResult(req)
    if(!errores.isEmpty()){
        res.status(400).send({errores:errores.array()})
        return;
    }
    try {
        const { username, password,email,fechaNacimiento} = req.body;
        const [usuarioRepetido] = await db.execute("SELECT * FROM usuarios WHERE username = ? ;",[username])
        if (usuarioRepetido != 0){
            return res.status(400).send("Ya existe un usuario registrado con ese username")
        }
        const [emailRepetido] = await db.execute("SELECT * FROM usuarios WHERE email = ? ;",[email])
        if (emailRepetido != 0){
            return res.status(400).send("Ya existe un usuario registrado con ese email")
        }
        const passwordHashed = await bcrypt.hash(password,10) 
        const [result ] = await db.execute("INSERT INTO usuarios (username, password,email,fechaNacimiento) VALUES (?,?,?,?)",[username,passwordHashed,email,fechaNacimiento])
        res.status(200).send({result})
        return;
    } catch (error) {
        console.log(error)
        res.status(500).send('Error en el servidor')
        return;
    }
})

export default usuarioRouter;