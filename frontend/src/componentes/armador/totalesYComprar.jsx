import { Box, Typography, Button } from "@mui/material";

export default function TotalesYComprar({
  total = 0,
  watts = 0,
  handleAgregarCarrito = () => {},
}) {
  return (
    <Box mt={3} px={2}>
      <Typography variant="h6" gutterBottom>
        Total:{" "}
        <span style={{ marginLeft: 10, color: "green" }}>
          {Number(total).toLocaleString("es-AR", {
            style: "currency",
            currency: "ARS",
            maximumFractionDigits: 0,
          })}
        </span>
      </Typography>

      <Typography variant="body2" color="text.secondary">
        Consumo estimado: {watts} W
      </Typography>

      <Button
        variant="contained"
        fullWidth
        onClick={handleAgregarCarrito}
        sx={{
          mt: 2,
          backgroundColor: "#FF7D20",
          borderRadius: "20px",
          fontSize: "0.875rem",
          textTransform: "none",
        }}
      >
        Comprar
      </Button>
    </Box>
  );
}
