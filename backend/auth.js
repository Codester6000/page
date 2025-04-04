import express from "express"
import { body, validationResult } from "express-validator";
import { db } from "./database/connectionMySQL.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { ExtractJwt, Strategy } from "passport-jwt";
import passport from "passport";
const router = express.Router();

export function authConfig() {
    //opciones configuracion jwt
    const jwtOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET,
    };
    
    //creo estrategias jwt

    passport.use(
        new Strategy(jwtOptions, async (payload, next) => {
            next(null, payload);
        })
    );
}

export const validarJwt = passport.authenticate("jwt", {
    session: false,
    });

export const validarRol = (rol) => (req, res, next) => {
    if (req.user.rol !== rol) {
        return res
        .status(400)
        .send({ mensaje: "No esta autorizado para realizar esta accion" });
    }
    next();
};

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
    try {
        const {username,password} = req.body
        
        const [usuarios] = await db.execute("SELECT * FROM usuarios WHERE username = ?",[username])
        
        if(usuarios == 0) {
            res.status(400).send({error:"Usuario o contraseña incorrecta"})
            return
        }
        //verificar usuario y contraseña
        const passwrodCompared = await bcrypt.compare(
            password,
            usuarios[0].
            password);
    
        if(!passwrodCompared){
            res.status(400).send({error:"Usuario o contraseña incorrecta"})
            return
        }
        
        //crear jwt
        const payload = {username, rol:usuarios[0].id_rol,userId:usuarios[0].id_usuario}
        const token = jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:"2h"})
        //enviar jwt
        res.send({username:usuarios[0].username,rol:usuarios[0].id_rol,token})
        return;
    } catch (error) {
        console.log(error)
        res.status(500).send('Error en el servidor')
        return;
    }
})
export default router;