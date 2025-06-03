import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
} from "@mui/material";

export function ListadoProductos({ productos, tipo, handleSeleccionar }) {
  const categoriaRaiz = productos?.productos || {};
  const tipoKey = (tipo || Object.keys(categoriaRaiz)?.[0] || "").toLowerCase();
  const productosFiltrados = categoriaRaiz?.[tipoKey];

  if (!Array.isArray(productosFiltrados) || productosFiltrados.length === 0) {
    return (
      <Typography variant="body1" align="center" sx={{ mt: 3 }}>
        No hay productos disponibles para esta categoría.
      </Typography>
    );
  }

  return (
    <Grid
      container
      spacing={2}
      style={{ marginTop: "10px", justifyContent: "center" }}
    >
      {productosFiltrados.map((producto) => (
        <Grid item lg={4} md={6} xs={12} key={producto.id_producto}>
          <Card
            sx={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              height: 190,
              bgcolor: "#ffffff",
              overflow: "hidden",
            }}
          >
            <Box sx={{ width: "100%", position: "relative" }}>
              <img
                src={producto.url_imagenes?.[producto.url_imagenes.length - 1]}
                alt={producto.nombre}
                loading="lazy"
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "contain",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  width: 30,
                  height: 30,
                }}
              >
                <img
                  src={
                    producto.nombre_proveedor === "air"
                      ? "/badges/24HS.png"
                      : producto.nombre_proveedor === "elit"
                      ? "/badges/5_DIAS.png"
                      : "/badges/LOCAL.png"
                  }
                  alt={producto.nombre_proveedor}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </Box>
            </Box>

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
                  title={producto.nombre}
                  sx={{
                    display: "-webkit-box",
                    overflow: "hidden",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2,
                    fontWeight: "bold",
                    mb: 1,
                    cursor: "default",
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
                    "es-AR",
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
