import express from 'express';
import {MercadoPagoConfig ,Preference } from 'mercadopago';
import { db } from "./database/connectionMySQL.js"
const accessTokenMp = process.env.ACCESS_TOKEN_MP
const client = new MercadoPagoConfig({
    accessToken: accessTokenMp,
})
const routerMP = express.Router();


routerMP.post('/crear-preferencia-mercadopago', async (req, res) => {
    console.log('me llamaron')
    try {
        const body = {
            items: [
                {
                    title: req.body.title,
                    unit_price: Number(req.body.price),
                    quantity: Number(req.body.quantity),
                    currency_id: "ARS",
                }
            ],
            back_urls: {
                success: "https://modex.com.ar/thank-you",
                failure: "https://modex.com.ar/checkout",
                pending: "https://modex.com.ar",
            },
            auto_return: "approved",
            notification_url:"https://api.modex.com.ar/checkoutMP/webhook-mercadopago",
        };

        const preference = new Preference(client);
        const result = await preference.create({body});
        console.log(result.id)
        const sql = `UPDATE carrito SET  total_a_pagar = ? WHERE (id_carrito = ?);`
        const [resultadoId] = await db.execute(sql,[req.body.price,req.body.id_carrito])
        res.status(200).send({id:result.id})
    } catch (error) {
        console.log(error)
        res.status(400).send('Error creado la preferencia de MercadoPago22');
    }
    
});

routerMP.post('/webhook-mercadopago', async (req, res) => {

    const paymentId = req.query.id;
    try {
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${client.accessToken}`}
        });

        if (response.ok){
            const data = await response.json();
            console.log(data)
            switch (data.status) {
                case 'approved':
                    //en el front mandamos el id del carrito en el title despues de la coma
                    const carritoId = data.description.split(',')[1].trim();
                    const comprobanteId = data.id;
                    console.log(carritoId);
                    console.log('comprobanteeeee' ,comprobanteId)
                    const sql = "UPDATE carrito SET estado = 'completado', fecha_finalizada = CURRENT_TIMESTAMP() , comprobante = ?  WHERE (id_carrito = ?);"
                    const result = await db.execute(sql,[comprobanteId,carritoId]);
                    const sql2 = `CALL schemamodex.baja_stock_carrito(?);`
                    const result2 = await db.execute(sql2,[comprobanteId]);
                    console.log('pago aprobado')
                    break;
            
                default:
                    break;
            }
        }
        return res.status(200).send('ok');
    } catch (error) {
        console.error(error)
        return res.sendStatus(500);
    }
});
export default routerMP;