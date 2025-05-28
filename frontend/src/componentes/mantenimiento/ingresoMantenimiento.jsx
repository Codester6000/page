// src/pages/Mantenimiento.jsx
import { Box, Button, Container, TextField, Typography, Paper } from "@mui/material";

export default function Mantenimiento() {
  return (
    <Container
      maxWidth="sm"
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
          textAlign: "center",
          width: "100%",
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Mantenimiento
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Para verificar el estado de su equipo ingrese el numero de ficha
        </Typography>

        <Box
          component="form"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            alignItems: "center",
          }}
        >
          <TextField
            label="N. Ficha"
            variant="outlined"
            fullWidth
            size="small"
          />
          <TextField
            label="Nombre del titular"
            variant="outlined"
            fullWidth
            size="small"
          />
          <Button
            variant="contained"
            size="small"
            sx={{ mt: 2, width: 100 }}
          >
            BUSCAR
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
