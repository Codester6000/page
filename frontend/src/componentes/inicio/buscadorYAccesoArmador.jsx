import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import BuildIcon from "@mui/icons-material/Build";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function BuscadorYAccesoArmador() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const [busqueda, setBusqueda] = useState("");

  const handleBuscar = () => {
    if (busqueda.trim() !== "") {
      navigate(`/productos?nombre=${encodeURIComponent(busqueda)}`);
    }
  };

  const irAlArmador = () => {
    navigate("/armador");
  };

  return (
    <Box
      sx={{
        px: { xs: 2, md: 6 },
        py: 4,
        backgroundColor: "#f5f5f5",
        borderRadius: 2,
        mb: 4,
      }}
    >
      <Typography
        variant="h5"
        fontWeight="bold"
        mb={3}
        textAlign="center"
        color="text.primary"
      >
        ¿Qué estás buscando hoy?
      </Typography>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            variant="outlined"
            label="Buscar productos"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            InputProps={{
              sx: { borderRadius: 2, backgroundColor: "white" },
            }}
          />
        </Grid>
        <Grid item xs={12} md="auto">
          <Button
            variant="contained"
            onClick={handleBuscar}
            startIcon={<SearchIcon />}
            sx={{
              height: "100%",
              background: "linear-gradient(to right, #ff8a00, #ff6a00)",
              borderRadius: 2,
              px: 3,
              color: "#fff",
            }}
          >
            Buscar
          </Button>
        </Grid>
        <Grid item xs={12} md="auto">
          <Button
            variant="outlined"
            onClick={irAlArmador}
            startIcon={<BuildIcon />}
            sx={{
              height: "100%",
              borderRadius: 2,
              px: 3,
              borderColor: "#FF7D20",
              color: "#FF7D20",
              "&:hover": {
                backgroundColor: "#ffe3cf",
              },
            }}
          >
            Armar mi PC
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
