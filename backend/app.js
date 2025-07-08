import express, { json } from "express";
import cors from "cors";
import armadorRouter from "./armador.js";
import { conectarDB } from "./database/connectionMySQL.js";
import productosRouter from "./productos.js";
import usuarioRouter from "./usuarios.js";
import carritoRouter from "./carrito.js";
import authRouter, { authConfig } from "./auth.js";
import favoritoRouter from "./favorito.js";
import modoCheckoutRouter from "./checkout.js";
import getNetRouter from "./checkoutGetNet.js";
import empleadosRoutes from './routes/empleados.routes.js';
import routerMP from "./checkoutMP.js";
import { categoriasRouter } from "./categorias.js";
import transferenciasRouter from "./transferencias.js";
import mantenimientoRoutes from './routes/mantenimientos.routes.js';
import usuariosRouter from './routes/usuarios.routes.js';

const PUERTO = 3000;
const HOST = "0.0.0.0";
const app = express();

// Conexión a la base de datos
conectarDB();

/* // Configuración avanzada de CORS (opcional para producción)
let corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = ["https://modex.com.ar", "https://www.modex.com.ar"];
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));
*/

app.use(cors());
app.use(express.json());

// Autenticación
app.use("/auth", authRouter);
authConfig();

// ✅ Rutas API
app.use('/api/mantenimientos', mantenimientoRoutes);  // POST y GET de mantenimientos
app.use('/api/usuarios', usuariosRouter);             // /usuarios y /buscar-usuarios
app.use('/api/empleados', empleadosRoutes);           // /api/empleados

// 🔁 Otras rutas generales
app.use("/productos", productosRouter);
app.use("/armador", armadorRouter);             
app.use("/usuarios", usuarioRouter);
app.use("/carrito", carritoRouter);
app.use("/favorito", favoritoRouter);
app.use("/checkout", modoCheckoutRouter);
app.use("/checkoutMP", routerMP);
app.use("/checkoutGN", getNetRouter);
app.use("/categorias", categoriasRouter);
app.use("/transferencias", transferenciasRouter);

// 🌐 Ruta raíz
app.get("/", (req, res) => {
  res.send("hola mundo");
});

// 🚀 Inicio del servidor
app.listen(PUERTO, HOST, () => {
  console.log(`✅ La app está escuchando en ${HOST} y en el puerto ${PUERTO}`);
});
