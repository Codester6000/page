import { useEffect, useState } from "react";
import {
  Container,
  TextField,
  Button,
  Select,
  MenuItem,
  Pagination,
  Snackbar,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Card from "@mui/joy/Card";
import Grid from "@mui/joy/Grid";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import AspectRatio from "@mui/joy/AspectRatio";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CloseIcon from "@mui/icons-material/Close";
import editSvg from "../../assets/edit.svg";
import { useAuth } from "../../Auth";
import SkeletonProd from "../../componentes/SkeletonProd";
import Swal from "sweetalert2";
import Carousel from "../Carousel";

export default function ProductCardNuevos() {
  const url = import.meta.env.VITE_URL_BACK;
  const { sesion, logout } = useAuth();
  const [productos, setProductos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totales, setTotales] = useState(0);
  const itemPorPagina = 32;
  const [nombre, setNombre] = useState("");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [orden, setOrden] = useState("");
  const [categoriasDisponibles, setCategoriasDisponibles] = useState([]);
  const [categoria, setCategoria] = useState("");
  const [alerta, setAlerta] = useState(false);
  const [alertaFav, setAlertaFav] = useState(false);
  const [carrito, setCarrito] = useState([]);
  const [favorito, setFavorito] = useState([]);
  const esAdmin = sesion && (sesion.rol === "admin" || sesion.rol === 2);

  const estaEnFavoritos = (producto_id) => favorito.includes(producto_id);

  const construirQuery = () => {
    let query = `usado=0&offset=${
      (pagina - 1) * itemPorPagina
    }&limit=${itemPorPagina}`;
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
      if (response.ok) {
        setProductos(data.productos);
        setTotales(data.cantidadProductos);
      } else {
        localStorage.removeItem("sesion");
        logout();
      }
    } catch (error) {
      console.error("Error al obtener productos nuevos", error);
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

  useEffect(() => {
    getProductos();
  }, [pagina]);

  useEffect(() => {
    fetchCategorias();
  }, []);

  const agregarCarrito = async (producto_id) => {
    if (carrito.includes(producto_id)) return;
    try {
      const response = await fetch(`${url}/carrito`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sesion.token}`,
        },
        body: JSON.stringify({ id_producto: producto_id, cantidad: 1 }),
      });
      if (response.ok) setCarrito([...carrito, producto_id]);
    } catch (error) {
      window.location.href = "/login";
    }
  };

  const agregarFavorito = async (producto_id) => {
    if (favorito.includes(producto_id)) return;
    try {
      const response = await fetch(`${url}/favorito`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sesion.token}`,
        },
        body: JSON.stringify({ id_producto: producto_id, cantidad: 1 }),
      });
      if (response.ok) setFavorito([...favorito, producto_id]);
    } catch (error) {
      window.location.href = "/login";
    }
  };

  return (
    <>
      <Carousel />
      <Container sx={{ mt: 10 }}>
        <Typography level="h2" sx={{ mb: 2 }}>
          Productos Nuevos
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
              renderValue={
                categoria !== "" ? undefined : () => <span>Categoría</span>
              }
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
              renderValue={
                orden !== "" ? undefined : () => <span>Ordenar por</span>
              }
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

        <Grid container spacing={5} sx={{mb:20}}>
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
                <Card
                  sx={{
                    mt: 3,
                    width: 280,
                    bgcolor: "#FAFAFA",
                    height: 500,
                    display: "flex",
                  }}
                >
                  <AspectRatio
                    minHeight="250px"
                    maxHeight="200px"
                    sx={{ position: "relative" }}
                  >
                    <a
                      href={`/producto/${producto.id_producto}`}
                      style={{ position: "absolute", inset: 0, zIndex: 2 }}
                    >
                      <img
                        src={
                          producto.url_imagenes[
                            producto.url_imagenes.length - 1
                          ]
                        }
                        alt={producto.nombre}
                        loading="lazy"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          pointerEvents: "none",
                        }}
                      />
                    </a>

                    {/* Badge NUEVO */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 8,
                        left: 8,
                        backgroundColor: "#4caf50",
                        color: "white",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "13px",
                        fontWeight: "bold",
                        zIndex: 3,
                      }}
                    >
                      NUEVO
                    </div>

                    {/* Badge HOTSALE / LOCAL */}
                    <div className="badge" style={{ zIndex: 3 }}>
                      {producto.deposito === "CBA" ? (
                        <img src="/badges/HOTSALE.png" alt="" />
                      ) : producto.deposito === "LUG" ? (
                        <img src="/badges/HOTSALE.png" alt="" />
                      ) : (
                        <img src="/badges/LOCAL.png" alt="" />
                      )}
                    </div>
                  </AspectRatio>

                  <CardContent
                    sx={{ display: "flex", flexDirection: "column" }}
                  >
                    <Typography
                      sx={{
                        overflow: "hidden",
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
                        onClick={() => {
                          agregarCarrito(producto.id_producto);
                          setAlerta(true);
                        }}
                        startIcon={<AddShoppingCartIcon />}
                        sx={{
                          ml: 2,
                          my: 2,
                          backgroundColor: "#FF7D20",
                          borderRadius: "20px",
                        }}
                      >
                        Agregar al Carrito
                      </Button>
                      <IconButton
                        onClick={() => {
                          agregarFavorito(producto.id_producto);
                          setAlertaFav(true);
                        }}
                        sx={{
                          ml: 2,
                          backgroundColor: "#FF7D20",
                          borderRadius: "50px",
                          color: "white",
                        }}
                      >
                        {estaEnFavoritos(producto.id_producto) ? (
                          <FavoriteIcon sx={{ color: "orange" }} />
                        ) : (
                          <FavoriteIcon />
                        )}
                      </IconButton>
                    </div>
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
            El producto fue Añadido al Carrito
          </Alert>
        </Snackbar>

        <Snackbar
          open={alertaFav}
          autoHideDuration={2000}
          onClose={() => setAlertaFav(false)}
        >
          <Alert
            severity="success"
            icon={<FavoriteIcon />}
            sx={{ backgroundColor: "#a111ad", color: "white" }}
          >
            El producto fue Añadido a Favoritos
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
}
