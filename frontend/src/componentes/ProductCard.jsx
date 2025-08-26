import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Button,
  Container,
  Pagination,
} from "@mui/material";

import Card from "@mui/joy/Card";
import Grid from "@mui/joy/Grid";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import AspectRatio from "@mui/joy/AspectRatio";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import FavoriteIcon from "@mui/icons-material/Favorite";

import editSvg from "../assets/edit.svg";
import { useAuth } from "../Auth";
import { useSearchParams } from "react-router-dom";

import "../producto.css";
import SkeletonProd from "./SkeletonProd";
import Swal from "sweetalert2";

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
  const [orden, setOrden] = useState(searchParams.get("order") || "");
  const esAdmin = sesion && (sesion.rol === "admin" || sesion.rol === 2);
  const [openEditar, setOpenEditar] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [formEdit, setFormEdit] = useState({});
  const [carrito, setCarrito] = useState([]);
  const [favorito, setFavorito] = useState([]);

  const construirQuery = () => {
    let query = `offset=${(pagina - 1) * itemPorPagina}&limit=${itemPorPagina}`;
    if (precioMin) query += `&precio_gt=${precioMin}`;
    if (precioMax) query += `&precio_lt=${precioMax}`;
    if (categoria) query += `&categoria=${categoria}`;
    if (nombre) query += `&nombre=${nombre}`;
    if (orden) query += `&order=${orden}`;
    return query;
  };

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
      if (response.ok) {
        setCarrito([...carrito, producto_id]);
      }
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
      if (response.ok) {
        setFavorito([...favorito, producto_id]);
      }
    } catch (error) {
      window.location.href = "/login";
    }
  };

  const estaEnFavoritos = (producto_id) => favorito.includes(producto_id);

  const getProductos = async () => {
    try {
      const query = construirQuery();
      const response = await fetch(`${url}/productos?${query}`);
      if (response.ok) {
        const data = await response.json();
        console.log(Array.isArray(data));
        setTotales(data.cantidadProductos || 0);
        setProductos(Array.isArray(data.productos) ? data.productos : []);
      } else {
        localStorage.removeItem("sesion");
        logout();
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
    if (orden) nuevosParams.set("order", orden);
    setPagina(1);
    setSearchParams(nuevosParams);
  };

  const handleCategoriaChange = (e) => {
    setCategoria(e.target.value);
    const nuevosParams = new URLSearchParams(searchParams);
    e.target.value
      ? nuevosParams.set("categoria", e.target.value)
      : nuevosParams.delete("categoria");
    setSearchParams(nuevosParams);
  };

  useEffect(() => {
    const nombreParam = searchParams.get("nombre");
    const categoriaParam = searchParams.get("categoria");
    const precioMinParam = searchParams.get("precioMin");
    const precioMaxParam = searchParams.get("precioMax");
    const ordenParam = searchParams.get("order");

    if (ordenParam !== orden) setOrden(ordenParam || "");
    if (nombreParam !== nombre) setNombre(nombreParam || "");
    if (categoriaParam !== categoria) setCategoria(categoriaParam || "");
    if (precioMinParam !== precioMin) setPrecioMin(precioMinParam || "");
    if (precioMaxParam !== precioMax) setPrecioMax(precioMaxParam || "");

    getProductos();
  }, [searchParams, pagina]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pagina]);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await fetch(`${url}/categorias`);
        const data = await response.json();
        setCategoriasDisponibles(data.categorias || []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCategorias();
  }, []);

  const handleGuardarEdicion = async () => {
    const nuevo_precio = formEdit.precio_pesos_iva;
    const producto_id = productoEditando.id_producto;
    const proveedor_id = productoEditando.id_proveedor || 1;

    try {
      const response = await fetch(
        `${url}/productos/${producto_id}?nuevo_precio=${nuevo_precio}&producto_id=${producto_id}&proveedor_id=${proveedor_id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${sesion.token}`,
          },
        }
      );

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Precio actualizado",
          text: `El precio fue modificado correctamente.`,
          confirmButtonColor: "#3085d6",
        });
        getProductos();
        setOpenEditar(false);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo actualizar el precio.",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error("Error de red:", error);
      Swal.fire({
        icon: "error",
        title: "Error de red",
        text: "No se pudo conectar con el servidor.",
        confirmButtonColor: "#d33",
      });
    }
  };

  return (
    <Container>
      <Card sx={{ bgcolor: "#fff", padding: 5, marginX: -3, marginY: 15 }}>
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
            onChange={handleCategoriaChange}
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

        <Grid container spacing={5}>
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
                      style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 2,
                      }}
                    >
                      <img
                        src={
                          Array.isArray(producto.url_imagenes) &&
                          producto.url_imagenes.length > 0
                            ? producto.url_imagenes[
                                producto.url_imagenes.length - 1
                              ]
                            : "/img/placeholder.png"
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

                    <div
                      style={{
                        position: "absolute",
                        bottom: 8,
                        left: 8,
                        backgroundColor: producto.nombre
                          .toLowerCase()
                          .includes("usado")
                          ? "#ffc107"
                          : "#4caf50",
                        color: "white",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "13px",
                        fontWeight: "bold",
                        zIndex: 3,
                      }}
                    >
                      {producto.nombre.toLowerCase().includes("usado")
                        ? " USADO"
                        : " NUEVO"}
                    </div>

                    <div className="badge" style={{ zIndex: 3 }}>
                      {producto.deposito == "CBA" ? (
                        <img src="/badges/HOTSALE.png" alt="" />
                      ) : producto.deposito == "LUG" ? (
                        <img src="/badges/HOTSALE.png" alt="" />
                      ) : (
                        <img src="/badges/LOCAL.png" alt="" />
                      )}
                    </div>

                    {esAdmin && (
                      <IconButton
                        onClick={() => {
                          setProductoEditando(producto);
                          setFormEdit({
                            nombre: producto.nombre || "",
                            detalle: producto.detalle || "",
                            precio: producto.precio_pesos_iva_ajustado || "",
                            stock: producto.stock || "",
                          });
                          setOpenEditar(true);
                        }}
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          backgroundColor: "rgba(255, 255, 255, 0.8)",
                          "&:hover": { backgroundColor: "white" },
                          boxShadow: 1,
                          zIndex: 4,
                        }}
                      >
                        <img
                          src={editSvg}
                          alt="Editar"
                          style={{ width: 20, height: 20 }}
                        />
                      </IconButton>
                    )}
                  </AspectRatio>
                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      mt: 1,
                      height: "100%",
                    }}
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
            El producto fue Añadido a Favorito
          </Alert>
        </Snackbar>

        <Pagination
          count={Math.ceil(totales / itemPorPagina)}
          page={pagina}
          onChange={(e, value) => setPagina(value)}
          color="primary"
          sx={{ mt: 3, display: "flex", justifyContent: "center" }}
        />

        {/* Modal solo visible si esAdmin */}
        <Container>
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
                <Typography>{}</Typography>
                <TextField
                  fullWidth
                  label="Precio con IVA"
                  type="number"
                  margin="normal"
                  value={formEdit.precio_pesos_iva || 0}
                  onChange={(e) =>
                    setFormEdit({
                      ...formEdit,
                      precio_pesos_iva: e.target.value,
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
        </Container>
      </Card>
    </Container>
  );
}
