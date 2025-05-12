import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  IconButton,
  Box,
  Grid,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";

export function ProductosSeleccionados({
  elecciones,
  buscarPorId,
  eliminarID,
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

  return (
    <Accordion sx={{ mb: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography fontWeight="bold">
          Componentes seleccionados ({productosSeleccionados.length})
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={1}>
          {productosSeleccionados.map((producto) => (
            <Grid item xs={12} key={producto.id_producto}>
              <Box
                display="flex"
                alignItems="center"
                gap={2}
                p={1}
                border="1px solid #eee"
                borderRadius={2}
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
                    {Number(producto.precio_pesos_iva_ajustado).toLocaleString(
                      "es-AR",
                      {
                        style: "currency",
                        currency: "ARS",
                        maximumFractionDigits: 0,
                      }
                    )}
                  </Typography>
                  {producto.consumo && (
                    <Typography variant="body2" color="text.secondary">
                      Consumo: {producto.consumo} W
                    </Typography>
                  )}
                </Box>
                <IconButton
                  onClick={() => eliminarID(producto.id_producto)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
              <Divider sx={{ mt: 1, mb: 1 }} />
            </Grid>
          ))}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
