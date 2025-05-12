import React, { useEffect, useState } from "react";
import Card from "@mui/joy/Card";
import Container from "@mui/material/Container";
import Grid from "@mui/joy/Grid";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import AspectRatio from "@mui/joy/AspectRatio";
import IconButton from "@mui/joy/IconButton";
import Pagination from "@mui/material/Pagination";
import DeleteIcon from "@mui/icons-material/Delete";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { useAuth } from "../Auth";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function Favorito() {
  const url = import.meta.env.VITE_URL_BACK;
  const [productos, setProductos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const itemPorPagina = 30;
  const [totales, setTotales] = useState(0);
  const [isMobile, setIsMobile] = useState(true);
  const { sesion } = useAuth();
  const navigate = useNavigate();

  const construirQuery = () => {
    return `offset=${(pagina - 1) * itemPorPagina}&limit=${itemPorPagina}`;
  };

  const getFavorito = async () => {
    try {
      const response = await fetch(`${url}/favorito`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sesion.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTotales(data.cantidadProductos);
        if (data.favoritos && Array.isArray(data.favoritos)) {
          setProductos(data.favoritos);
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

  const deleteFavorito = async (id_producto) => {
    try {
      const response = await fetch(`${url}/favorito`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sesion.token}`,
        },
        body: JSON.stringify({ id_producto }),
      });

      if (response.ok) {
        Swal.fire("Eliminado", "Producto eliminado de favoritos", "success");
        getFavorito();
      } else {
        console.error("Error al eliminar producto:", response.status);
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  };

  const addToCart = async (id_producto) => {
    try {
      const response = await fetch(`${url}/carrito`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sesion.token}`,
        },
        body: JSON.stringify({ id_producto, cantidad: 1 }),
      });

      if (response.ok) {
        Swal.fire("Agregado", "Producto agregado al carrito", "success");
      } else {
        Swal.fire("Error", "No se pudo agregar al carrito", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Error de red al agregar al carrito", "error");
    }
  };

  useEffect(() => {
    getFavorito();
  }, [pagina]);

  useEffect(() => {
    setIsMobile(window.innerWidth < 800);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 800);
    };

    window.addEventListener("resize", handleResize);
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
          bgcolor: "#e0e0e0",
          my: "20px",
          paddingLeft: isMobile ? 3 : 9,
        }}
      >
        <Typography
          level="h1"
          id="card-description"
          sx={{ fontWeight: "bold" }}
        >
          Favoritos de {sesion.username}
        </Typography>
        <Grid container spacing={3} style={{ marginTop: "10px" }}>
          {productos.length > 0 ? (
            productos.map((producto, index) => (
              <Grid item key={index} xs={12}>
                <Card
                  variant="outlined"
                  orientation={isMobile ? "vertical" : "horizontal"}
                  sx={{
                    width: "95%",
                    "&:hover": {
                      boxShadow: "md",
                      borderColor: "neutral.outlinedHoverBorder",
                    },
                  }}
                >
                  <AspectRatio
                    ratio="1"
                    sx={{ width: isMobile ? 300 : 150, cursor: "pointer" }}
                  >
                    <img
                      src={
                        producto.url_imagenes[producto.url_imagenes.length - 1]
                      }
                      alt={producto.nombre}
                      loading="lazy"
                      onClick={() =>
                        navigate(`/producto/${producto.id_producto}`)
                      }
                    />
                    <div className="badge">
                      {producto.nombre_proveedor === "air" ? (
                        <img src="/badges/24HS.png" alt="" />
                      ) : producto.nombre_proveedor === "elit" ? (
                        <img src="/badges/5_DIAS.png" alt="" />
                      ) : (
                        <img src="/badges/LOCAL.png" alt="" />
                      )}
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
                      {producto.categorias[0]}, {producto.categorias[1]}
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
                      $
                      {parseFloat(producto.precio_pesos_iva_ajustado).toFixed(
                        0
                      )}
                    </Typography>
                  </CardContent>
                  <Grid>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        marginLeft: "auto",
                      }}
                    >
                      <IconButton
                        variant="contained"
                        size="large"
                        sx={{
                          mt: 3,
                          ml: 2,
                          height: 45,
                          width: 45,
                          backgroundColor: "#FF7D21",
                          borderRadius: "50px",
                          color: "white",
                          "&:hover": { backgroundColor: "#ff924d" },
                        }}
                        onClick={() => addToCart(producto.id_producto)}
                      >
                        <AddShoppingCartIcon />
                      </IconButton>
                      <IconButton
                        variant="contained"
                        size="large"
                        sx={{
                          mt: 1,
                          ml: 2,
                          height: 45,
                          width: 45,
                          backgroundColor: "#a111ad",
                          borderRadius: "50px",
                          color: "white",
                          "&:hover": { backgroundColor: "#9e2590" },
                        }}
                        onClick={() => deleteFavorito(producto.id_producto)}
                      >
                        <DeleteIcon />
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
          page={pagina}
          onChange={(e, value) => setPagina(value)}
          color="primary"
          sx={{
            mt: 3,
            display: "flex",
            justifyContent: "center",
            "& .MuiPaginationItem-root": { color: "#a111ad" },
            "& .Mui-selected": { backgroundColor: "#a111ad", color: "white" },
            "& .MuiPaginationItem-root:hover": { backgroundColor: "#d17dcf" },
          }}
        />
      </Card>
    </div>
  );
}
