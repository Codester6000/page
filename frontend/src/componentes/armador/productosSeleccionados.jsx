import { Box, Grid, Paper, Typography, IconButton } from "@mui/material";
import { Delete } from "@mui/icons-material";

export function ProductosSeleccionados({
  elecciones,
  buscarPorId,
  eliminarID,
}) {
  return (
    <Grid container spacing={2}>
      {Object.entries(elecciones).map(([categoria, valor]) => {
        if (valor === 0 || valor === null) return null;

        if (Array.isArray(valor)) {
          return valor.map((productoId, index) => {
            const producto = buscarPorId(productoId);
            if (!producto) return null;

            return (
              <Grid item xs={12} key={`${productoId}-${index}`}>
                <Paper elevation={3} sx={{ p: 2, position: "relative" }}>
                  <Typography fontWeight="bold">{producto.nombre}</Typography>
                  <Typography color="text.secondary">
                    {Number(producto.precio_pesos_iva_ajustado).toLocaleString(
                      "es-ar",
                      {
                        style: "currency",
                        currency: "ARS",
                        maximumFractionDigits: 0,
                      }
                    )}
                  </Typography>
                  <IconButton
                    onClick={() => eliminarID(producto.id_producto)}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      backgroundColor: "#a111ad",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#e0e0e0",
                        color: "black",
                      },
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Paper>
              </Grid>
            );
          });
        } else {
          const producto = buscarPorId(valor);
          if (!producto) return null;

          return (
            <Grid item xs={12} key={producto.id_producto}>
              <Paper elevation={3} sx={{ p: 2, position: "relative" }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <img
                    src={
                      producto.url_imagenes?.[producto.url_imagenes.length - 1]
                    }
                    alt={producto.nombre}
                    width={60}
                    height={60}
                    style={{ objectFit: "contain" }}
                  />
                  <Box>
                    <Typography fontWeight="bold">{producto.nombre}</Typography>
                    <Typography color="text.secondary">
                      {Number(
                        producto.precio_pesos_iva_ajustado
                      ).toLocaleString("es-ar", {
                        style: "currency",
                        currency: "ARS",
                        maximumFractionDigits: 0,
                      })}
                    </Typography>
                  </Box>
                </Box>
                <IconButton
                  onClick={() => eliminarID(producto.id_producto)}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    backgroundColor: "#a111ad",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#e0e0e0",
                      color: "black",
                    },
                  }}
                >
                  <Delete />
                </IconButton>
              </Paper>
            </Grid>
          );
        }
      })}
    </Grid>
  );
}
