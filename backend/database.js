import express from 'express'
import { db } from './database/connectionMySQL.js'

export const armadoRouter = express.Router()
armadoRouter.get('/', async (req, res) => {
    const parametros = []
    let sql = "SELECT * FROM productos"
    const mother = req.query.mother
    if (mother != undefined){
        sql += ` WHERE nombre LIKE '%${mother}%'`
    }
    const result = await db.execute(sql,parametros)
    console.log(result)
    res.send({resultado:result})
})