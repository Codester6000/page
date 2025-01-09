import express from 'express';
import { Preference } from 'mercadopago';
const routerMP = express.Router();


routerMP.post('/crear-preferencia-mercadopago', async (req, res) => {
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
        };

        const preference = new Preference(client);
        const result = await preference.create({body});
        res.status(200).send(result.id)
    } catch (error) {
        res.status(400).send('Error creado la preferencia de MercadoPago');
    }
    
});

export default routerMP;