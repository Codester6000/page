import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Autocomplete,
  TextField, 
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Collapse,
  Grid,
  Chip,
  Tooltip
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp, CheckCircle } from "@mui/icons-material";
import { useAuth } from "../../Auth";

const TablaMantenimientos = () => {
  const { sesion } = useAuth();
  const [mantenimientos, setMantenimientos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [abierto, setAbierto] = useState({});

  useEffect(() => {
    fetchMantenimientos();
    fetchEmpleados();
  }, []);

  const fetchMantenimientos = async () => {
    try {
      const res = await fetch("/api/mantenimientos/todos", {
        headers: {
          Authorization: `Bearer ${sesion?.token}`,
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMantenimientos(data);
    } catch (err) {
      console.error("Error obteniendo mantenimientos:", err);
      setError("No se pudieron obtener los mantenimientos.");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmpleados = async () => {
    try {
      const res = await fetch("/api/empleados", {
        headers: {
          Authorization: `Bearer ${sesion?.token}`,
        },
      });
      if (!res.ok) throw new Error("No autorizado");
      const data = await res.json();
      setEmpleados(data);
    } catch (err) {
      console.error("Error obteniendo empleados:", err);
    }
  };

  const toggleFila = (id) => {
    setAbierto((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const obtenerTituloEstado = (mantenimiento) => {
    const detalles = typeof mantenimiento.detalles === "string"
      ? JSON.parse(mantenimiento.detalles || "[]")
      : mantenimiento.detalles;

    if (!Array.isArray(detalles) || detalles.length === 0) {
      return { titulo: "—", finalizado: false };
    }

    const todosCompletados = detalles.every((p) => p.completado);
    const index = parseInt(mantenimiento.estado);
    const titulo = todosCompletados
      ? "Finalizado"
      : detalles[index]?.titulo || "—";

    return { titulo, finalizado: todosCompletados };
  };

  const mantenimientosFiltrados = empleadoSeleccionado
    ? mantenimientos.filter(
        (m) =>
          String(m.empleado_nombre).toLowerCase() ===
          String(empleadoSeleccionado.nombre).toLowerCase()
      )
    : mantenimientos;

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Tabla de Mantenimientos
      </Typography>

      <Autocomplete
        options={empleados}
        getOptionLabel={(option) => option.nombre || "Sin nombre"}
        onChange={(e, value) => setEmpleadoSeleccionado(value)}
        renderInput={(params) => (
          <TextField {...params} label="Filtrar por empleado" variant="outlined" />
        )}
        sx={{ mb: 3, width: 300 }}
        isOptionEqualToValue={(option, value) => option.nombre === value.nombre}
      />

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : mantenimientosFiltrados.length === 0 ? (
        <Alert severity="info">No hay mantenimientos para mostrar.</Alert>
      ) : (
        <Paper sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell># Ficha</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Producto</TableCell>
                <TableCell align="center">Estado</TableCell>
                <TableCell>Empleado asignado</TableCell>
                <TableCell>Fecha de ingreso</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mantenimientosFiltrados.map((m, index) => {
                const estado = obtenerTituloEstado(m);
                return (
                  <React.Fragment key={m.id_mantenimiento || index}>
                    <TableRow>
                      <TableCell>
                        <IconButton onClick={() => toggleFila(m.id_mantenimiento)}>
                          {abierto[m.id_mantenimiento] ? (
                            <KeyboardArrowUp />
                          ) : (
                            <KeyboardArrowDown />
                          )}
                        </IconButton>
                      </TableCell>
                      <TableCell>{m.numero_ficha || "—"}</TableCell>
                      <TableCell>{m.dni_propietario || "—"}</TableCell>
                      <TableCell>{m.nombre_producto || "—"}</TableCell>
                      <TableCell align="center">
                        {parseInt(m.estado) === 1 ? (
                          <Tooltip title="Finalizado">
                            <CheckCircle style={{ color: 'green' }} />
                          </Tooltip>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>{m.empleado_nombre || "—"}</TableCell>
                      <TableCell>
                        {m.fecha_ingreso
                          ? new Date(m.fecha_ingreso).toLocaleDateString()
                          : "—"}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell colSpan={7} sx={{ p: 0, border: 0 }}>
                        <Collapse in={abierto[m.id_mantenimiento]} timeout="auto" unmountOnExit>
                          <Box p={2} bgcolor="#f9f9f9">
                            <Typography variant="subtitle1" fontWeight="bold">
                              Detalles del mantenimiento
                            </Typography>
                            <Grid container spacing={1} mt={1}>
                              <Grid item xs={12} sm={6}>
                                <strong>Descripción:</strong> {m.descripcion_producto || "—"}
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <strong>Observaciones:</strong> {m.observaciones || "—"}
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <strong>Responsable de retiro:</strong> {m.responsable_de_retiro || "—"}
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <strong>Dirección:</strong> {m.direccion_propietario || "—"}
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <strong>Mail:</strong> {m.mail || "—"}
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <strong>Teléfono:</strong> {m.telefono || "—"}
                              </Grid>
                            </Grid>

                            <Box mt={2}>
                              <Typography variant="subtitle2">Seguimiento:</Typography>
                              <Grid container spacing={2} mt={1}>
                                {(Array.isArray(m.detalles)
                                  ? m.detalles
                                  : JSON.parse(m.detalles || "[]")
                                ).map((paso, i) => (
                                  <Grid item xs={12} sm={6} md={4} key={i}>
                                    <Paper variant="outlined" sx={{ p: 2 }}>
                                      <Typography fontWeight="bold">
                                        {paso.icono ? `${paso.icono} - ` : ""}
                                        {paso.titulo}
                                      </Typography>
                                      <Typography variant="body2" sx={{ mb: 1 }}>
                                        {paso.comentario || "Sin comentario"}
                                      </Typography>
                                      {paso.foto && (
                                        <img
                                          src={paso.foto}
                                          alt="foto paso"
                                          style={{
                                            maxWidth: "100%",
                                            borderRadius: 8,
                                            border: "1px solid #ccc",
                                          }}
                                        />
                                      )}
                                    </Paper>
                                  </Grid>
                                ))}
                              </Grid>
                            </Box>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
};

export default TablaMantenimientos;