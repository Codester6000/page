import express from "express"
import { db } from "./database/connectionMySQL.js"
import { validarJwt,validarRol } from "./auth.js"
import { getAuthToken } from "./middleware/authMiddlewareModo.js";
import  pkg from 'node-jose';
const {JWS, JWK } = pkg;
const modoCheckoutRouter = express.Router()


let modoKeyStore;
async function initModoKeyStore() {
  if(!modoKeyStore){
    const jwksUrl = 'https://merchants.playdigital.com.ar/.well-known/jwks.json';
    const response = await fetch(jwksUrl);
    const parsedResponse = await response.json();
    modoKeyStore = await JWK.asKeyStore(parsedResponse);
    console.log('JWKs cargados correctamente:', modoKeyStore.all({}));
}
}
await initModoKeyStore()



async function verifySignature(body) {

  try {
    const verificationResult = await JWS.createVerify(modoKeyStore).verify(
      body.signature
    );
    delete body.signature;
    return isEqual(
      body,
      JSON.parse(verificationResult.payload.toString())
    );
  } catch (error) {
    console.error(error)
    return false
  }
  
}



modoCheckoutRouter.post('/intencion-pago',validarJwt, getAuthToken, async (req, res) => {
    try {
      const token = req.authToken; // Obtener el token desde el middleware
      const {productName,price,quantity} = req.body
      const timestamp = Date.now();
        const response = await fetch('https://merchants.preprod.playdigital.com.ar/merchants/ecommerce/payment-intention', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body:JSON.stringify({productName,price,quantity,currency:'ARS',storeId:'2e10e1e2-1046-47a9-b5aa-12f0749940f8',externalIntentionId:`Modex${timestamp}`})
      });
  
      const data = await response.json();
      console.log(data)
      res.status(201).send({data});
    } catch (error) {
      console.error('Error en intención de pago:', error);
      res.status(500).json({ error: 'Error obteniendo intención de pago.' });
    }
  });


  modoCheckoutRouter.get('/estado-pago/:id', validarJwt,validarRol(2),getAuthToken,async(req,res) =>{
    try {
      const id = req.params.id;
      const token = req.authToken; // Obtener el token desde el middleware
      const response = await fetch(`https://merchants-api.playdigital.com.ar/merchants/ecommerce/payment-intention/${id}/data`,
        {
          method: 'GET',
          headers:{
            'Authorization': `Bearer ${token}`,
            'User-Agent': 'modex.com.ar',
          }
        }
      )
    } catch (error) {
      console.error(error)
      res.status(500).send("Error en el servidor")
    }

    
  })

  modoCheckoutRouter.post('/modo/webhook', async (req,res) => {

    const body = req.body
    if (!modoKeyStore) {
      console.error("KeyStore no inicializado.");
      return res.status(500).send({ error: "KeyStore no inicializado." });
  }
    if (!body || Object.keys(body).length === 0) {
      console.error("El cuerpo de la solicitud está vacío.");
      return res.status(400).send({ error: "El cuerpo de la solicitud no puede estar vacío." });
  }

  // Validar que el campo `signature` exista
    if (!body.signature) {
        console.error("Falta el campo 'signature' en el cuerpo.");
        return res.status(400).send({ error: "Falta el campo 'signature'." });
    }

    const isValid = await verifySignature(body);
    if (!isValid) {
        console.error("Firma inválida.");
        return res.status(400).send({ error: "Firma inválida." });
    }
    try{
      
      switch (body.status) {
        case 'SCANNED':
          //TODO
          //Actualizar base de datos
          break;
        case 'PROCESSING':
          //TODO
          //Actualizar base de datos
          break;
        case 'ACCEPTED':
          //TODO
          //Actualizar base de datos
          break;
        case 'REJECTED':
          //TODO
          //Actualizar base de datos
          break;
        
        default:
          console.log('Status desconocido')
          break;
      }
      res.status(200).send("webhook recibido")
    }catch(error){
      console.error("Error en el webhook",error)
      res.status(500).send('Error en el servidor')
    }

  })

export default modoCheckoutRouter;