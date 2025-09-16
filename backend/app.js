import express from "express";
import cors from "cors";
import { conectarDB } from "./database/connectionMySQL.js";
import path from "path";
import ejecutarInicializacionAdmin from "./admin.js";

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
import routerCargaProducto from "./cargaDeProductos.js";
import routerCargaProductoModex from "./cargaDeProductosModex.js";
import routerimagenes from "./cargaDeImagenes.js";

const app = express();
const PORT = 3000;
const HOST = "0.0.0.0";

const inicializarServidor = async () => {
  try {
    console.log("Iniciando servidor...");

    console.log("Conectando a la base de datos...");
    await conectarDB();
    console.log("Base de datos conectada correctamente");

    console.log("Ejecutando inicialización del sistema...");
    await ejecutarInicializacionAdmin();

    let corsOptions = {
      origin: function (origin, callback) {
        const allowedOrigins = [
          "https://modex.com.ar",
          "https://www.modex.com.ar",
          "http://localhost:5173",
        ];
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

    // Middleware
    app.use(cors(corsOptions));
    app.use(express.json());

    // Rutas de autenticación
    app.use("/auth", authRouter);
    authConfig(); // Setup de autenticación y estrategia JWT

    // Para servir las imágenes
    app.use("/uploads", express.static(path.join("public", "uploads")));

    // Rutas protegidas con /api
    app.use("/api/mantenimientos", mantenimientoRoutes);
    app.use("/api/usuarios", usuariosRouter);
    app.use("/api/empleados", empleadosRoutes);

    // Rutas de frontend (sin prefijo /api)
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
    app.use("/renovar", routerCargaProducto);
    app.use("/renovar-modex", routerCargaProductoModex);
    app.use("/cargar", routerimagenes);

    app.get("/", (req, res) => {
      res.send("🟢 API funcionando correctamente");
    });

    // Inicio del servidor
    app.listen(PORT, HOST, () => {
      console.log(`Servidor iniciado correctamente en http://${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error durante la inicialización del servidor:", error);
    process.exit(1); // Terminar el proceso si hay un error crítico
  }
};

inicializarServidor();
