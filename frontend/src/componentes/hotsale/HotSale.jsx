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
  TextField,
  Select,
  MenuItem,
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
  const [carrito, setCarrito] = useState([]);
  const [nombre, setNombre] = useState("");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [orden, setOrden] = useState("");
  const [categoriasDisponibles, setCategoriasDisponibles] = useState([]);
  const [categoria, setCategoria] = useState("");
  const { sesion } = useAuth();
  const navigate = useNavigate();

  const estaEnFavoritos = (id) => favorito.includes(id);

  const construirQuery = () => {
    let query = `oferta=1&offset=${(pagina - 1) * itemPorPagina}&limit=${itemPorPagina}`;
    if (nombre) query += `&nombre=${nombre}`;
    if (categoria) query += `&categoria=${categoria}`;
    if (precioMin) query += `&precio_gt=${precioMin}`;
    if (precioMax) query += `&precio_lt=${precioMax}`;
    if (orden) query += `&order=${orden}`;
    return query;
  };

  const getProductos = async () => {
    try {
      const query = construirQuery();
      const response = await fetch(`${url}/productos?${query}`);
      const data = await response.json();
      setProductos(data.productos);
      setTotales(data.cantidadProductos);
    } catch (error) {
      console.error("Error al cargar productos hotsale", error);
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await fetch(`${url}/categorias`);
      const data = await response.json();
      setCategoriasDisponibles(data.categorias || []);
    } catch (error) {
      console.error(error);
    }
  };

  const aplicarFiltros = () => {
    setPagina(1);
    getProductos();
  };

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
      setCarrito([...carrito, id_producto]);
    } catch (error) {
      navigate("/login");
    }
  };

  useEffect(() => {
    getProductos();
  }, [pagina]);

  useEffect(() => {
    fetchCategorias();
  }, []);

  return (
    <>
      <div id="carousel-top">
        <Carousel />
      </div>
      <Container>
        <Typography variant="h4" gutterBottom sx={{ mt: 10, mb: 5 }}>
          🔥 Productos en SALE!
        </Typography>

        <Card sx={{ bgcolor: "#fff", padding: 5, mb: 4 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            <TextField
              label="Buscar por Nombre"
              variant="outlined"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              size="small"
            />
            <TextField
              label="Precio Mínimo"
              variant="outlined"
              type="number"
              value={precioMin}
              onChange={(e) => setPrecioMin(e.target.value)}
              size="small"
            />
            <TextField
              label="Precio Máximo"
              variant="outlined"
              type="number"
              value={precioMax}
              onChange={(e) => setPrecioMax(e.target.value)}
              size="small"
            />
            <Select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              displayEmpty
              size="small"
              renderValue={categoria !== "" ? undefined : () => <span>Categoría</span>}
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
            <Select
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              displayEmpty
              size="small"
              renderValue={orden !== "" ? undefined : () => <span>Ordenar por</span>}
            >
              <MenuItem disabled value="">
                Ordenar por
              </MenuItem>
              <MenuItem value="asc">Precio: Menor a Mayor</MenuItem>
              <MenuItem value="desc">Precio: Mayor a Menor</MenuItem>
            </Select>
            <Button variant="contained" onClick={aplicarFiltros}>
              Aplicar Filtros
            </Button>
          </div>
        </Card>

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
                      src={producto.url_imagenes[producto.url_imagenes.length - 1]}
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
                      Modex SALE
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
