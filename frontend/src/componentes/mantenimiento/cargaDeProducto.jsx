import { useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  InputLabel,
  FormControl,
} from "@mui/material";

export default function FormularioMantenimiento() {
  const [form, setForm] = useState({
    username: "",
    dni_propietario: "",
    nombre_producto: "Notebook",
    responsable_de_retiro: "",
    telefono: "",
    direccion_propietario: "",
    mail: "",
    empleado_asignado: "",
    descripcion_producto: "",
    observaciones: "",
    fecha_inicio: "",
    estado: "",
  });

  const [detalles, setDetalles] = useState({});
  const [usuarios, setUsuarios] = useState([]);

  const tipos = {
    PC: ["placa_madre", "procesador", "ram", "disco", "gpu", "fuente", "gabinete"],
    Notebook: ["marca", "modelo", "pantalla", "teclado", "bateria", "disco", "ram"],
    Celular: ["marca", "modelo", "pantalla", "bateria", "camara", "botones", "carga"],
    Otro: ["detalle"],
  };

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_URL_BACK}/api/usuarios/usuarios`);
        const data = await res.json();
        setUsuarios(data);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      }
    };

    fetchUsuarios();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDetallesChange = (e) => {
    const { name, value } = e.target;
    setDetalles((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      ...(form.username.trim() === "" && { username: null }),
      detalles,
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_URL_BACK}/api/mantenimientos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert("❌ Error: " + (data.error || "Error inesperado"));
        return;
      }

      alert(`✅ Ficha generada con éxito. Nº: ${data.numero_ficha}`);
    } catch (error) {
      console.error("❌ Error al enviar el formulario:", error);
      alert("Error al conectar con el servidor.");
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, mt: 4, maxWidth: 1000, mx: "auto" }}>
      <Typography variant="h5" mb={3}>
        Ficha de Mantenimiento
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Usuario (opcional) */}
          <Grid item xs={12} sm={6}>
            <Autocomplete
              freeSolo
              options={usuarios.map((u) => u.username)}
              value={form.username}
              onInputChange={(event, newValue) =>
                setForm((prev) => ({ ...prev, username: newValue }))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Usuario (opcional)"
                  fullWidth
                />
              )}
            />
          </Grid>

          {/* Campos generales */}
          {[
            ["DNI Propietario", "dni_propietario"],
            ["Responsable de Retiro", "responsable_de_retiro"],
            ["Teléfono", "telefono"],
            ["Dirección", "direccion_propietario"],
            ["Email", "mail"],
            ["Empleado Asignado", "empleado_asignado"],
            ["Descripción", "descripcion_producto"],
            ["Observaciones", "observaciones"],
          ].map(([label, name]) => (
            <Grid item xs={12} sm={6} key={name}>
              <TextField
                label={label}
                name={name}
                value={form[name]}
                onChange={handleFormChange}
                fullWidth
                required
              />
            </Grid>
          ))}

          {/* Fecha */}
          <Grid item xs={12} sm={6}>
            <TextField
              type="date"
              name="fecha_inicio"
              label="Fecha de Inicio"
              InputLabelProps={{ shrink: true }}
              value={form.fecha_inicio}
              onChange={handleFormChange}
              fullWidth
              required
            />
          </Grid>

          {/* Estado */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Estado</InputLabel>
              <Select
                name="estado"
                value={form.estado}
                onChange={handleFormChange}
                label="Estado"
              >
                <MenuItem value="pendiente">Pendiente</MenuItem>
                <MenuItem value="en_proceso">En proceso</MenuItem>
                <MenuItem value="finalizado">Finalizado</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Tipo de producto */}
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Tipo de Producto</InputLabel>
              <Select
                name="nombre_producto"
                value={form.nombre_producto}
                onChange={handleFormChange}
                label="Tipo de Producto"
              >
                <MenuItem value="PC">PC</MenuItem>
                <MenuItem value="Notebook">Notebook</MenuItem>
                <MenuItem value="Celular">Celular</MenuItem>
                <MenuItem value="Otro">Otro</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Detalles técnicos */}
          <Grid item xs={12}>
            <Typography variant="h6" mt={2}>
              Detalles del producto ({form.nombre_producto})
            </Typography>
          </Grid>

          {tipos[form.nombre_producto].map((campo) => (
            <Grid item xs={12} sm={6} key={campo}>
              <TextField
                name={campo}
                label={campo.replaceAll("_", " ").replace(/^\w/, (l) => l.toUpperCase())}
                value={detalles[campo] || ""}
                onChange={handleDetallesChange}
                fullWidth
                required
              />
            </Grid>
          ))}

          {/* Botón de envío */}
          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end">
              <Button type="submit" variant="contained" color="primary">
                Enviar
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
}
