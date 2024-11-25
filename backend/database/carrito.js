import express from "express"
import { db } from "./connectionMySQL.js"
import {}

const carritoRouter = express.Router()

carritoRouter.get('/',async (req,res) =>{
    
    const [resultado,fields] = await db.execute()
})