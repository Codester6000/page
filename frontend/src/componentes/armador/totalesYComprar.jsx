import { Box, Typography, Button } from "@mui/material";

export function TotalesYComprar({ total, watts, handleAgregarCarrito }) {
  return (
    <Box mt={3}>
      <Typography variant="h6">
        Total:{" "}
        <span style={{ marginLeft: 10, color: "green" }}>
          {total.toLocaleString("es-ar", {
            style: "currency",
            currency: "ARS",
            maximumFractionDigits: 0,
          })}
        </span>
      </Typography>
      <Typography variant="body1" color="text.secondary" mt={1}>
        Consumo: {watts} W
      </Typography>

      <Button
        variant="contained"
        onClick={handleAgregarCarrito}
        sx={{
          mt: 2,
          backgroundColor: "#FF7D20",
          borderRadius: "20px",
          fontSize: "0.875rem",
        }}
      >
        Comprar
      </Button>
    </Box>
  );
}
