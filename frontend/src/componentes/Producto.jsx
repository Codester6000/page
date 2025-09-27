import "../styles/producto.css";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import logoModo from "../assets/Logo_modo.svg";
import logoMP from "../assets/mplogo.svg";
import escudo from "/iconos/escudo.png";
import deli from "/iconos/deli.png";
import local from "/iconos/local.png";
import editSvg from "../assets/edit.svg";
import EditIcon from "@mui/icons-material/Edit";
import { useAuth } from "../Auth";
import { useNavigate } from "react-router-dom";
import {
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

export default function Producto() {
  const url = import.meta.env.VITE_URL_BACK;
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [similiraes, setSimilares] = useState([]);
  const [disponibilidad, setDisponibilidad] = useState("NO DISPONIBLE");
  const [isMobile, setIsMobile] = useState(true);
  const [alerta, setAlerta] = useState(false);
  const { sesion, logout } = useAuth();
  const navigate = useNavigate();

  // Estados para edición (nuevos)
  const [openEditar, setOpenEditar] = useState(false);
  const [formEdit, setFormEdit] = useState({});
  const esAdmin = sesion && (sesion.rol === "admin" || sesion.rol === 2);

  const disponible = (producto) => {
    producto?.stock == 0
      ? setDisponibilidad("NO DISPONIBLE")
      : producto?.stock == 1
      ? setDisponibilidad("ULTIMA UNIDAD")
      : setDisponibilidad("DISPONIBLE");
  };

  const agregarCarrito = async (producto_id) => {
    setAlerta(true);
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
      } else {
        console.log(response);
        console.log(producto_id);
      }
    } catch (error) {
      logout(navigate("/login"));
      console.log(error);
    }
  };

  const getSimilares = async (categoria) => {
    try {
      const response = await fetch(
        `${url}/productos?offset=0&limit=22&categoria=${categoria}`
      );
      if (response.ok) {
        const data = await response.json();
        setSimilares(data.productos);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Nueva función para manejar la edición del producto
  const handleGuardarEdicion = async () => {
    const producto_id = producto.id_producto;
    const dataToSend = {};

    if (formEdit.nombre !== producto.nombre && formEdit.nombre.trim() !== "") {
      dataToSend.nombre = formEdit.nombre.trim();
    }

    if (formEdit.stock !== producto.stock) {
      dataToSend.stock = Number(formEdit.stock);
    }

    if (formEdit.detalle !== producto.detalle) {
      dataToSend.detalle = formEdit.detalle;
    }

    if (formEdit.garantia_meses !== producto.garantia_meses) {
      dataToSend.garantia_meses = Number(formEdit.garantia_meses);
    }

    if (formEdit.codigo_fabricante !== producto.codigo_fabricante) {
      dataToSend.codigo_fabricante = formEdit.codigo_fabricante;
    }

    if (
      formEdit.precio_pesos_iva_ajustado !== producto.precio_pesos_iva_ajustado
    ) {
      dataToSend.precio_pesos_iva_ajustado = Number(
        formEdit.precio_pesos_iva_ajustado
      );
      dataToSend.id_proveedor = formEdit.id_proveedor || 1;
    }

    if (formEdit.url_imagen && formEdit.url_imagen.trim() !== "") {
      dataToSend.url_imagen = formEdit.url_imagen.trim();
    }

    if (Object.keys(dataToSend).length === 0) {
      Swal.fire({
        icon: "info",
        title: "Sin cambios",
        text: "No se detectaron cambios en el producto.",
        confirmButtonColor: "#3085d6",
      });
      setOpenEditar(false);
      return;
    }

    try {
      const response = await fetch(`${url}/productos/${producto_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sesion.token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        Swal.fire({
          icon: "success",
          title: "Producto actualizado",
          text: `El producto "${
            responseData.data?.nombre || "sin nombre"
          }" fue modificado correctamente.`,
          confirmButtonColor: "#3085d6",
        });

        // Recargar el producto actual
        const updatedResponse = await fetch(`${url}/productos/${id}`);
        const updatedData = await updatedResponse.json();
        setProducto(updatedData.datos[0]);
        disponible(updatedData.datos[0]);

        setOpenEditar(false);
        setFormEdit({});
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: responseData.mensaje || "No se pudo actualizar el producto.",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error("Error de red:", error);
      Swal.fire({
        icon: "error",
        title: "Error de red",
        text: "No se pudo conectar con el servidor. Verifica tu conexión.",
        confirmButtonColor: "#d33",
      });
    }
  };

  useEffect(() => {
    setIsMobile(window.innerWidth < 800);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 800);
    };

    window.addEventListener("resize", handleResize);

    //cleanup of event listener
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const getProducto = async () => {
      try {
        const response = await fetch(`${url}/productos/${id}`);
        const data = await response.json();
        setProducto(data.datos[0]);
        disponible(data.datos[0]);
        getSimilares(data.datos[0].categorias[0]);
      } catch (error) {
        console.error("Error al obtener el producto:", error);
      }
    };

    getProducto();
  }, [id]);

  return (
    <div className="productoContainer">
      <div className="responsiveDiv">
        <div className="productPhoto" style={{ position: "relative" }}>
          <div className="badge">
            {producto?.deposito == "CBA" ? (
              <img src="/badges/24HS.png" alt="" />
            ) : producto?.deposito == "LUG" ? (
              <img src="/badges/5_DIAS.png" alt="" />
            ) : (
              <img src="/badges/LOCAL.png" alt="" />
            )}{" "}
          </div>

          {/* Eliminamos el botón duplicado de la imagen */}
          <img
            src={
              producto?.url_imagenes && producto?.url_imagenes.length > 0
                ? producto?.url_imagenes[producto.url_imagenes.length - 1]
                : "/carousel/3-mobile.png"
            }
            alt=""
            className="productImage"
          />
        </div>
        <div className="responsiveDiv2">
          <div className="productInfo">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <div className="productTitle">{producto?.nombre}</div>
                <div className="productCategory">{producto?.categorias[0]}</div>
              </div>

              {/* Botón de edición para administradores */}
              {esAdmin && (
                <IconButton
                  onClick={() => {
                    setFormEdit({
                      nombre: producto.nombre || "",
                      stock: producto.stock || 0,
                      detalle: producto.detalle || "",
                      garantia_meses: producto.garantia_meses || 0,
                      codigo_fabricante: producto.codigo_fabricante || "",
                      precio_pesos_iva_ajustado:
                        producto.precio_pesos_iva_ajustado || 0,
                      id_proveedor: producto.id_proveedor || 1,
                    });
                    setOpenEditar(true);
                  }}
                  sx={{
                    backgroundColor: "#FF7D20",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#e66a1a",
                    },
                    boxShadow: 2,
                    width: 45,
                    height: 45,
                  }}
                  title="Editar producto"
                >
                  <EditIcon />
                </IconButton>
              )}
            </div>

            <div
              className="productStock"
              style={
                disponibilidad == "DISPONIBLE"
                  ? { color: "#5ca845" }
                  : { color: "#ff6a00" }
              }
            >
              <div className="stockTxt">Stock</div> {disponibilidad}
            </div>
            {producto?.stock < 5 && (
              <p style={{ fontSize: "13px" }}>
                Consultar stock por WhatsApp para validar compra
              </p>
            )}
          </div>
          <div className="productPayment">
            <div className="productPrice">
              <p style={{ fontSize: "0.9rem" }}>
                Precio de lista:{" "}
                <span style={{ color: "black", fontSize: "1rem" }}>
                  {Number(
                    Number(producto?.precio_pesos_iva_ajustado) * 1.15
                  ).toLocaleString("es-ar", {
                    style: "currency",
                    currency: "ARS",
                    maximumFractionDigits: 0,
                  })}
                </span>{" "}
              </p>
              Precio transferencia/deposito
              <span>
                {Number(producto?.precio_pesos_iva_ajustado).toLocaleString(
                  "es-ar",
                  {
                    style: "currency",
                    currency: "ARS",
                    maximumFractionDigits: 0,
                  }
                )}
              </span>
              <button
                className="btn-agregar-carrito add-cart"
                onClick={() => agregarCarrito(producto.id_producto)}
              >
                Agregar al carrito
              </button>
            </div>
            <div className="warranty">
              {" "}
              <img src={escudo} width="25px" alt="escudo garantia" />
              Garantía - {producto?.garantia_meses} meses
            </div>
            <div className="warranty">
              {" "}
              <img src={deli} width="25px" alt="escudo garantia" />
              Envios a La Rioja y alrededores
            </div>
            <div className="warranty">
              {" "}
              <img src={local} width="25px" alt="escudo garantia" />
              Retiro en el local
            </div>
            <div className="grayLine"></div>
            <div className="paymentOptions">
              <p>Medios de pago</p>
              <div className="tarjetas">
                <img src={logoMP} alt="mercado pago" className="tarjetaimg" />
                <img src={logoModo} alt="MODO" className="tarjetaimg" />
                <img
                  src="/tarjetas/visa.png"
                  alt="visaicon"
                  className="tarjetaimg"
                />
                <img
                  src="/tarjetas/mastercard.png"
                  alt="mastercard"
                  className="tarjetaimg"
                />
                <img
                  src="/tarjetas/amex.png"
                  alt="amex"
                  className="tarjetaimg"
                />
                <img
                  src="/tarjetas/naranja.png"
                  alt="naranja"
                  className="tarjetaimg"
                />
                <img
                  src="/tarjetas/maestro.png"
                  alt="maestro"
                  className="tarjetaimg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {producto?.detalle != "a" && (
        <div className="aditionalInfo">{producto?.detalle}</div>
      )}
      <div className="bloqueNI" style={{ marginBottom: "10px" }}>
        <h1 style={{ fontSize: "24px" }}>PRODUCTOS SIMILARES</h1>
        <div className="lineaNaranja">
          <a
            href={`/productos?categoria=${producto?.categorias[0]}`}
            style={{ backgroundColor: "#f7f7f7" }}
          >
            VER TODO
          </a>
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
            autoplay={{ delay: 2000, disableOnInteraction: true }}
            style={{ width: "100%" }}
          >
            {similiraes.map((similar) => (
              <SwiperSlide style={{ zIndex: 1 }} key={similar.id_producto}>
                <div className="productoCarousel">
                  <div
                    onClick={() => navigate(`/producto/${similar.id_producto}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={
                        similar.url_imagenes && similar.url_imagenes.length > 0
                          ? similar.url_imagenes[
                              similar.url_imagenes.length - 1
                            ]
                          : "/carousel/3-mobile.png" // o alguna imagen por defecto
                      }
                      alt={similar.nombre}
                      width={"150"}
                      height={"150"}
                    />
                    <h3>{similar.nombre}</h3>
                    <p>
                      {Number(similar.precio_pesos_iva_ajustado).toLocaleString(
                        "es-ar",
                        {
                          style: "currency",
                          currency: "ARS",
                          maximumFractionDigits: 0,
                        }
                      )}
                    </p>
                  </div>
                  <button
                    className="btn-agregar-carrito"
                    onClick={() => agregarCarrito(similar.id_producto)}
                    style={{ zIndex: 10 }}
                  >
                    COMPRAR
                  </button>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </div>

      {/* Modal de edición para administradores */}
      {esAdmin && (
        <Dialog
          open={openEditar}
          onClose={() => setOpenEditar(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            Editar Producto
            <IconButton
              aria-label="close"
              onClick={() => setOpenEditar(false)}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <TextField
              fullWidth
              label="Nombre del Producto"
              margin="normal"
              value={formEdit.nombre || ""}
              onChange={(e) =>
                setFormEdit({ ...formEdit, nombre: e.target.value })
              }
            />
            <TextField
              fullWidth
              label="Stock"
              type="number"
              margin="normal"
              value={formEdit.stock || 0}
              onChange={(e) =>
                setFormEdit({ ...formEdit, stock: Number(e.target.value) })
              }
            />
            <TextField
              fullWidth
              label="Detalle"
              multiline
              rows={4}
              margin="normal"
              value={formEdit.detalle || ""}
              onChange={(e) =>
                setFormEdit({ ...formEdit, detalle: e.target.value })
              }
            />
            <TextField
              fullWidth
              label="Garantía (meses)"
              type="number"
              margin="normal"
              value={formEdit.garantia_meses || 0}
              onChange={(e) =>
                setFormEdit({
                  ...formEdit,
                  garantia_meses: Number(e.target.value),
                })
              }
            />
            <TextField
              fullWidth
              label="Código de Fabricante"
              margin="normal"
              value={formEdit.codigo_fabricante || ""}
              onChange={(e) =>
                setFormEdit({
                  ...formEdit,
                  codigo_fabricante: e.target.value,
                })
              }
            />
            <TextField
              fullWidth
              label="Precio con IVA"
              type="number"
              margin="normal"
              value={formEdit.precio_pesos_iva_ajustado || 0}
              onChange={(e) =>
                setFormEdit({
                  ...formEdit,
                  precio_pesos_iva_ajustado: e.target.value,
                })
              }
            />
            <TextField
              fullWidth
              label="URL de imagen"
              margin="normal"
              value={formEdit.url_imagen || ""}
              onChange={(e) =>
                setFormEdit({
                  ...formEdit,
                  url_imagen: e.target.value,
                })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditar(false)}>Cancelar</Button>
            <Button variant="contained" onClick={handleGuardarEdicion}>
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Snackbar
        open={alerta}
        autoHideDuration={2000}
        onClose={() => setAlerta(false)}
        variant="solid"
      >
        <Alert
          size="large"
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
          El producto fué Añadido al Carrito
        </Alert>
      </Snackbar>
    </div>
  );
}
