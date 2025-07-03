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
import mantenimientoRoutes from './routes/mantenimiento.routes.js';
import { verificarToken } from "./middleware/verificarToken.js";
import { buscarUsuariosPorUsername } from "./controllers/usuarios.controllers.js";

const PUERTO = 3000;
const HOST = "0.0.0.0";
const app = express();
conectarDB();
/* let corsOptions = {
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
}; */
app.use(cors());
app.use(express.json());
app.use("/auth", authRouter);

authConfig();
//interpretar json en el body
app.use(empleadosRoutes);
app.use("/usuarios", verificarToken,buscarUsuariosPorUsername);
app.use('/api/mantenimientos',verificarToken, mantenimientoRoutes);
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
app.get("/", (req, res) => {
  res.send("hola mundo");
});

app.listen(PUERTO, HOST, () => {
  console.log(`La app esta esuchando en ${HOST} y en el puerto ${PUERTO}`);
});