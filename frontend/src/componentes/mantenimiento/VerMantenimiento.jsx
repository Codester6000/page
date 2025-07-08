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

  const buscar = async () => {
    const res = await fetch(
      `http://localhost:3000/api/mantenimientos/consulta?dni=${dni}&ficha=${ficha}`
    );
    const data = await res.json();
    if (res.ok) setResultado(data);
    else alert(data.error);
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

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 6 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Consultar Estado de Mantenimiento
      </Typography>
      <Box
        component={Paper}
        elevation={3}
        sx={{ p: 3, borderRadius: 2, bgcolor: "#fafafa" }}
      >
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
          <Typography
            variant="h6"
            align="center"
            fontWeight="bold"
            gutterBottom
          >
            FICHA NUMERO N° {resultado.numero_ficha}
          </Typography>

          <Typography
            variant="body1"
            align="center"
            gutterBottom
            sx={{ mb: 3 }}
          >
            Estado de mantenimiento 🔧
          </Typography>

          <Stepper
            activeStep={estadoActual()}
            orientation="vertical"
            connector={null}
          >
            {pasos.map((label, index) => (
              <Step key={label}>
                <StepLabel StepIconComponent={CustomStepIcon}>
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>
      )}
    </Box>
  );
}
