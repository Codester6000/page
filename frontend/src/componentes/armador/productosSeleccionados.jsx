import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  IconButton,
  Box,
  Grid,
  Divider,
  Chip,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";

export function ProductosSeleccionados({
  elecciones,
  buscarPorId,
  eliminarID,
  compatibilidad,
  validacionErrors = [],
}) {
  const productosSeleccionados = [];

  Object.entries(elecciones).forEach(([categoria, valor]) => {
    if (!valor || (Array.isArray(valor) && valor.length === 0)) return;

    const lista = Array.isArray(valor) ? valor : [valor];

    lista.forEach((id) => {
      const producto = buscarPorId(id);
      if (producto) {
        productosSeleccionados.push({ ...producto, categoria });
      }
    });
  });

  if (productosSeleccionados.length === 0) return null;

  // Función para obtener información de compatibilidad de un producto
  const getProductCompatibilityInfo = (producto) => {
    const nombre = producto.nombre?.toLowerCase() || "";
    const info = [];

    // Socket information
    const sockets = ["am4", "am5", "1200", "1700", "1151", "1851"];
    const socket = sockets.find((s) => nombre.includes(s));
    if (socket) {
      const isSocketMatch =
        !compatibilidad?.socket_requerido ||
        compatibilidad.socket_requerido.toLowerCase() === socket;
      info.push({
        label: socket.toUpperCase(),
        type: "socket",
        isCompatible: isSocketMatch,
        color: isSocketMatch ? "success" : "error",
      });
    }

    // RAM information
    const rams = ["ddr3", "ddr4", "ddr5"];
    const ram = rams.find((r) => nombre.includes(r));
    if (ram) {
      const isRamMatch =
        !compatibilidad?.ram_requerida ||
        compatibilidad.ram_requerida.toLowerCase() === ram;
      info.push({
        label: ram.toUpperCase(),
        type: "ram",
        isCompatible: isRamMatch,
        color: isRamMatch ? "success" : "error",
      });
    }

    return info;
  };

  // Función para determinar si un producto tiene errores
  const getProductErrors = (producto) => {
    return validacionErrors.filter((error) => {
      const errorLower = error.toLowerCase();
      const nombreLower = producto.nombre.toLowerCase();

      // Verificar si el error menciona este producto específicamente
      if (
        producto.categoria === "procesadores" &&
        errorLower.includes("procesador")
      )
        return true;
      if (
        producto.categoria === "motherboards" &&
        errorLower.includes("motherboard")
      )
        return true;
      if (producto.categoria === "memorias" && errorLower.includes("memoria"))
        return true;
      if (producto.categoria === "fuentes" && errorLower.includes("fuente"))
        return true;

      return false;
    });
  };

  const hasErrors = validacionErrors.length > 0;
  const componentCount = productosSeleccionados.length;

  return (
    <Accordion
      sx={{
        mb: 2,
        border: hasErrors ? "1px solid #f44336" : "1px solid #e0e0e0",
        "&:before": { display: "none" },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          backgroundColor: hasErrors
            ? "rgba(244, 67, 54, 0.04)"
            : "rgba(0, 0, 0, 0.02)",
        }}
      >
        <Box display="flex" alignItems="center" gap={1} width="100%">
          <Typography fontWeight="bold">
            Componentes seleccionados ({componentCount})
          </Typography>

          {hasErrors ? (
            <ErrorIcon sx={{ color: "error.main", fontSize: 20 }} />
          ) : componentCount > 0 ? (
            <CheckCircleIcon sx={{ color: "success.main", fontSize: 20 }} />
          ) : null}

          {/* Resumen rápido de compatibilidad */}
          {compatibilidad &&
            (compatibilidad.socket_requerido ||
              compatibilidad.ram_requerida) && (
              <Box display="flex" gap={0.5} ml="auto">
                {compatibilidad.socket_requerido && (
                  <Chip
                    label={compatibilidad.socket_requerido}
                    size="small"
                    color="primary"
                    sx={{ fontSize: "0.7rem", height: 20 }}
                  />
                )}
                {compatibilidad.ram_requerida && (
                  <Chip
                    label={compatibilidad.ram_requerida}
                    size="small"
                    color="secondary"
                    sx={{ fontSize: "0.7rem", height: 20 }}
                  />
                )}
              </Box>
            )}
        </Box>
      </AccordionSummary>

      <AccordionDetails>
        {/* Alertas de compatibilidad */}
        {hasErrors && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="bold">
              Problemas de compatibilidad detectados:
            </Typography>
            <ul style={{ margin: "4px 0", paddingLeft: "16px" }}>
              {validacionErrors.slice(0, 3).map((error, index) => (
                <li key={index} style={{ fontSize: "0.85rem" }}>
                  {error}
                </li>
              ))}
              {validacionErrors.length > 3 && (
                <li style={{ fontSize: "0.85rem", fontStyle: "italic" }}>
                  Y {validacionErrors.length - 3} problemas más...
                </li>
              )}
            </ul>
          </Alert>
        )}

        <Grid container spacing={1}>
          {productosSeleccionados.map((producto) => {
            const compatibilityInfo = getProductCompatibilityInfo(producto);
            const productErrors = getProductErrors(producto);
            const hasProductError = productErrors.length > 0;

            return (
              <Grid item xs={12} key={producto.id_producto}>
                <Box
                  display="flex"
                  alignItems="center"
                  gap={2}
                  p={1}
                  border={
                    hasProductError ? "2px solid #f44336" : "1px solid #eee"
                  }
                  borderRadius={2}
                  sx={{
                    backgroundColor: hasProductError
                      ? "rgba(244, 67, 54, 0.05)"
                      : "white",
                  }}
                >
                  <img
                    src={producto.url_imagenes?.slice(-1)[0]}
                    alt={producto.nombre}
                    width={50}
                    height={50}
                    style={{ objectFit: "contain" }}
                  />

                  <Box flex={1}>
                    <Typography fontSize="0.9rem" fontWeight="bold" noWrap>
                      {producto.nombre}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {Number(
                        producto.precio_pesos_iva_ajustado
                      ).toLocaleString("es-AR", {
                        style: "currency",
                        currency: "ARS",
                        maximumFractionDigits: 0,
                      })}
                    </Typography>

                    {producto.consumo && (
                      <Typography variant="body2" color="text.secondary">
                        Consumo: {producto.consumo} W
                      </Typography>
                    )}

                    {/* Chips de compatibilidad */}
                    {compatibilityInfo.length > 0 && (
                      <Box display="flex" gap={0.5} mt={0.5} flexWrap="wrap">
                        {compatibilityInfo.map((info, index) => (
                          <Chip
                            key={index}
                            label={info.label}
                            size="small"
                            color={info.color}
                            sx={{ fontSize: "0.7rem", height: 18 }}
                            icon={
                              info.isCompatible ? (
                                <CheckCircleIcon sx={{ fontSize: 12 }} />
                              ) : (
                                <ErrorIcon sx={{ fontSize: 12 }} />
                              )
                            }
                          />
                        ))}
                      </Box>
                    )}

                    {/* Errores específicos del producto */}
                    {productErrors.length > 0 && (
                      <Box mt={0.5}>
                        {productErrors.map((error, index) => (
                          <Typography
                            key={index}
                            variant="caption"
                            color="error"
                            display="block"
                            sx={{ fontSize: "0.75rem" }}
                          >
                            ⚠️ {error}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </Box>

                  <IconButton
                    onClick={() => eliminarID(producto.id_producto)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>

                {productosSeleccionados.indexOf(producto) <
                  productosSeleccionados.length - 1 && (
                  <Divider sx={{ mt: 1, mb: 1 }} />
                )}
              </Grid>
            );
          })}
        </Grid>

        {/* Resumen de configuración */}
        {compatibilidad && productosSeleccionados.length > 0 && (
          <Box mt={2} p={1} bgcolor="rgba(0, 0, 0, 0.02)" borderRadius={1}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              Resumen de Compatibilidad:
            </Typography>

            <Box display="flex" gap={1} flexWrap="wrap">
              {compatibilidad.socket_requerido && (
                <Chip
                  label={`Socket: ${compatibilidad.socket_requerido}`}
                  size="small"
                  color="primary"
                  sx={{ fontSize: "0.75rem" }}
                />
              )}

              {compatibilidad.ram_requerida && (
                <Chip
                  label={`RAM: ${compatibilidad.ram_requerida}`}
                  size="small"
                  color="secondary"
                  sx={{ fontSize: "0.75rem" }}
                />
              )}

              {compatibilidad.consumo_total > 0 && (
                <Chip
                  label={`Consumo: ${compatibilidad.consumo_total}W`}
                  size="small"
                  color="info"
                  sx={{ fontSize: "0.75rem" }}
                />
              )}

              {compatibilidad.fuente_minima > 0 && (
                <Chip
                  label={`Fuente mín: ${compatibilidad.fuente_minima}W`}
                  size="small"
                  color="warning"
                  sx={{ fontSize: "0.75rem" }}
                />
              )}
            </Box>
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
