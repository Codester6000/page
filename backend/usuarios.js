import express from "express"
import { body, validationResult } from "express-validator";
import { db } from "./database/connectionMySQL.js";
import bcrypt from "bcrypt"
const usuarioRouter = express.Router();

usuarioRouter.get("/", async (req,res) => {
    const [result] = await db.execute("SELECT * FROM usuarios")
    res.status(200).send({resultado:result})
})
usuarioRouter.post("/",body("username").isAlphanumeric().notEmpty().isLength({max:25}),
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
    }

    const { username, password} = req.body;
    const passwordHashed = await bcrypt.hash(password,10) 
    const [result ] = await db.execute("INSERT INTO usuarios (username, password) VALUES (?,?)",[username,passwordHashed])
    res.status(200).send({result})
})

export default usuarioRouter;