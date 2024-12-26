import jwt from 'jsonwebtoken';

const BASE_URL = 'https://merchants.preprod.playdigital.com.ar/merchants/middleman/token';


let authToken = null; // Cachear el token.
let tokenExpiry = null; // Tiempo de expiración del token.

const username_test = process.env.CLIENT_ID
const password_test = process.env.CLIENT_SECRET



export const getAuthToken = async (req, res, next) => {
try {
    // Si el token no existe o ya expiró
    if (!authToken || Date.now() >= tokenExpiry) {
        const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
            'User-Agent': 'Modex.com.ar', // Obligatorio
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username_test, password:password_test}),
    });

    const data = await response.json();
    console.log(data.user.stores)
    if (!response.ok) {
        throw new Error(`Error al generar token: ${data.message}`);
    }

      authToken = data.accessToken; // Cachear el nuevo token
      const decodedToken = jwt.decode(authToken); // Decodificar el JWT
      tokenExpiry = decodedToken.exp * 1000; // Configurar el tiempo de expiración
    }

    req.authToken = authToken; // Adjuntar el token al objeto `req`
    next(); // Continuar con el siguiente middleware
  } catch (error) {
    console.error('Error autenticando token:', error);
    return res.status(500).json({ error: 'Error autenticando la solicitud.' });
  }
};