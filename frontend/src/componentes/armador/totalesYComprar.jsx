import { Box, Typography, Button, Alert, Chip, Divider } from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

export default function TotalesYComprar({
  total = 0,
  watts = 0,
  handleAgregarCarrito = () => {},
  compatibilidad = null,
  validacionErrors = [],
}) {
  const hasErrors = validacionErrors.length > 0;
  const hasSocketErrors = validacionErrors.some(
    (error) =>
      error.toLowerCase().includes("socket") ||
      error.toLowerCase().includes("compatible")
  );

  const getPowerRecommendation = () => {
    if (!compatibilidad || !compatibilidad.fuente_minima) return null;

    const fuenteMinima = compatibilidad.fuente_minima;
    const consumoTotal = compatibilidad.consumo_total || watts;

    if (fuenteMinima > consumoTotal * 2) {
      return {
        type: "high",
        message: `Fuente recomendada: ${fuenteMinima}W (Reserva alta)`,
        color: "success",
      };
    } else if (fuenteMinima > consumoTotal * 1.5) {
      return {
        type: "medium",
        message: `Fuente recomendada: ${fuenteMinima}W (Reserva adecuada)`,
        color: "info",
      };
    } else {
      return {
        type: "low",
        message: `Fuente mínima: ${fuenteMinima}W (Reserva mínima)`,
        color: "warning",
      };
    }
  };

  const powerRecommendation = getPowerRecommendation();

  const getButtonState = () => {
    if (total === 0) {
      return {
        disabled: true,
        text: "Selecciona componentes",
        color: "primary",
      };
    }

    if (hasSocketErrors) {
      return {
        disabled: true,
        text: "Incompatibilidad crítica",
        color: "error",
      };
    }

    if (hasErrors) {
      return {
        disabled: false,
        text: "Comprar (con advertencias)",
        color: "warning",
      };
    }

    return {
      disabled: false,
      text: "Comprar",
      color: "primary",
    };
  };

  const buttonState = getButtonState();

  return (
    <Box mt={3} px={2}>
      {/* Título con estado de compatibilidad */}
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <Typography variant="h6">Resumen</Typography>
        {hasErrors ? (
          <ErrorIcon sx={{ color: "red", fontSize: 20 }} />
        ) : total > 0 ? (
          <CheckCircleIcon sx={{ color: "green", fontSize: 20 }} />
        ) : null}
      </Box>

      {/* Total */}
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

      {/* Información de consumo */}
      <Box mb={2}>
        <Typography variant="body2" color="text.secondary">
          Consumo estimado: {watts} W
        </Typography>

        {powerRecommendation && (
          <Chip
            label={powerRecommendation.message}
            color={powerRecommendation.color}
            size="small"
            sx={{ mt: 1, fontSize: "0.7rem" }}
            icon={
              powerRecommendation.type === "high" ? (
                <CheckCircleIcon />
              ) : powerRecommendation.type === "low" ? (
                <WarningIcon />
              ) : null
            }
          />
        )}
      </Box>

      {/* Información de compatibilidad */}
      {compatibilidad &&
        (compatibilidad.socket_requerido || compatibilidad.ram_requerida) && (
          <Box mb={2}>
            <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
              Compatibilidad:
            </Typography>

            {compatibilidad.socket_requerido && (
              <Chip
                label={`Socket: ${compatibilidad.socket_requerido}`}
                size="small"
                sx={{ mr: 0.5, mb: 0.5, fontSize: "0.7rem" }}
                color="primary"
              />
            )}

            {compatibilidad.ram_requerida && (
              <Chip
                label={`RAM: ${compatibilidad.ram_requerida}`}
                size="small"
                sx={{ mr: 0.5, mb: 0.5, fontSize: "0.7rem" }}
                color="secondary"
              />
            )}
          </Box>
        )}

      <Divider sx={{ my: 2 }} />

      {/* Alertas de validación */}
      {hasErrors && (
        <Alert
          severity={hasSocketErrors ? "error" : "warning"}
          sx={{ mb: 2, fontSize: "0.8rem" }}
        >
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            {hasSocketErrors ? "Componentes incompatibles:" : "Advertencias:"}
          </Typography>
          <ul style={{ margin: "4px 0", paddingLeft: "16px" }}>
            {validacionErrors.slice(0, 2).map((error, index) => (
              <li key={index} style={{ fontSize: "0.75rem" }}>
                {error}
              </li>
            ))}
            {validacionErrors.length > 2 && (
              <li style={{ fontSize: "0.75rem", fontStyle: "italic" }}>
                Y {validacionErrors.length - 2} más...
              </li>
            )}
          </ul>
        </Alert>
      )}

      {/* Estado positivo */}
      {!hasErrors && total > 0 && (
        <Alert severity="success" sx={{ mb: 2, fontSize: "0.8rem" }}>
          <Typography variant="body2">✅ Configuración compatible</Typography>
        </Alert>
      )}

      {/* Botón de compra */}
      <Button
        variant="contained"
        fullWidth
        onClick={handleAgregarCarrito}
        disabled={buttonState.disabled}
        color={buttonState.color}
        sx={{
          mt: 1,
          backgroundColor:
            buttonState.color === "primary" ? "#FF7D20" : undefined,
          borderRadius: "20px",
          fontSize: "0.875rem",
          textTransform: "none",
          position: "relative",
          "&:hover": {
            backgroundColor:
              buttonState.color === "primary" ? "#E66A0D" : undefined,
          },
        }}
      >
        {buttonState.text}
        {hasErrors && !hasSocketErrors && (
          <WarningIcon sx={{ ml: 1, fontSize: 16 }} />
        )}
      </Button>

      {/* Texto explicativo para estado deshabilitado */}
      {buttonState.disabled && hasSocketErrors && (
        <Typography
          variant="caption"
          color="error"
          sx={{
            display: "block",
            textAlign: "center",
            mt: 1,
            fontSize: "0.7rem",
          }}
        >
          Corrige las incompatibilidades antes de continuar
        </Typography>
      )}

      {/* Información adicional */}
      {total > 0 && !hasSocketErrors && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            textAlign: "center",
            mt: 1,
            fontSize: "0.7rem",
          }}
        >
          Los productos se agregarán al carrito
        </Typography>
      )}
    </Box>
  );
}
