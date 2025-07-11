import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Paper,
} from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SearchIcon from "@mui/icons-material/Search";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import { useAuth } from "../../Auth";

const pasos = [
  "Su computadora está en espera a revisión.",
  "Su computadora se encuentra en revisión.",
  "En proceso de ensamble.",
  "Listo para retirar.",
];

const iconos = {
  1: <HourglassEmptyIcon />,
  2: <SearchIcon />,
  3: <BuildIcon />,
  4: <CheckCircleIcon />,
};

function CustomStepIcon(props) {
  const { active, completed, icon } = props;
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 24,
        height: 24,
        borderRadius: "50%",
        bgcolor: completed ? "green" : active ? "orange" : "grey.400",
        color: "#fff",
      }}
    >
      {iconos[icon]}
    </Box>
  );
}

export default function ConsultaEstado() {
  const [dni, setDni] = useState("");
  const [ficha, setFicha] = useState("");
  const [resultado, setResultado] = useState(null);
  const [comentario, setComentario] = useState("");
  const { sesion } = useAuth();

  const buscar = async () => {
    const res = await fetch(
      `http://localhost:3000/api/mantenimientos/consulta?dni=${dni}&ficha=${ficha}`
    );
    const data = await res.json();
    if (res.ok) {
      setResultado(data);
      setComentario(data.observaciones || "");
    } else {
      alert(data.error);
    }
  };

  const estadoActual = () => {
    switch (resultado?.estado) {
      case "En espera":
        return 0;
      case "En revisión":
        return 1;
      case "En ensamble":
        return 2;
      case "Listo":
        return 3;
      default:
        return 0;
    }
  };

  const actualizarEstado = async (nuevoEstado) => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/mantenimientos/actualizar-estado/${resultado.id_mantenimiento}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sesion?.token}`,
          },
          body: JSON.stringify({
            estado: nuevoEstado,
            observaciones: comentario,
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        alert("Estado actualizado");
        buscar();
      } else {
        alert(data.error || "Error al actualizar");
      }
    } catch (error) {
      alert("Error al actualizar estado");
    }
  };

  const avanzar = () => {
    const actual = estadoActual();
    if (actual < pasos.length - 1) {
      const siguiente = ["En espera", "En revisión", "En ensamble", "Listo"][actual + 1];
      actualizarEstado(siguiente);
    }
  };

  const retroceder = () => {
    const actual = estadoActual();
    if (actual > 0) {
      const anterior = ["En espera", "En revisión", "En ensamble", "Listo"][actual - 1];
      actualizarEstado(anterior);
    }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 6 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Consultar Estado de Mantenimiento
      </Typography>
      <Box component={Paper} elevation={3} sx={{ p: 3, borderRadius: 2, bgcolor: "#fafafa" }}>
        <TextField
          fullWidth
          label="DNI"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Número de Ficha"
          value={ficha}
          onChange={(e) => setFicha(e.target.value)}
          margin="normal"
        />
        <Button fullWidth variant="contained" onClick={buscar} sx={{ mt: 2 }}>
          Buscar
        </Button>
      </Box>

      {resultado && (
        <Paper elevation={3} sx={{ mt: 4, p: 4, borderRadius: 3 }}>
          <Typography variant="h6" align="center" fontWeight="bold" gutterBottom>
            FICHA NUMERO Nº {resultado.numero_ficha}
          </Typography>

          <Typography variant="body1" align="center" gutterBottom sx={{ mb: 3 }}>
            Estado de mantenimiento 🔧
          </Typography>

          <Stepper activeStep={estadoActual()} orientation="vertical" connector={null}>
            {pasos.map((label) => (
              <Step key={label}>
                <StepLabel StepIconComponent={CustomStepIcon}>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {sesion?.rol === 2 && (
            <Box sx={{ mt: 4 }}>
              <TextField
                label="Comentario del técnico"
                fullWidth
                multiline
                rows={3}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
              />
              <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
                <Button variant="outlined" color="warning" onClick={retroceder}>
                  Retroceder
                </Button>
                <Button variant="contained" color="success" onClick={avanzar}>
                  Avanzar
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
}
