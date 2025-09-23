import "../styles/portada.css";
import Carousel from "./Carousel";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Auth";
import BuscadorYAccesoArmador from "./inicio/buscadorYAccesoArmador";

import {
  Snackbar,
  Alert,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";

export default function Portada() {
  const url = import.meta.env.VITE_URL_BACK;
  const { sesion, logout } = useAuth();
  const navigate = useNavigate();

  const [notebooks, setNotebooks] = useState([]);
  const [armados, setArmados] = useState([]);
  const [nuevosIngresos, setNuevosIngresos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [alerta, setAlerta] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 800);

  const fetchProductos = async () => {
    try {
      const [notebooksRes, nuevosIngresosRes, armadosRes] = await Promise.all([
        fetch(`${url}/productos?offset=0&limit=22&categoria=Notebook`),
        fetch(`${url}/productos?offset=0&limit=22`),
        fetch(`${url}/productos?offset=0&limit=22&categoria=computadoras`),
      ]);

      const [notebooksData, nuevosIngresosData, armadosData] =
        await Promise.all([
          notebooksRes.json(),
          nuevosIngresosRes.json(),
          armadosRes.json(),
        ]);

      setNotebooks(notebooksData.productos || []);
      setNuevosIngresos(nuevosIngresosData.productos || []);
      setArmados(armadosData.productos || []);
    } catch (error) {
      console.error("Error cargando productos:", error);
    } finally {
      setLoading(false);
    }
  };

  const agregarCarrito = async (producto_id) => {
    setAlerta(true);

    if (carrito.includes(producto_id)) {
      console.log("El producto ya está en el carrito");
      return;
    }

    try {
      const response = await fetch(`${url}/carrito`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sesion.token}`,
        },
        body: JSON.stringify({ id_producto: producto_id, cantidad: 1 }),
      });

      if (response.ok) {
        const mensaje = await response.json();
        console.log(mensaje);
        setCarrito((prev) => [...prev, producto_id]);
      } else {
        console.error("Error al agregar al carrito", await response.json());
      }
    } catch (error) {
      console.error("Fallo en agregarCarrito:", error);
      logout();
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 800);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return (
    <div className="portada">
      <Carousel />

      {/* Marcas */}
      <motion.div
        className="marcas"
        initial={{ opacity: 0, rotateX: 100 }}
        whileInView={{ opacity: 1, rotateX: 0 }}
        transition={{ duration: 0.5 }}
      >
        {[
          { img: "/iconos/nvidia.png", categoria: "nvidia" },
          { img: "/iconos/radeon.png", categoria: "amd radeon" },
          { img: "/iconos/intel.png", categoria: "intel" },
          { img: "/iconos/amd.png", categoria: "amd" },
        ].map((marca, idx) => (
          <div
            key={idx}
            className="marca"
            onClick={() => navigate(`/productos?nombre=${marca.categoria}`)}
          >
            <img
              src={marca.img}
              alt={marca.categoria}
              className="margalogo"
              width={marca.categoria === "intel" ? "60%" : "100%"}
            />
          </div>
        ))}
      </motion.div>

      {/* Acceso a armador */}
      <BuscadorYAccesoArmador />

      {/* Nuevos Ingresos */}
      <SeccionProductos
        titulo="Nuevos Ingresos"
        productos={nuevosIngresos}
        verTodoLink="/productos"
        isMobile={isMobile}
        agregarCarrito={agregarCarrito}
        navigate={navigate}
      />

      {/* Armados */}
      <SeccionProductos
        titulo="Armados"
        productos={armados}
        verTodoLink="/productos?categoria=computadoras"
        isMobile={isMobile}
        agregarCarrito={agregarCarrito}
        navigate={navigate}
      />

      {/* Notebooks */}
      <SeccionProductos
        titulo="Notebooks"
        productos={notebooks}
        verTodoLink="/productos?categoria=Notebook"
        isMobile={isMobile}
        agregarCarrito={agregarCarrito}
        navigate={navigate}
      />

      {/* Snackbar */}
      <Snackbar
        open={alerta}
        autoHideDuration={2000}
        onClose={() => setAlerta(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          icon={
            <AddShoppingCartIcon sx={{ fontSize: "2rem", color: "white" }} />
          }
          sx={{
            backgroundColor: "#a111ad",
            color: "white",
            fontSize: "1rem",
            padding: "12px",
            display: "flex",
            alignItems: "center",
            borderRadius: 3,
          }}
        >
          El producto fue añadido al carrito
        </Alert>
      </Snackbar>
    </div>
  );
}

function SeccionProductos({
  titulo,
  productos,
  verTodoLink,
  isMobile,
  agregarCarrito,
  navigate,
}) {
  return (
    <div className="nuevosIngresos">
      <div className="bloqueNI">
        <Typography
          sx={{
            width: "auto",
            display: "flex",
            flexDirection: "column",
            textAlign: "center",
            fontWeight: "800",
            color: "white",
            padding: "10px",
            fontFamily: "sans-serif",
            fontSize: "20px",
            borderRadius: "100px",
            bgcolor: "#FF7D20",
          }}
        >
          {titulo.toUpperCase()}
        </Typography>
        <div className="lineaNaranja">
          <a href={verTodoLink}>VER TODO</a>
        </div>
      </div>

      <div className="productosPortada">
        <motion.div
          className="animacion"
          initial={{ opacity: 0, x: isMobile ? 0 : 800 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "linear" }}
        >
          <Swiper
            watchSlidesProgress={true}
            slidesPerView={isMobile ? 2 : 5}
            className="mySwiper"
            loop={true}
            modules={[Autoplay]}
            autoplay={{ delay: 2000, disableOnInteraction: false }}
          >
            {productos.map((producto) => (
              <SwiperSlide key={producto.id_producto}>
                <div className="productoCarousel">
                  <div
                    onClick={() =>
                      navigate(`/producto/${producto.id_producto}`)
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={producto.url_imagenes?.slice(-1)[0]}
                      alt={producto.nombre}
                      width={"155"}
                      height={"155"}
                    />
                    <h3>{producto.nombre}</h3>
                    <p>
                      {Number(
                        producto.precio_pesos_iva_ajustado
                      ).toLocaleString("es-AR", {
                        style: "currency",
                        currency: "ARS",
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                  <button
                    className="btn-agregar-carrito"
                    onClick={() => agregarCarrito(producto.id_producto)}
                  >
                    COMPRAR
                  </button>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </div>
    </div>
  );
}
