import { useEffect, useState } from "react";
import {
  Card,
  Grid,
  Container,
  Typography,
  Button,
  IconButton,
  Snackbar,
  Alert,
  Pagination,
} from "@mui/material";
import Carousel from "../Carousel";
import AspectRatio from "@mui/joy/AspectRatio";
import CardContent from "@mui/joy/CardContent";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Auth";
import SkeletonProd from "../SkeletonProd";

export default function HotSaleCard() {
  const url = import.meta.env.VITE_URL_BACK;
  const [productos, setProductos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const itemPorPagina = 32;
  const [totales, setTotales] = useState(0);
  const [alerta, setAlerta] = useState(false);
  const [favorito, setFavorito] = useState([]);
  const { sesion } = useAuth();
  const navigate = useNavigate();

  const agregarCarrito = async (id_producto) => {
    try {
      await fetch(`${url}/carrito`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sesion.token}`,
        },
        body: JSON.stringify({ id_producto, cantidad: 1 }),
      });
      setAlerta(true);
    } catch (error) {
      navigate("/login");
    }
  };

  const estaEnFavoritos = (id) => favorito.includes(id);

  const getProductos = async () => {
    try {
      const offset = (pagina - 1) * itemPorPagina;
      const response = await fetch(
        `${url}/productos?oferta=1&limit=${itemPorPagina}&offset=${offset}`
      );
      const data = await response.json();
      setProductos(data.productos);
      setTotales(data.cantidadProductos);
    } catch (error) {
      console.error("Error al cargar productos hotsale", error);
    }
  };

  useEffect(() => {
    getProductos();
    // Scroll al carrusel
    const carruselElement = document.getElementById("carousel-top");
    if (carruselElement) {
      carruselElement.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pagina]);

  return (
    <>
      <div id="carousel-top">
        <Carousel />
      </div>
      <Container>
        <Typography variant="h4" gutterBottom>
          🔥 Productos en HOT SALE
        </Typography>
        <Grid container spacing={3}>
          {productos.length > 0 ? (
            productos.map((producto) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={producto.id_producto}
              >
                <Card sx={{ p: 2, bgcolor: "#fdf6f6", height: "100%" }}>
                  <AspectRatio
                    minHeight="200px"
                    sx={{ position: "relative", cursor: "pointer" }}
                  >
                    <img
                      src={
                        producto.url_imagenes[producto.url_imagenes.length - 1]
                      }
                      alt={producto.nombre}
                      style={{ objectFit: "cover" }}
                      onClick={() =>
                        navigate(`/producto/${producto.id_producto}`)
                      }
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        backgroundColor: "#ff5722",
                        color: "white",
                        padding: "4px 8px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        borderRadius: "5px",
                      }}
                    >
                      HOT SALE
                    </div>
                  </AspectRatio>
                  <CardContent>
                    <Typography fontWeight="bold" noWrap>
                      {producto.nombre}
                    </Typography>
                    <Typography variant="h6">
                      {Number(
                        producto.precio_pesos_iva_ajustado
                      ).toLocaleString("es-AR", {
                        style: "currency",
                        currency: "ARS",
                      })}
                    </Typography>
                    <Button
                      variant="contained"
                      color="secondary"
                      fullWidth
                      onClick={() => agregarCarrito(producto.id_producto)}
                      startIcon={<AddShoppingCartIcon />}
                      sx={{ mt: 1 }}
                    >
                      Agregar al Carrito
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <SkeletonProd />
          )}
        </Grid>

        <Pagination
          count={Math.ceil(totales / itemPorPagina)}
          page={pagina}
          onChange={(e, value) => setPagina(value)}
          color="primary"
          sx={{ mt: 3, display: "flex", justifyContent: "center" }}
        />

        <Snackbar
          open={alerta}
          autoHideDuration={2000}
          onClose={() => setAlerta(false)}
        >
          <Alert
            severity="success"
            icon={<AddShoppingCartIcon />}
            sx={{ backgroundColor: "#a111ad", color: "white" }}
          >
            Producto añadido al carrito
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
}
