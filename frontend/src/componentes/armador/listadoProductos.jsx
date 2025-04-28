import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
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
        <Grid lg={3.9} key={producto.id_producto}>
          <Card
            orientation="horizontal"
            sx={{ width: "95%", bgcolor: "#ffff", height: 190 }}
          >
            <Paper ratio="1" sx={{ width: "45%" }}>
              <img
                src={producto.url_imagenes[producto.url_imagenes.length - 1]}
                alt={producto.nombre}
                loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div className="badge">
                {producto.nombre_proveedor === "air" ? (
                  <img src="/badges/24HS.png" alt="" />
                ) : producto.nombre_proveedor === "elit" ? (
                  <img src="/badges/5_DIAS.png" alt="" />
                ) : (
                  <img src="/badges/LOCAL.png" alt="" />
                )}
              </div>
            </Paper>
            <CardContent
              orientation="horizontal"
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <div>
                <Typography
                  sx={{
                    display: "-webkit-box",
                    overflow: "hidden",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2,
                    textOverflow: "ellipsis",
                    fontWeight: "bold",
                  }}
                >
                  {producto.nombre}
                </Typography>
                <Typography>{producto.descripcion}</Typography>
                <Typography sx={{ fontWeight: "xl", mt: 0.8 }}>
                  {Number(producto.precio_pesos_iva_ajustado).toLocaleString(
                    "es-ar",
                    {
                      style: "currency",
                      currency: "ARS",
                      maximumFractionDigits: 0,
                    }
                  )}
                </Typography>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginLeft: "auto",
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={() => handleSeleccionar(producto.id_producto)}
                    sx={{
                      ml: 2,
                      my: 1.5,
                      backgroundColor: "#FF852A",
                      height: 40,
                      borderRadius: "20px",
                      fontSize: "0.75rem",
                    }}
                  >
                    Seleccionar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
