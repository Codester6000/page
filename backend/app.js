import express from "express";
import cors from "cors";
import { conectarDB } from "./database/connectionMySQL.js";

// Rutas personalizadas
import authRouter, { authConfig } from "./auth.js";
import productosRouter from "./productos.js";
import usuarioRouter from "./usuarios.js";
import carritoRouter from "./carrito.js";
import favoritoRouter from "./favorito.js";
import modoCheckoutRouter from "./checkout.js";
import getNetRouter from "./checkoutGetNet.js";
import routerMP from "./checkoutMP.js";
import { categoriasRouter } from "./categorias.js";
import transferenciasRouter from "./transferencias.js";
import armadorRouter from "./armador.js";

// Rutas con prefijo /api
import mantenimientoRoutes from "./routes/mantenimientos.routes.js";
import usuariosRouter from "./routes/usuarios.routes.js";
import empleadosRoutes from "./routes/empleados.routes.js";

const app = express();
const PORT = 3000;
const HOST = "0.0.0.0";

// ✅ Conexión a la BD
conectarDB();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Rutas de autenticación
app.use("/auth", authRouter);
authConfig(); // Setup de autenticación y estrategia JWT

// ✅ Rutas protegidas con /api
app.use("/api/mantenimientos", mantenimientoRoutes);
app.use("/api/usuarios", usuariosRouter); // Incluye /api/usuarios y /api/usuarios/buscar-usuarios
app.use("/api/empleados", empleadosRoutes);

// ✅ Rutas de frontend (sin prefijo /api)
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

// ✅ Ruta raíz
app.get("/", (req, res) => {
  res.send("🟢 API funcionando correctamente");
});

// ✅ Inicio del servidor
app.listen(PORT, HOST, () => {
  console.log(`✅ La app está escuchando en http://${HOST}:${PORT}`);
});
