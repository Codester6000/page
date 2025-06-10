import express from "express";
import cors from "cors";
import { conectarDB } from "./database/connectionMySQL.js";

// Rutas
import armadorRouter from "./armador.js";
import productosRouter from "./productos.js";
import usuarioRouter from "./usuarios.js";
import carritoRouter from "./carrito.js";
import authRouter, { authConfig } from "./auth.js";
import favoritoRouter from "./favorito.js";
import modoCheckoutRouter from "./checkout.js";
import getNetRouter from "./checkoutGetNet.js";
import routerMP from "./checkoutMP.js";
import { categoriasRouter } from "./categorias.js";
import mantenimientoRouter from "./routes/mantenimiento.routes.js";
import  empleadosRouter  from "./routes/empleados.routes.js";
const PUERTO = 3000;
const HOST = "0.0.0.0";

const app = express();
conectarDB();

// Permitir desarrollo local + producción
const allowedOrigins = [
  "https://modex.com.ar",
  "https://www.modex.com.ar",
  "http://localhost:5173", // 
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

authConfig(); // configuración de passport u otras estrategias

// Rutas
app.use("/auth", authRouter);
app.use("/empleados", empleadosRouter);
app.use("/mantenimiento", mantenimientoRouter);
app.use("/productos", productosRouter);
app.use("/armador", armadorRouter);
app.use("/usuarios", usuarioRouter);
app.use("/carrito", carritoRouter);
app.use("/favorito", favoritoRouter);
app.use("/checkout", modoCheckoutRouter);
app.use("/checkoutMP", routerMP);
app.use("/checkoutGN", getNetRouter);
app.use("/categorias", categoriasRouter);

app.get("/", (req, res) => {
  res.send("Hola mundo desde Modex");
});

app.listen(PUERTO, HOST, () => {
  console.log(`La app está escuchando en http://${HOST}:${PUERTO}`);
});
