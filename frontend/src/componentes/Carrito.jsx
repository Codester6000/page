import { useEffect, useState } from "react";
import {
  Card,
  Grid,
  CardContent,
  Typography,
  Button,
  IconButton,
  TextField,
  Avatar,
  Container,
  Box,
  Divider,
  Pagination,
  useMediaQuery,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuth } from "../Auth";
import { useNavigate } from "react-router-dom";

export default function Carrito() {
  const url = import.meta.env.VITE_URL_BACK;
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const itemPorPagina = 30;
  const [totales, setTotales] = useState(0);
  const isMobile = useMediaQuery("(max-width:800px)");

  const { sesion } = useAuth();

  const getCarrito = async () => {
    try {
      const response = await fetch(`${url}/carrito`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sesion.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProductos(data.carrito || []);
        const total = data.carrito.reduce(
          (sum, producto) =>
            sum +
            parseFloat(producto.precio_pesos_iva_ajustado) * producto.cantidad,
          0
        );
        setTotales(total);
      }
    } catch (error) {
      console.error("Error al obtener productos:", error);
    }
  };

  const deleteCarrito = async (id_producto) => {
    try {
      await fetch(`${url}/carrito`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sesion.token}`,
        },
        body: JSON.stringify({ id_producto }),
      });
      getCarrito();
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  };

  const putCarrito = async (id_producto, cantidadProductos) => {
    try {
      await fetch(`${url}/carrito`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sesion.token}`,
        },
        body: JSON.stringify({ id_producto, cantidad: cantidadProductos }),
      });
      getCarrito();
    } catch (error) {
      console.error("Error en la solicitud de actualización:", error);
    }
  };

  useEffect(() => {
    getCarrito();
  }, [pagina]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Carrito de {sesion.username}
      </Typography>

      <Grid container spacing={3}>
        {productos.map((producto) => (
          <Grid item xs={12} key={producto.id_producto}>
            <Card
              sx={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                p: 2,
              }}
            >
              <Avatar
                variant="rounded"
                src={producto.url_imagenes[producto.url_imagenes.length - 1]}
                sx={{ width: 120, height: 120, mr: 2 }}
              />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" fontWeight="bold">
                  {producto.nombre}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {producto.categorias.join(", ")}
                </Typography>
                <Typography variant="body2" mt={1}>
                  Código: {producto.codigo_fabricante}
                </Typography>
                <Typography
                  variant="body1"
                  mt={1}
                  color="primary"
                  fontWeight="bold"
                >
                  {Number(producto.precio_pesos_iva_ajustado).toLocaleString(
                    "es-ar",
                    {
                      style: "currency",
                      currency: "ARS",
                      maximumFractionDigits: 0,
                    }
                  )}
                </Typography>
              </Box>
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                mt={isMobile ? 2 : 0}
              >
                <Button
                  variant="contained"
                  color="secondary"
                  disabled={producto.cantidad <= 1}
                  onClick={() =>
                    putCarrito(producto.id_producto, producto.cantidad - 1)
                  }
                >
                  -
                </Button>
                <TextField
                  size="small"
                  value={producto.cantidad}
                  inputProps={{
                    readOnly: true,
                    style: { textAlign: "center" },
                  }}
                  sx={{ width: 50 }}
                />
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() =>
                    putCarrito(producto.id_producto, producto.cantidad + 1)
                  }
                >
                  +
                </Button>
                <IconButton
                  color="error"
                  onClick={() => deleteCarrito(producto.id_producto)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Box textAlign="right" mb={2}>
        <Typography variant="h6">
          Total:{" "}
          {totales.toLocaleString("es-ar", {
            style: "currency",
            currency: "ARS",
            maximumFractionDigits: 0,
          })}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{ mt: 2 }}
          onClick={() => navigate("/checkout")}
        >
          Finalizar Compra
        </Button>
      </Box>

      <Pagination
        count={Math.ceil(productos.length / itemPorPagina)}
        page={pagina}
        onChange={(e, value) => setPagina(value)}
        color="primary"
        sx={{ display: "flex", justifyContent: "center" }}
      />
    </Container>
  );
}
