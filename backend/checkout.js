import express from "express"
import { db } from "./database/connectionMySQL.js"
import { validarJwt } from "./auth.js"
import { getAuthToken } from "./middleware/authMiddlewareModo.js";
import jwt from 'jsonwebtoken'
const modoCheckoutRouter = express.Router()
const BASE_URL = 'https://merchants.preprod.playdigital.com.ar/merchants/middleman/token';
const USERNAME = 'sdkmodostage';
const PASSWORD = 'sdkmodostage';
let authToken = null; // Cachear el token para su reutilización.
let tokenExpiry = null;
modoCheckoutRouter.post('/get-token', async (req,res) =>{
    try {
        if (!authToken && tokenExpiry < Date.now()) {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'User-Agent': 'Modex.com.ar',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
        });
            const data = await response.json();
            console.log(data)
            authToken = data.accessToken;
            const decodedToken = jwt.decode(authToken);
            tokenExpiry = decodedToken.exp * 1000; // Convertir a milisegundos.
        }
        res.status(200).send({ authToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error obteniendo token.' });
    }
})

modoCheckoutRouter.post('/intencion-pago', getAuthToken, async (req, res) => {
    try {
      const token = req.authToken; // Obtener el token desde el middleware
        const response = await fetch('https://merchants.preprod.playdigital.com.ar/merchants/ecommerce/payment-intention', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body:JSON.stringify({productName:'Test',price:12.2,quantity:1,currency:'ARS',storeId:'2e10e1e2-1046-47a9-b5aa-12f0749940f8',externalIntentionId:'1234'})
      });
  
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error en intención de pago:', error);
      res.status(500).json({ error: 'Error obteniendo intención de pago.' });
    }
  });

export default modoCheckoutRouter;