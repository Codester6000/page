import express, { json } from "express"
const PUERTO = 3000

const app = express()

//interpretar json en el body
app.use(express.json())

app.get("/", (req, res) => {
    res.send("hola mundo")
})

app.listen(PUERTO, () => {
    console.log(`La app esta esuchando el puerto ${PUERTO}`)
})