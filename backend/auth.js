import express from "express"
import { body, validationResult } from "express-validator";
import { db } from "./database/connectionMySQL.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const router = express.Router();

router.post("/login",body("username").isAlphanumeric().notEmpty().isLength({max:25}),
body("password").isStrongPassword({
    minLength:8,
    minNumbers:1,
    minUppercase:1,
    minLowercase:1,
    minSymbols:0
}),async (req,res) => {
    const errores = validationResult(req)
    if(!errores.isEmpty()){
        res.status(400).send({errores:errores.array()})
        return
    }

    const {username,password} = req.body

    const [usuarios] = await db.execute("SELECT * FROM usuarios WHERE username = ?",[username])

    if(usuarios === 0) {
        res.status(400).send({error:"Usuario o contraseña incorrecta"})
        return
    }
    //verificar usuario y contraseña
    const passwrodCompared = await bcrypt.compare(password, usuarios[0].password)
    if(!passwrodCompared){
        res.status(400).send({error:"Usuario o contraseña incorrecta"})
    }
    //crear jwt
    const payload = {username, mensaje:"hola mundo",dato:123}
    const token = jwt.sign(payload,"ALGOSECRETO",{expiresIn:"2h"})
    //enviar jwt
    res.send({token})
})
export default router;