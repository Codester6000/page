import express from 'express'
import { getAuthToken } from './middleware/authMiddlewareGetNet.js';
import { db } from "./database/connectionMySQL.js"
const getNetRouter = express.Router();
const BASE_URL = 'https://api.globalgetnet.com.ar/api/v2/orders'

getNetRouter.post('/intencion-pago', getAuthToken, async (req, res) =>{
    const { items,id_carrito } = req.body;
    const response = await fetch( BASE_URL, {
        method: 'POST',
        headers:{
            'Content-Type': 'application/vnd.api+json',
            'Accept': 'application/vnd.api+json',
            'Authorization': `Bearer ${req.authToken}`,
        },
        body: JSON.stringify({"data": {
        "attributes": {
            "currency": "032",
            "items": items,
            "redirect_urls": {
                "success": "https://modex.com.ar/thank-you",
                "failed": "https://modex.com.ar/checkout"
            },
            "webhookUrl": "https://api.modex.com.ar/checkoutGN/webhook"
        }
    }})
    })
    const data = await response.json();
    if (!response.ok) {
        console.log(data)
        return res.status(500).json({ error: 'Error generando link de pago.' });
    }
    const precio = data.data.attributes.price.amount / 100;
    const precioAjustado = precio.toFixed(2);
    const sql = `UPDATE carrito SET id_intencion_pago = ? , total_a_pagar = ? WHERE (id_carrito = ?);`
    const [resultadoId] = await db.execute(sql,[data.data.attributes.uuid,precioAjustado,req.body.id_carrito])
    return res.status(200).send({links:data.data.links})

})

getNetRouter.post('/webhook', async (req, res) => {
    const body = req.body;
    console.log(body);
    if (body.data.payment.status === 'APPROVED') {
        const uuid = body.data.order.uuid;
        const sql = "UPDATE carrito SET estado = 'completado', metodo_pago = 'GetNet',fecha_finalizada = CURRENT_TIMESTAMP() WHERE (id_intencion_pago = ?);"
        const result = await db.execute(sql,[uuid]);
        const sql2 = `CALL schemamodex.baja_stock_carrito(?);`

        const result2 = await db.execute(sql2,[uuid]);
    }
    else if(body.data.payment.status === "DENIED"){
        console.log("Pago denegado")
    }
res.status(200).send("Webhook recibido");
})
export default getNetRouter;