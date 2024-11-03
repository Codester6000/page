import express, { json } from "express"
import cors from 'cors'
import {armadoRouter} from './database.js'
import { conectarDB } from "./database/connectionMySQL.js"
import productosRouter from "./productos.js"
const PUERTO = 3000

const app = express()
conectarDB()
app.use(cors())
app.use(express.json())
//interpretar json en el body
app.use('/productos',productosRouter)
app.get("/", (req, res) => {
    res.send("hola mundo")
})

app.listen(PUERTO, () => {
    console.log(`La app esta esuchando el puerto ${PUERTO}`)
})