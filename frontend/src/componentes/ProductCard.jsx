import { useEffect, useState } from "react";

import Card from "@mui/joy/Card";
import Container from "@mui/material/Container";
import Grid from "@mui/joy/Grid";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import AspectRatio from "@mui/joy/AspectRatio";
import Button from "@mui/material/Button";
import IconButton from "@mui/joy/IconButton";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import FavoriteIcon from "@mui/icons-material/Favorite";
import Pagination from "@mui/material/Pagination";
import editSvg from "../assets/edit.svg";
import carritoSVG from "../assets/carrito.svg";
import corazonSVG from "../assets/corazon.svg";
import { useAuth, AuthRol } from "../Auth";
import { Alert, MenuItem, Select, Snackbar, TextField } from "@mui/material";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import "../producto.css";
import { motion } from "framer-motion";
import SkeletonProd from "./SkeletonProd";

export default function ProductCard() {
  const url = import.meta.env.VITE_URL_BACK;
  const [productos, setProductos] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [categoriasDisponibles, setCategoriasDisponibles] = useState([]);

  const [pagina, setPagina] = useState(1);
  const itemPorPagina = 32;
  const [totales, setTotales] = useState(0);
  const [nombre, setNombre] = useState(searchParams.get("nombre") || "");
  const [categoria, setCategoria] = useState(
    searchParams.get("categoria") || ""
  );
  const [precioMax, setPrecioMax] = useState(
    searchParams.get("precioMax") || ""
  );
  const [precioMin, setPrecioMin] = useState(
    searchParams.get("precioMin") || ""
  );
  const [favoritos, setFavoritos] = useState([]);
  const { sesion, logout } = useAuth();
  const [alerta, setAlerta] = useState(false);
  const [alertaFav, setAlertaFav] = useState(false);
  const [carrito, setCarrito] = useState([]);
  const [favorito, setFavorito] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const navigate = useNavigate();

  const construirQuery = () => {
    let query = `offset=${(pagina - 1) * itemPorPagina}&limit=${itemPorPagina}`;
    if (precioMin) query += `&precio_gt=${precioMin}`;
    if (precioMax) query += `&precio_lt=${precioMax}`;
    if (categoria) query += `&categoria=${categoria}`;
    if (nombre) query += `&nombre=${nombre}`;
    return query;
  };

  const handleAgregarImagen = async (producto_id) => {
    const url_imagen = window.prompt("Ingresa la url de la nueva imagen");
    if (url_imagen.length > 5) {
      try {
        const response = await fetch(`${url}/productos/imagen/${producto_id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sesion.token}`,
          },
          body: JSON.stringify({ url: url_imagen }),
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleAgregarDetalle = async (producto_id) => {
    const detalle = window.prompt("Ingresa el detalle nuevo");
    if (detalle.length > 5) {
      try {
        const response = await fetch(
          `${url}/productos/detalle/${producto_id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sesion.token}`,
            },
            body: JSON.stringify({ detalle: detalle }),
          }
        );
      } catch (error) {
        console.error(error);
      }
    }
  };
  const agregarCarrito = async (producto_id) => {
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
        setCarrito([...carrito, producto_id]);
      } else {
        console.log(response);
        console.log(producto_id);
      }
    } catch (error) {
      navigate("/login");
      console.log("aaaa");
      console.log(error);
    }
  };

  const agregarFavorito = async (producto_id) => {
    if (favorito.includes(producto_id)) {
      console.log("El producto ya está en favorito");
      return;
    }

    try {
      const response = await fetch(`${url}/favorito`, {
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
        setFavorito([...favorito, producto_id]);
      } else {
        console.log(response);
        console.log(producto_id);
      }
    } catch (error) {
      navigate("/login");
      console.log("aaaa");
      console.log(error);
    }
  };

  const estaEnFavoritos = (producto_id) => favorito.includes(producto_id);

  const getProductos = async () => {
    try {
      const query = construirQuery();
      const response = await fetch(`${url}/productos?${query}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTotales(data.cantidadProductos);
        if (data.productos && Array.isArray(data.productos)) {
          setProductos(data.productos);
        } else {
          console.error("Estructura de datos incorrecta:", data);
        }
      } else {
        localStorage.removeItem("sesion");
        logout();
        console.error("Error al obtener productos:", response.status);
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  };

  const getProductoById = async (id_producto_seleccionado) => {
    try {
      const response = await fetch(
        `${url}/productos/${id_producto_seleccionado}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const resultado = await response.json();
        setProductoSeleccionado(resultado.datos[0]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const aplicarFiltros = () => {
    const nuevosParams = new URLSearchParams();

    if (nombre) nuevosParams.set("nombre", nombre);
    if (categoria) nuevosParams.set("categoria", categoria);
    if (precioMin) nuevosParams.set("precioMin", precioMin);
    if (precioMax) nuevosParams.set("precioMax", precioMax);

    setPagina(1);
    setSearchParams(nuevosParams);
  };

  const handleCategoriaChange = (e) => {
    setCategoria(e.target.value);
    const nuevosParams = new URLSearchParams(searchParams);
    if (e.target.value) {
      nuevosParams.set("categoria", e.target.value);
    } else {
      nuevosParams.delete("categoria");
    }
    setSearchParams(nuevosParams);
  };

  useEffect(() => {
    const nombreParam = searchParams.get("nombre");
    const categoriaParam = searchParams.get("categoria");
    const precioMinParam = searchParams.get("precioMin");
    const precioMaxParam = searchParams.get("precioMax");

    if (nombreParam !== nombre) setNombre(nombreParam || "");
    if (categoriaParam !== categoria) setCategoria(categoriaParam || "");
    if (precioMinParam !== precioMin) setPrecioMin(precioMinParam || "");
    if (precioMaxParam !== precioMax) setPrecioMax(precioMaxParam || "");

    getProductos();
  }, [searchParams, pagina]);
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await fetch(`${url}/categorias`);
        const data = await response.json();
        setCategoriasDisponibles(data.categorias || []);
      } catch (error) {
        console.error("Error al obtener categorías:", error);
      }
    };
    fetchCategorias();
  }, []);

  return (
    <Container sx={{}}>
      {/* <SkeletonProd></SkeletonProd> */}
      <Card sx={{ bgcolor: "#FFfff", padding: 5, marginX: -10, marginY: 5 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            alignItems: "flex-end",
            marginBottom: 24,
          }}
        >
          <TextField
            label="Buscar por Nombre"
            variant="outlined"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            size="small"
            sx={{
              width: { xs: "100%", sm: "200px" },
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                backgroundColor: "#f4f4f4",
              },
            }}
          />
          <TextField
            label="Precio Mínimo"
            variant="outlined"
            type="number"
            value={precioMin}
            onChange={(e) => setPrecioMin(e.target.value)}
            size="small"
            sx={{
              width: { xs: "100%", sm: "150px" },
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                backgroundColor: "#f4f4f4",
              },
            }}
          />
          <TextField
            label="Precio Máximo"
            variant="outlined"
            type="number"
            value={precioMax}
            onChange={(e) => setPrecioMax(e.target.value)}
            size="small"
            sx={{
              width: { xs: "100%", sm: "150px" },
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                backgroundColor: "#f4f4f4",
              },
            }}
          />
          <Select
            value={categoria}
            onChange={handleCategoriaChange}
            displayEmpty
            size="small"
            renderValue={
              categoria !== ""
                ? undefined
                : () => <span style={{ color: "#ffffff" }}>Categoría</span>
            }
            sx={{
              width: { xs: "100%", sm: "180px" },
              borderRadius: "12px",
              backgroundColor: "#ffffff",
              "& .MuiSelect-select": {
                paddingY: "10px",
                paddingX: "14px",
              },
            }}
          >
            <MenuItem disabled value="">
              Categoría
            </MenuItem>
            {categoriasDisponibles.map((cat) => (
              <MenuItem key={cat.id_categoria} value={cat.nombre_categoria}>
                {cat.nombre_categoria}
              </MenuItem>
            ))}
          </Select>

          <Button
            variant="contained"
            onClick={aplicarFiltros}
            sx={{
              background: "linear-gradient(to right, #ff8a00, #ff6a00)",
              borderRadius: "12px",
              paddingX: 3,
              height: "40px",
              color: "white",
              boxShadow: "0px 4px 14px rgba(0, 0, 0, 0.2)",
              "&:hover": {
                background: "linear-gradient(to right, #ff6a00, #ff8a00)",
              },
            }}
          >
            Aplicar Filtros
          </Button>
        </div>

        <Grid
          container
          spacing={5}
          style={{ marginTop: "50px" }}
          className="productosLista"
        >
          {productos.length > 0 ? (
            productos.map((producto, index) => (
              <Grid
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={producto.id_producto}
                onClick={() => {
                  getProductoById(producto.id_producto);
                }}
                className="productoCarta"
              >
                <Card
                  sx={{
                    mt: 3,
                    width: 280,
                    bgcolor: "#FAFAFA",
                    height: 450,
                    display: "flex",
                  }}
                >
                  <div className="badge">
                    {producto.nombre_proveedor == "air" ? (
                      <img src="/badges/24HS.png" alt="" />
                    ) : producto.nombre_proveedor == "elit" ? (
                      <img src="/badges/5_DIAS.png" alt="" />
                    ) : (
                      <img src="/badges/LOCAL.png" alt="" />
                    )}{" "}
                  </div>
                  <AuthRol rol="2">
                    <div className="editar">
                      <img
                        src={editSvg}
                        alt=""
                        onClick={() =>
                          handleAgregarImagen(producto.id_producto)
                        }
                      />
                    </div>
                  </AuthRol>
                  <AspectRatio minHeight="250px" maxHeight="200px">
                    <img
                      src={
                        producto.url_imagenes[producto.url_imagenes.length - 1]
                      }
                      alt={producto.nombre}
                      loading="lazy"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onClick={() =>
                        navigate(`/producto/${producto.id_producto}`)
                      }
                    />
                  </AspectRatio>
                  <CardContent
                    orientation="horizontal"
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      mt: 1,
                      height: "100%",
                    }}
                  >
                    <div>
                      <Typography
                        sx={{
                          display: "-webkit-box",
                          overflow: "hidden",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: 2,
                          height: "25px",
                          textOverflow: "ellipsis",
                          fontWeight: "bold",
                        }}
                      >
                        {producto.nombre}
                      </Typography>
                      <Typography level="h3" sx={{ fontWeight: "md", mt: 0.8 }}>
                        {Number(
                          producto.precio_pesos_iva_ajustado
                        ).toLocaleString("es-ar", {
                          style: "currency",
                          currency: "ARS",
                          maximumFractionDigits: 0,
                        })}
                      </Typography>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginLeft: "auto",
                        }}
                      >
                        <Button
                          variant="contained"
                          size="large"
                          onClick={() => {
                            agregarCarrito(producto.id_producto);
                            setAlerta(true);
                          }}
                          startIcon={<AddShoppingCartIcon />}
                          sx={{
                            ml: 2,
                            my: 2,
                            backgroundColor: "#FF7D20",
                            height: "10 % ",
                            width: "70%",
                            borderRadius: "20px",
                            fontSize: "0.75rem",
                            objectFit: "contain",
                          }}
                        >
                          Agregar al Carrito
                        </Button>
                        <IconButton
                          variant="contained"
                          size="large"
                          sx={{
                            ml: 2,
                            height: 45,
                            width: 45,
                            backgroundColor: "#FF7D20",
                            borderRadius: "50px",
                            objectFit: "contain",
                            color: "white",
                            "&:active": {
                              transform: "scale(0.95)",
                              transition: "transform 0.2s ease",
                            },
                            "&:hover": {
                              backgroundColor: "#d4671a",
                            },
                          }}
                          onClick={() => {
                            agregarFavorito(producto.id_producto);
                            setAlertaFav(true);
                          }}
                        >
                          {estaEnFavoritos(producto.id_producto) ? (
                            <FavoriteIcon sx={{ color: "orange" }} />
                          ) : (
                            <FavoriteIcon />
                          )}
                        </IconButton>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <SkeletonProd></SkeletonProd>
            // <Typography>Despues pongo un mensaje de error o skeleton</Typography>
          )}
        </Grid>
        <div className="productoSeleccionado">
          {productoSeleccionado != "" && (
            <div className="prSeleccionadoCard">
              <div className="prImagen">
                <img
                  src={
                    productoSeleccionado.url_imagenes[
                      productoSeleccionado.url_imagenes.length - 1
                    ]
                  }
                  alt=""
                  onClick={() =>
                    navigate(`/producto/${productoSeleccionado.id_producto}`)
                  }
                />
              </div>
              <div className="prInfo">
                <button
                  className="cerrar"
                  onClick={() => setProductoSeleccionado("")}
                >
                  X
                </button>
                <h2
                  className="nombreProducto"
                  onClick={() =>
                    navigate(`/producto/${productoSeleccionado.id_producto}`)
                  }
                >
                  {productoSeleccionado.nombre}
                </h2>
                <p
                  className="prPrecio"
                  onClick={() =>
                    navigate(`/producto/${productoSeleccionado.id_producto}`)
                  }
                >
                  {Number(
                    productoSeleccionado.precio_pesos_iva_ajustado
                  ).toLocaleString("es-ar", {
                    style: "currency",
                    currency: "ARS",
                    maximumFractionDigits: 0,
                  })}
                </p>
                <p
                  className="prDescripcion"
                  onClick={() =>
                    navigate(`/producto/${productoSeleccionado.id_producto}`)
                  }
                >
                  {productoSeleccionado.detalle}
                  <AuthRol rol="2">
                    <div className="editarDetalle">
                      <img
                        src={editSvg}
                        alt=""
                        onClick={() =>
                          handleAgregarDetalle(productoSeleccionado.id_producto)
                        }
                      />
                    </div>
                  </AuthRol>
                </p>

                <button
                  className="prAddCarrito"
                  onClick={() => {
                    agregarCarrito(productoSeleccionado.id_producto);
                    setAlerta(true);
                  }}
                >
                  <img src={carritoSVG} alt="" />
                  <p>agregar al carrito</p>
                </button>
                <button
                  className="prAddFav"
                  onClick={() => {
                    agregarFavorito(productoSeleccionado.id_producto);
                    setAlertaFav(true);
                  }}
                >
                  <img src={corazonSVG} alt="" />
                  <p>agregar a favoritos</p>
                </button>
              </div>
            </div>
          )}
        </div>
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
        <Snackbar
          open={alertaFav}
          autoHideDuration={2000}
          onClose={() => setAlertaFav(false)}
          variant="solid"
        >
          <Alert
            size="large"
            severity="success"
            icon={<FavoriteIcon sx={{ fontSize: "2rem", color: "white" }} />}
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
            El producto fué Añadido a Favorito
          </Alert>
        </Snackbar>
        <Pagination
          className="paginador"
          count={Math.ceil(totales / itemPorPagina)}
          pagina={pagina}
          onChange={(e, value) => setPagina(value)}
          color="primary"
          sx={{
            mt: 3,
            display: "flex",
            justifyContent: "center",
            "& .MuiPaginationItem-root": {
              color: "#a111ad",
            },
            "& .Mui-selected": {
              backgroundColor: "#a111ad",
              color: "white",
            },
            "& .MuiPaginationItem-root:hover": {
              backgroundColor: "#d17dcf",
            },
          }}
        />
      </Card>
    </Container>
  );
}
