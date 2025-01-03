import express from "express"
import { db } from "./database/connectionMySQL.js"
import { validarJwt,validarRol } from "./auth.js"
import { getAuthToken } from "./middleware/authMiddlewareModo.js";
import { validarBodyCheckout,verificarValidaciones } from "./middleware/validaciones.js";
import  pkg from 'node-jose';
import pkg2 from 'lodash';
const {isEqual} = pkg2;
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



modoCheckoutRouter.post('/intencion-pago',validarBodyCheckout(),verificarValidaciones, getAuthToken, async (req, res) => {
  const {productName,price,id_carrito,total} = req.body
    try {
      const token = req.authToken; // Obtener el token desde el middleware
      const timestamp = Date.now();
        const response = await fetch('https://merchants.playdigital.com.ar/merchants/ecommerce/payment-intention', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body:JSON.stringify({productName:productName,price:price,quantity:1,currency:'ARS',storeId:'da9c324e-730c-4bf9-90b6-a3d1c3844d85',externalIntentionId:`Modex${timestamp}`})
      });

      
      const data = await response.json();
      const sql = `UPDATE carrito SET id_intencion_pago = ?, total_a_pagar = ? WHERE (id_carrito = ?);`
      console.log(data.id, total,id_carrito)
      const [resultadoId] = await db.execute(sql,[data.id,total,id_carrito])

      res.status(201).send({data});
    } catch (error) {
      console.error('Error en intención de pago:', error);
      res.status(500).json({ error: 'Error obteniendo intención de pago.' });
    }
  });


  modoCheckoutRouter.get('/estado-pago/:id',getAuthToken,async(req,res) =>{
    try {
      const id = req.params.id;
      const token = req.authToken; // Obtener el token desde el middleware
      const response = await fetch(`https://merchants.playdigital.com.ar/merchants/ecommerce/payment-intention/${id}/data`,
        {
          method: 'GET',
          headers:{
            'Authorization': `Bearer ${token}`,
            'User-Agent': 'modex.com.ar',
          }
        }
      )
      
      if(!response.ok){
        return res.status(400).send("Hubo un error en el fetch")
      }
      
      const resultado = await response.json()
      return res.status(200).send(resultado)
    } catch (error) {
      console.error(error)
      res.status(500).send("Error en el servidor")
    }

    
  })

  modoCheckoutRouter.post('/modo/webhook', async (req,res) => {

    const body = req.body
    console.log('webhook reached')
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
          console.log('se scaneo un qr')
          break;
        case 'PROCESSING':
          console.log('procesando')
          //TODO
          //Actualizar base de datos
          break;
        case 'ACCEPTED':
          const sql = "UPDATE carrito SET estado = 'completado', fecha_finalizada = CURRENT_TIMESTAMP() WHERE (id_intencion_pago = ?);"
          const id_pago = body.id

          const result = await db.execute(sql,[id_pago]);
          break;
        case 'REJECTED':
          console.log('rechazado')
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


  modoCheckoutRouter.get('/modo/exito/:id',getAuthToken,async(req,res)=>{
    try {
      const id = req.params.id;
      const token = req.authToken; // Obtener el token desde el middleware
      const response = await fetch(`https://merchants.playdigital.com.ar/merchants/ecommerce/payment-intention/${id}/data`,
        {
          method: 'GET',
          headers:{
            'Authorization': `Bearer ${token}`,
            'User-Agent': 'modex.com.ar',
          }
        }
      )
      
      if(!response.ok){
        return res.status(400).send("Hubo un error en el fetch")
      }
      
      const resultado = await response.json()
      switch (resultado.status) {
        case 'SCANNED':
          console.log('se scaneo un qr')
          break;
        case 'PROCESSING':
          console.log('procesando')
          //TODO
          //Actualizar base de datos
          break;
        case 'ACCEPTED':
          const sql = `UPDATE carrito SET estado = 'completado' WHERE (id_intencion_pago = ?);`
          const [resultadoId] = await db.execute(sql,[id])
          
          console.log('pago aceptado')
          return res.status(201).send({resultadoId});
          break;
        case 'REJECTED':
          console.log('rechazado')
          //TODO
          //Actualizar base de datos
          break;
        
        default:
          console.log('Status desconocido')
          break;
      }
      return res.status(200).send(resultado)
    } catch (error) {
      console.error(error)
      res.status(500).send("Error en el servidor")
    }
  } )
export default modoCheckoutRouter;