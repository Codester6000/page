import {
  Box,
  Button,
  Container,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { useState } from "react";

const empleados = [
  { id: 1, nombre: "Lucas Falcon" },
  { id: 2, nombre: "Ricardo Ezequiel Romero" },
  { id: 3, nombre: "Daniel Villacorta" },
  { id: 4, nombre: "Martin Yona" },
];

export default function CargarProducto() {
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState("");

  const handleChangeEmpleado = (e) => {
    setEmpleadoSeleccionado(e.target.value);
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={10}
        sx={{
          padding: 4,
          borderRadius: 3,
          width: "100%",
        }}
      >
        <Typography variant="h6" align="center" fontWeight="bold" gutterBottom>
          CARGAR PRODUCTO PARA MANTENIMIENTO
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 4 }}>
          PARA REGISTRAR EL INGRESO DE UN PRODUCTO PARA MANTENIMIENTO RELLENE
          EL SIGUIENTE FORMULARIO
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField label="Nombre del producto" fullWidth variant="standard" />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField label="Responsable de busqueda" fullWidth variant="standard" />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField label="Teléfono" fullWidth variant="standard" />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField label="Direccion del propietario" fullWidth variant="standard" />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField label="Mail" fullWidth variant="standard" />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="standard">
              <InputLabel id="label-empleado">Empleado asignado</InputLabel>
              <Select
                labelId="label-empleado"
                value={empleadoSeleccionado}
                onChange={handleChangeEmpleado}
              >
                {empleados.map((emp) => (
                  <MenuItem key={emp.id} value={emp.nombre}>
                    {emp.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Descripción del producto ingresado"
              fullWidth
              multiline
              rows={2}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Observaciones del trabajo a realizar / falla que presenta"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
            />
          </Grid>
        </Grid>

        <Box mt={4} textAlign="center">
          <Button variant="contained" size="large">
            GUARDAR
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
