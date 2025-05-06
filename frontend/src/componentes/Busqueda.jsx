import { useEffect, useState, useContext } from "react";

import Card from "@mui/joy/Card";
import Grid from "@mui/joy/Grid";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import AspectRatio from "@mui/joy/AspectRatio";
import IconButton from "@mui/joy/IconButton";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import FavoriteIcon from "@mui/icons-material/Favorite";
import Pagination from "@mui/material/Pagination";

import { useAuth } from "../Auth";
import { SearchContext } from "../searchContext";
import { Navigate } from "react-router-dom";
export default function ProductCard() {
  const url = import.meta.env.VITE_URL_BACK;
  const { searchTerm } = useContext(SearchContext);
  const [productos, setProductos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const itemPorPagina = 30;
  const [totales, setTotales] = useState(0);
  const [isMobile, setIsMobile] = useState(true);
  const navigate = Navigate();
  const { sesion } = useAuth();
  const agregarCarrito = async (producto_id) => {
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
      console.log("aaaa");
      console.log(error);
    }
  };

  const agregarFavorito = async (producto_id) => {
    try {
      const response = await fetch(`${url}/favorito`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sesion.token}`,
        },
        body: JSON.stringify({ id_producto: producto_id }),
      });
      if (response.ok) {
        const mensaje = await response.json();
        console.log(mensaje);
      } else {
        console.log(response);
        console.log(producto_id);
      }
    } catch (error) {
      console.log("aaaa");
      console.log(error);
    }
  };

  const construirQuery = () => {
    let query = `?offset=${
      (pagina - 1) * itemPorPagina
    }&limit=${itemPorPagina}`;
    if (searchTerm) query += `&nombre=${searchTerm}`;
    return query;
  };

  const getProductos = async () => {
    try {
      const query = construirQuery();
      const response = await fetch(`${url}/productos${query}`, {
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
        console.error("Error al obtener productos:", response.status);
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  };

  useEffect(() => {
    getProductos();
  }, [pagina, searchTerm]);
  useEffect(() => {
    setIsMobile(window.innerWidth < 800);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 800);
    };

    window.addEventListener("resize", handleResize);

    //cleanup of event listener
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <div
      style={{
        margin: "0px",
        padding: "0px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100dvw",
      }}
    >
      <Card
        sx={{
          width: isMobile ? "100dvw" : "80dvw",
          bgcolor: "#F8F8F8",
          my: "20px",
          paddingLeft: isMobile ? 3 : 9,
        }}
      >
        <Grid container spacing={3} style={{ marginTop: "10px" }}>
          {productos.length > 0 ? (
            productos.map((producto, index) => (
              <Grid key={index} xs={12}>
                <Card
                  variant="outlined"
                  orientation={isMobile ? "vertical" : "horizontal"}
                  onClick={() => navigate(`/producto/${producto.id_producto}`)}
                  sx={{
                    width: "95%",
                    cursor: "pointer",
                    "&:hover": {
                      boxShadow: "md",
                      borderColor: "neutral.outlinedHoverBorder",
                    },
                  }}
                >
                  <AspectRatio ratio="1" sx={{ width: isMobile ? 300 : 150 }}>
                    <img
                      src={
                        producto.url_imagenes[producto.url_imagenes.length - 1]
                      }
                      alt={producto.nombre}
                      loading="lazy"
                    />
                    <div className="badge">
                      {producto.nombre_proveedor == "air" ? (
                        <img src="/badges/24HS.png" alt="" />
                      ) : producto.nombre_proveedor == "elit" ? (
                        <img src="/badges/5_DIAS.png" alt="" />
                      ) : (
                        <img src="/badges/LOCAL.png" alt="" />
                      )}{" "}
                    </div>
                  </AspectRatio>
                  <CardContent>
                    <Typography
                      level="h2"
                      id="card-description"
                      sx={{ fontWeight: "bold" }}
                    >
                      {producto.nombre}
                    </Typography>
                    <Typography
                      level="body-m"
                      aria-describedby="card-description"
                      sx={{ mb: 1 }}
                    >
                      {producto.categorias[0]},{producto.categorias[1]}
                    </Typography>
                    <Typography
                      level="body-m"
                      aria-describedby="card-description"
                      sx={{ mb: 1 }}
                    >
                      {producto.codigo_fabricante}
                    </Typography>
                    <Typography
                      level="h2"
                      sx={{ fontWeight: "bold", mt: 0.8, color: "#FF7d21" }}
                    >
                      {Number(
                        producto.precio_pesos_iva_ajustado
                      ).toLocaleString("es-ar", {
                        style: "currency",
                        currency: "ARS",
                        maximumFractionDigits: 0,
                      })}
                    </Typography>
                  </CardContent>
                  <Grid>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: isMobile ? "row" : "column",
                        alignItems: "center",
                        marginLeft: "auto",
                      }}
                    >
                      <IconButton
                        variant="contained"
                        size="large"
                        sx={{
                          my: 4,
                          ml: 2,
                          height: 45,
                          width: 45,
                          backgroundColor: "#a111ad",
                          borderRadius: "50px",
                          objectFit: "contain",
                          color: "white",
                          "&:active": {
                            transform: "scale(0.95)",
                            transition: "transform 0.2s ease",
                          },
                          "&:hover": {
                            backgroundColor: "#9e2590",
                          },
                        }}
                        onClick={() => agregarCarrito(producto.id_producto)}
                      >
                        <AddShoppingCartIcon />
                      </IconButton>
                      <IconButton
                        variant="contained"
                        size="large"
                        sx={{
                          ml: 2,
                          height: 45,
                          width: 45,
                          backgroundColor: "#a111ad",
                          borderRadius: "50px",
                          objectFit: "contain",
                          color: "white",
                          "&:active": {
                            transform: "scale(0.95)",
                            transition: "transform 0.2s ease",
                          },
                          "&:hover": {
                            backgroundColor: "#9e2590",
                          },
                        }}
                        onClick={() => agregarFavorito(producto.id_producto)}
                      >
                        <FavoriteIcon />
                      </IconButton>
                    </div>
                  </Grid>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography>No se encontraron productos.</Typography>
          )}
        </Grid>

        <Pagination
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
    </div>
  );
}
