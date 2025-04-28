import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
} from "@mui/material";

export function ListadoProductos({ productos, tipo, handleSeleccionar }) {
  if (!productos?.productos?.[tipo]) return null;

  return (
    <Grid
      container
      spacing={2}
      style={{ marginTop: "10px", justifyContent: "center" }}
    >
      {productos.productos[tipo].map((producto) => (
        <Grid item lg={4} md={6} xs={12} key={producto.id_producto}>
          <Card
            sx={{
              display: "flex",
              flexDirection: "row", // Para que imagen y texto estén uno al lado del otro
              width: "100%",
              height: 190,
              bgcolor: "#dfd6d6",
              overflow: "hidden",
            }}
          >
            {/* Imagen */}
            <Box sx={{ width: "40%", position: "relative" }}>
              <img
                src={producto.url_imagenes?.[producto.url_imagenes.length - 1]}
                alt={producto.nombre}
                loading="lazy"
                style={{
                  width: "100%",
                  height: "auto", // Mantiene la proporción de la imagen
                  objectFit: "contain", // Asegura que la imagen no se distorsione
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  width: 40,
                  height: 40,
                }}
              >
                {producto.nombre_proveedor === "air" ? (
                  <img src="/badges/24HS.png" alt="" />
                ) : producto.nombre_proveedor === "elit" ? (
                  <img src="/badges/5_DIAS.png" alt="" />
                ) : (
                  <img src="/badges/LOCAL.png" alt="" />
                )}
              </Box>
            </Box>

            {/* Contenido */}
            <CardContent
              sx={{
                flex: "1 1 auto",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                p: 2,
              }}
            >
              <div>
                <Typography
                  sx={{
                    display: "-webkit-box",
                    overflow: "hidden",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2,
                    fontWeight: "bold",
                    mb: 1,
                  }}
                >
                  {producto.nombre}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  {producto.descripcion}
                </Typography>

                <Typography sx={{ fontWeight: "bold", color: "green" }}>
                  {Number(producto.precio_pesos_iva_ajustado).toLocaleString(
                    "es-ar",
                    {
                      style: "currency",
                      currency: "ARS",
                      maximumFractionDigits: 0,
                    }
                  )}
                </Typography>
              </div>

              <Button
                variant="contained"
                onClick={() => handleSeleccionar(producto.id_producto)}
                sx={{
                  backgroundColor: "#FF852A",
                  height: 36,
                  borderRadius: "20px",
                  fontSize: "0.75rem",
                  alignSelf: "flex-end",
                  mt: 1,
                }}
              >
                Seleccionar
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
