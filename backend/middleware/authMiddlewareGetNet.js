import jwt from 'jsonwebtoken';

const BASE_URL = 'https://auth.geopagos.com/oauth/token';

let authToken = null;
let tokenExpiry = null;

const client_id = process.env.CLIENT_ID_GETNET;
const client_secret = process.env.CLIENT_SECRET_GETNET;

export const getAuthToken = async (req, res, next) => {

    try {
        
        if(!authToken || Date.now() >= tokenExpiry) {
            const response = await fetch (BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                                        grant_type:"client_credentials",
                                        client_id:client_id,
                                        client_secret:client_secret,
                                        scope:"*"
                                    
                                    })
            })

            
            const data = await response.json();
            if (!response.ok) {
                throw new Error(`Error al generar token: ${data.message}`);
            }
            authToken = data.access_token;
            tokenExpiry = data.expires_in;
            req.authToken = authToken;
            
            next();

        }
        
    }
    catch (error) {
        console.error('Error autenticando token:', error);
        return res.status(500).json({ error: 'Error autenticando la solicitud.' });
    }
}