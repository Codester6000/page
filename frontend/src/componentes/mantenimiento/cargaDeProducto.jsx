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
import { generarFichaMantenimiento } from "../../../utils/pdfHelper";

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
    estado: "pendiente",
  });

  const [detalles, setDetalles] = useState({});
  const [usuarios, setUsuarios] = useState([]);
  const [empleados, setEmpleados] = useState([]);

  const tipos = {
    PC: [
      "placa_madre",
      "procesador",
      "ram",
      "disco",
      "gpu",
      "fuente",
      "gabinete",
    ],
    Notebook: [
      "marca",
      "modelo",
      "pantalla",
      "teclado",
      "bateria",
      "disco",
      "ram",
    ],
    Celular: [
      "marca",
      "modelo",
      "pantalla",
      "bateria",
      "camara",
      "botones",
      "carga",
    ],
    Otro: ["detalle"],
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchUsuarios = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_URL_BACK}/api/usuarios`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setUsuarios(data);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      }
    };

    const fetchEmpleados = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_URL_BACK}/api/empleados`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setEmpleados(data);
      } catch (error) {
        console.error("Error al obtener empleados:", error);
      }
    };

    fetchUsuarios();
    fetchEmpleados();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Limpiar detalles si se cambia el tipo de producto
    if (name === "nombre_producto") {
      setDetalles({});
    }
  };

  const handleDetallesChange = (e) => {
    const { name, value } = e.target;
    setDetalles((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const payload = {
      ...form,
      username: form.username?.trim() ? form.username.trim() : null,
      empleado_asignado: form.empleado_asignado ? form.empleado_asignado : null,
      detalles,
    };

    try {
      const res = await fetch(
        `${import.meta.env.VITE_URL_BACK}/api/mantenimientos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        alert("❌ Error: " + (errorData.error || "Error inesperado"));
        return;
      }

      const data = await res.json();

      if (data.numero_ficha) {
        generarFichaMantenimiento({
          numero: data.numero_ficha,
          fecha: new Date().toLocaleDateString("es-AR"),
          clienteDNI: form.dni_propietario,
          clienteNombre:
            usuarios.find((u) => u.username === form.username)?.nombre ||
            form.username ||
            "Sin nombre",
          responsable:
            empleados.find((e) => e.id_empleado === form.empleado_asignado)
              ?.nombre || "Sin asignar",
          telefono: form.telefono,
          direccion: form.direccion_propietario,
          mail: form.mail,
          producto: form.nombre_producto,
          estado: form.estado,
          fecha_inicio: new Date(form.fecha_inicio).toLocaleDateString("es-AR"),
          descripcion: Object.entries(detalles)
            .map(
              ([key, val]) =>
                `${key
                  .replace(/_/g, " ")
                  .replace(/^\w/, (l) => l.toUpperCase())}: ${val}`
            )
            .join("\n"),
          observaciones: form.observaciones || "Sin observaciones",
        });

        alert(`✅ Ficha generada con éxito. Nº: ${data.numero_ficha}`);
      } else {
        alert("⚠️ Mantenimiento guardado, pero sin número de ficha.");
      }
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
          <Grid item xs={12} sm={6}>
            <Autocomplete
              freeSolo
              options={usuarios.map((u) => u.username)}
              value={form.username || ""}
              onChange={(event, newValue) => {
                setForm((prev) => ({ ...prev, username: newValue || "" }));
              }}
              onInputChange={(event, newInputValue) => {
                setForm((prev) => ({ ...prev, username: newInputValue || "" }));
              }}
              renderInput={(params) => (
                <TextField {...params} label="Usuario (opcional)" fullWidth />
              )}
            />
          </Grid>

          {[
            ["DNI Propietario", "dni_propietario", "number"],
            ["Responsable de Retiro", "responsable_de_retiro"],
            ["Teléfono", "telefono"],
            ["Dirección", "direccion_propietario"],
            ["Email", "mail"],
            ["Descripción (Falla)", "descripcion_producto", "text", true],
            ["Observaciones", "observaciones"],
          ].map(([label, name]) => (
            <Grid item xs={12} sm={6} key={name}>
              <TextField
                label={label}
                name={name}
                value={form[name] || ""}
                onChange={handleFormChange}
                fullWidth
                multiline={name === "descripcion_producto"}
                rows={name === "descripcion_producto" ? 2 : 1}
                required
              />
            </Grid>
          ))}

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Empleado Asignado</InputLabel>
              <Select
                name="empleado_asignado"
                value={form.empleado_asignado}
                onChange={handleFormChange}
                label="Empleado Asignado"
              >
                {empleados.map((emp) => (
                  <MenuItem key={emp.id_empleado} value={emp.id_empleado}>
                    {emp.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

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

          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Tipo de Producto</InputLabel>
              <Select
                name="nombre_producto"
                value={form.nombre_producto}
                onChange={handleFormChange}
                label="Tipo de Producto"
              >
                {Object.keys(tipos).map((tipo) => (
                  <MenuItem key={tipo} value={tipo}>
                    {tipo}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" mt={2}>
              Detalles del producto ({form.nombre_producto})
            </Typography>
          </Grid>

          {tipos[form.nombre_producto].map((campo) => (
            <Grid item xs={12} sm={6} key={campo}>
              <TextField
                name={campo}
                label={campo
                  .replaceAll("_", " ")
                  .replace(/^\w/, (l) => l.toUpperCase())}
                value={detalles[campo] || ""}
                onChange={handleDetallesChange}
                fullWidth
                required
              />
            </Grid>
          ))}

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
