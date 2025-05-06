import React from "react";
import { useAuth } from "../../Auth"; // Asegurate de que la ruta sea correcta
import { Box, Paper, Typography } from "@mui/material";

const Perfil = () => {
  const { sesion } = useAuth();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: { xs: "90%", sm: "600px" },
          padding: 4,
          borderRadius: 3,
          textAlign: "center",
        }}
      >
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Bienvenido a tu perfil {sesion?.username?.toUpperCase()}
        </Typography>

        {/* Podés agregar más datos aquí si querés */}
        {/* <Typography variant="body1">Correo: {sesion?.email}</Typography> */}
      </Paper>
    </Box>
  );
};

export default Perfil;
