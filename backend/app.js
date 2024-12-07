import express, { json } from "express"
import cors from 'cors'
import armadorRouter from './armador.js'
import { conectarDB } from "./database/connectionMySQL.js"
import productosRouter from "./productos.js"
import usuarioRouter from "./usuarios.js"
import carritoRouter from './carrito.js'
import authRouter, { authConfig } from "./auth.js"
import favoritoRouter from "./favorito.js"

const PUERTO = 3000
const HOST = '0.0.0.0'
const app = express()
conectarDB()
app.use(cors())
app.use(express.json())
app.use("/auth",authRouter)

authConfig()
//interpretar json en el body
app.use('/productos',productosRouter)
app.use("/armador",armadorRouter)
app.use("/usuarios",usuarioRouter)
app.use("/carrito",carritoRouter)
app.use("/favorito",favoritoRouter)

app.get("/", (req, res) => {
    res.send("hola mundo")
})

app.listen(PUERTO, HOST,() => {
    console.log(`La app esta esuchando en ${HOST} y en el puerto ${PUERTO}`)
})