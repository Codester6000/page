import React, { useState } from "react";
import {
  TextField,
  Select,
  MenuItem,
  Button,
  Typography,
  Box,
  Grid,
  Paper,
  InputLabel,
  FormControl,
  Alert,
} from "@mui/material";

const url = import.meta.env.VITE_URL_BACK;

const NuevoProducto = () => {
  const [form, setForm] = useState({
    marca: "",
    categoria: "",
    sub_categoria: "",
    nombre: "",
    stock: "",
    detalle: "",
    garantia_meses: "",
    ancho: "",
    alto: "",
    largo: "",
    peso: "",
    codigo_fabricante: "",
    proveedor: "",
    precio_dolar: "",
    precio_dolar_iva: "",
    iva: "",
    precio_pesos: "",
    precio_pesos_iva: "",
    url_imagen: "",
    deposito: "",
  });

  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: "", texto: "" });

    // Validación básica
    if (!form.nombre || !form.codigo_fabricante || !form.marca) {
      setMensaje({
        tipo: "error",
        texto:
          "Por favor completa los campos obligatorios: Nombre, Código Fabricante y Marca",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${url}/productos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: form.nombre,
          stock: parseInt(form.stock) || 0,
          garantia_meses: parseInt(form.garantia_meses) || 0,
          detalle: form.detalle,
          largo: parseFloat(form.largo) || 0,
          alto: parseFloat(form.alto) || 0,
          ancho: parseFloat(form.ancho) || 0,
          peso: parseFloat(form.peso) || 0,
          codigo_fabricante: form.codigo_fabricante,
          marca: form.marca,
          categoria: form.categoria,
          sub_categoria: form.sub_categoria,
          proveedor: form.proveedor,
          precio_dolar: parseFloat(form.precio_dolar) || 0,
          precio_dolar_iva: parseFloat(form.precio_dolar_iva) || 0,
          iva: parseFloat(form.iva) || 0,
          precio_pesos: parseFloat(form.precio_pesos) || 0,
          precio_pesos_iva: parseFloat(form.precio_pesos_iva) || 0,
          url_imagen: form.url_imagen,
          deposito: form.deposito,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMensaje({
          tipo: "success",
          texto: "Producto cargado exitosamente",
        });
        // Limpiar formulario
        setForm({
          marca: "",
          categoria: "",
          sub_categoria: "",
          nombre: "",
          stock: "",
          detalle: "",
          garantia_meses: "",
          ancho: "",
          alto: "",
          largo: "",
          peso: "",
          codigo_fabricante: "",
          proveedor: "",
          precio_dolar: "",
          precio_dolar_iva: "",
          iva: "",
          precio_pesos: "",
          precio_pesos_iva: "",
          url_imagen: "",
          deposito: "",
        });
      } else {
        const error = await res.json();
        setMensaje({
          tipo: "error",
          texto: error.error || "Error al cargar el producto",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setMensaje({
        tipo: "error",
        texto: "Error de conexión con el servidor",
      });
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Cargar Nuevo Producto
      </Typography>

      {mensaje.texto && (
        <Alert severity={mensaje.tipo} sx={{ mb: 3 }}>
          {mensaje.texto}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Información Básica */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Información Básica
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Nombre *"
                    name="nombre"
                    fullWidth
                    required
                    value={form.nombre}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Código Fabricante *"
                    name="codigo_fabricante"
                    fullWidth
                    required
                    value={form.codigo_fabricante}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Marca *"
                    name="marca"
                    fullWidth
                    required
                    value={form.marca}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Stock"
                    name="stock"
                    type="number"
                    fullWidth
                    value={form.stock}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Detalle"
                    name="detalle"
                    multiline
                    rows={4}
                    fullWidth
                    value={form.detalle}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Categorización */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Categorización
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Categoría</InputLabel>
                    <Select
                      name="categoria"
                      value={form.categoria}
                      onChange={handleChange}
                      label="Categoría"
                    >
                      <MenuItem value="">Ninguna</MenuItem>
                      <MenuItem value="Computadoras">Computadoras</MenuItem>
                      <MenuItem value="Hardware">Hardware</MenuItem>
                      <MenuItem value="Coolers">Coolers</MenuItem>
                      <MenuItem value="Periféricos">Periféricos</MenuItem>
                      <MenuItem value="Almacenamiento">Almacenamiento</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Sub Categoría"
                    name="sub_categoria"
                    fullWidth
                    value={form.sub_categoria}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Proveedor</InputLabel>
                    <Select
                      name="proveedor"
                      value={form.proveedor}
                      onChange={handleChange}
                      label="Proveedor"
                    >
                      <MenuItem value="">Ninguno</MenuItem>
                      <MenuItem value="air">Air</MenuItem>
                      <MenuItem value="elit">Elit</MenuItem>
                      <MenuItem value="modex">Modex</MenuItem>
                      <MenuItem value="otros">Otros</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Especificaciones Técnicas */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Especificaciones Técnicas
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <TextField
                    label="Ancho (cm)"
                    name="ancho"
                    type="number"
                    fullWidth
                    inputProps={{ step: "0.01" }}
                    value={form.ancho}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    label="Alto (cm)"
                    name="alto"
                    type="number"
                    fullWidth
                    inputProps={{ step: "0.01" }}
                    value={form.alto}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    label="Largo (cm)"
                    name="largo"
                    type="number"
                    fullWidth
                    inputProps={{ step: "0.01" }}
                    value={form.largo}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    label="Peso (kg)"
                    name="peso"
                    type="number"
                    fullWidth
                    inputProps={{ step: "0.01" }}
                    value={form.peso}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Garantía (meses)"
                    name="garantia_meses"
                    type="number"
                    fullWidth
                    value={form.garantia_meses}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Depósito"
                    name="deposito"
                    fullWidth
                    value={form.deposito}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Precios */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Precios
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Precio Dólar"
                    name="precio_dolar"
                    type="number"
                    fullWidth
                    inputProps={{ step: "0.01" }}
                    value={form.precio_dolar}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Precio Dólar c/IVA"
                    name="precio_dolar_iva"
                    type="number"
                    fullWidth
                    inputProps={{ step: "0.01" }}
                    value={form.precio_dolar_iva}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="IVA (%)"
                    name="iva"
                    type="number"
                    fullWidth
                    inputProps={{ step: "0.01" }}
                    value={form.iva}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Precio Pesos"
                    name="precio_pesos"
                    type="number"
                    fullWidth
                    inputProps={{ step: "0.01" }}
                    value={form.precio_pesos}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Precio Pesos c/IVA"
                    name="precio_pesos_iva"
                    type="number"
                    fullWidth
                    inputProps={{ step: "0.01" }}
                    value={form.precio_pesos_iva}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Imagen */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Imagen del Producto
              </Typography>
              <TextField
                label="URL de la Imagen"
                name="url_imagen"
                fullWidth
                placeholder="https://ejemplo.com/imagen.jpg"
                value={form.url_imagen}
                onChange={handleChange}
                helperText="Ingresa la URL de la imagen del producto"
              />
              {form.url_imagen && (
                <Box sx={{ mt: 2, textAlign: "center" }}>
                  <img
                    src={form.url_imagen}
                    alt="Preview"
                    style={{
                      maxWidth: "200px",
                      maxHeight: "200px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Botón de envío */}
          <Grid item xs={12}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ py: 1.5 }}
            >
              Cargar Producto
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default NuevoProducto;
