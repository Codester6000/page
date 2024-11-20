import express, { json } from "express"
import cors from 'cors'
import armadorRouter from './armador.js'
import { conectarDB } from "./database/connectionMySQL.js"
import productosRouter from "./productos.js"
import usuarioRouter from "./usuarios.js"
import authRouter, { authConfig } from "./auth.js"

const PUERTO = 3000
const app = express()
app.use("/auth",authRouter)
conectarDB()
app.use(cors())
app.use(express.json())

authConfig()
//interpretar json en el body
app.use('/productos',productosRouter)
app.use("/armador",armadorRouter)
app.use("/usuarios",usuarioRouter)

app.get("/", (req, res) => {
    res.send("hola mundo")
})

app.listen(PUERTO, () => {
    console.log(`La app esta esuchando el puerto ${PUERTO}`)
})