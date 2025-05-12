import React, { useState } from "react";
import {
  TextField,
  Select,
  MenuItem,
  Button,
  Typography,
  Box,
  Input,
  Avatar,
  Stack,
  Grid,
  Paper,
} from "@mui/material";

const NuevoProducto = () => {
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({
    marca: "",
    categoria: "",
    nombre: "",
    stock: "",
    detalle: "",
    garantia: "",
    ancho: "",
    alto: "",
    largo: "",
    peso: "",
    codigoFabricante: "",
    proveedor: "",
    precio_dolar: "",
    precio_dolar_iva: "",
    iva: "",
    precio_pesos: "",
    precio_pesos_iva: "",
  });

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    setImagen(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubirImagen = async () => {
    if (!imagen) return alert("Primero selecciona una imagen");

    const formData = new FormData();
    formData.append("imagen", imagen);

    try {
      const res = await fetch("https://tu-backend.com/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      console.log("Imagen subida:", data);
      alert("Imagen subida correctamente");
    } catch (error) {
      console.error("Error al subir imagen:", error);
      alert("Error al subir imagen");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Cargar Producto
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Marca"
            name="marca"
            fullWidth
            value={form.marca}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Select
            fullWidth
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
            displayEmpty
          >
            <MenuItem value="" disabled>
              Seleccione categoría
            </MenuItem>
            <MenuItem value="Computadoras">Computadoras</MenuItem>
            <MenuItem value="Hardware">Hardware</MenuItem>
            <MenuItem value="Coolers">Coolers</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Nombre"
            name="nombre"
            fullWidth
            value={form.nombre}
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
        <Grid item xs={12} sm={6}>
          <Select
            fullWidth
            name="proveedor"
            value={form.proveedor}
            onChange={handleChange}
            displayEmpty
          >
            <MenuItem value="" disabled>
              Seleccione proveedor
            </MenuItem>
            <MenuItem value="air">Air</MenuItem>
            <MenuItem value="elit">Elit</MenuItem>
            <MenuItem value="modex">Modex</MenuItem>
            <MenuItem value="otros">Otros</MenuItem>
          </Select>
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Detalle"
            name="detalle"
            multiline
            rows={3}
            fullWidth
            value={form.detalle}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Garantía (meses)"
            name="garantia"
            type="number"
            fullWidth
            value={form.garantia}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Código Fabricante"
            name="codigoFabricante"
            type="text"
            fullWidth
            value={form.codigoFabricante}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={3}>
          <TextField
            label="Ancho (cm)"
            name="ancho"
            type="number"
            fullWidth
            value={form.ancho}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={3}>
          <TextField
            label="Alto (cm)"
            name="alto"
            type="number"
            fullWidth
            value={form.alto}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={3}>
          <TextField
            label="Largo (cm)"
            name="largo"
            type="number"
            fullWidth
            value={form.largo}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={3}>
          <TextField
            label="Peso (kg)"
            name="peso"
            type="number"
            fullWidth
            value={form.peso}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            label="Precio Dólar"
            name="precio_dolar"
            type="number"
            fullWidth
            value={form.precio_dolar}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            label="Precio Dólar c/IVA"
            name="precio_dolar_iva"
            type="number"
            fullWidth
            value={form.precio_dolar_iva}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            label="IVA (%)"
            name="iva"
            type="number"
            fullWidth
            value={form.iva}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Precio Pesos"
            name="precio_pesos"
            type="number"
            fullWidth
            value={form.precio_pesos}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Precio Pesos c/IVA"
            name="precio_pesos_iva"
            type="number"
            fullWidth
            value={form.precio_pesos_iva}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Imagen del Producto
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                variant="rounded"
                src={preview}
                alt="Preview"
                sx={{ width: 80, height: 80, border: "1px solid #ccc" }}
              />
              <Input
                type="file"
                onChange={handleImagenChange}
                inputProps={{ accept: "image/*" }}
              />
              <Button variant="contained" onClick={handleSubirImagen}>
                Subir Imagen
              </Button>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Button fullWidth variant="contained" color="primary" size="large">
            Cargar Producto
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NuevoProducto;
