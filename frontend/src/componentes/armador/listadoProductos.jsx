import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Tooltip,
  Pagination,
  Stack,
} from "@mui/material";
import { useState, useMemo } from "react";
import BoltIcon from "@mui/icons-material/Bolt";
import SpeedIcon from "@mui/icons-material/Speed";
import MemoryIcon from "@mui/icons-material/Memory";

const ITEMS_PER_PAGE = 9; // 3x3 grid

export function ListadoProductos({
  productos,
  tipo,
  handleSeleccionar,
  compatibilidad,
  selectedParts,
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const categoriaRaiz = productos?.productos || {};
  const tipoKey = (tipo || Object.keys(categoriaRaiz)?.[0] || "").toLowerCase();
  const productosFiltrados = categoriaRaiz?.[tipoKey] || [];

  // Calcular paginación
  const totalPages = Math.ceil(productosFiltrados.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = productosFiltrados.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Función para extraer información relevante del producto
  const getProductInfo = (producto, tipo) => {
    const nombre = producto.nombre?.toLowerCase() || "";
    const info = [];

    switch (tipo) {
      case "procesadores":
        // Socket
        const sockets = ["am4", "am5", "1200", "1700", "1151", "1851"];
        const socket = sockets.find((s) => nombre.includes(s));
        if (socket)
          info.push({
            label: socket.toUpperCase(),
            icon: <SpeedIcon />,
            color: "primary",
          });

        // Consumo
        if (producto.consumo)
          info.push({
            label: `${producto.consumo}W`,
            icon: <BoltIcon />,
            color: "warning",
          });
        break;

      case "motherboards":
        // Socket
        const mbSockets = ["am4", "am5", "1200", "1700", "1151", "1851"];
        const mbSocket = mbSockets.find((s) => nombre.includes(s));
        if (mbSocket)
          info.push({
            label: mbSocket.toUpperCase(),
            icon: <SpeedIcon />,
            color: "primary",
          });

        // RAM
        const rams = ["ddr3", "ddr4", "ddr5"];
        const ram = rams.find((r) => nombre.includes(r));
        if (ram)
          info.push({
            label: ram.toUpperCase(),
            icon: <MemoryIcon />,
            color: "secondary",
          });
        break;

      case "memorias":
        // Tipo RAM
        const memRams = ["ddr3", "ddr4", "ddr5"];
        const memRam = memRams.find((r) => nombre.includes(r));
        if (memRam)
          info.push({
            label: memRam.toUpperCase(),
            icon: <MemoryIcon />,
            color: "secondary",
          });
        break;

      case "gpus":
        if (producto.consumo)
          info.push({
            label: `${producto.consumo}W`,
            icon: <BoltIcon />,
            color: "warning",
          });
        break;

      case "fuentes":
        if (producto.consumo) {
          const isRecommended =
            !compatibilidad?.fuente_minima ||
            producto.consumo >= compatibilidad.fuente_minima;
          info.push({
            label: `${producto.consumo}W`,
            icon: <BoltIcon />,
            color: isRecommended ? "success" : "error",
          });
        }
        break;
    }

    return info;
  };

  // Manejar cambio de página
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reset página cuando cambia el tipo
  useMemo(() => {
    setCurrentPage(1);
  }, [tipo]);

  if (!Array.isArray(productosFiltrados) || productosFiltrados.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No hay productos disponibles para esta categoría
        </Typography>
        {compatibilidad?.fuente_minima && tipo === "fuentes" && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Fuente mínima requerida: {compatibilidad.fuente_minima}W
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box>
      {/* Header con información de la categoría */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" sx={{ textTransform: "capitalize" }}>
          {tipo} ({productosFiltrados.length} productos)
        </Typography>

        {/* Información de restricciones activas */}
        {compatibilidad && (
          <Box sx={{ display: "flex", gap: 1 }}>
            {tipo === "procesadores" && compatibilidad.socket_requerido && (
              <Chip
                label={`Req: ${compatibilidad.socket_requerido}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {tipo === "motherboards" && (
              <>
                {compatibilidad.socket_requerido && (
                  <Chip
                    label={`Socket: ${compatibilidad.socket_requerido}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
                {compatibilidad.ram_requerida && (
                  <Chip
                    label={`RAM: ${compatibilidad.ram_requerida}`}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                )}
              </>
            )}
            {tipo === "memorias" && compatibilidad.ram_requerida && (
              <Chip
                label={`Tipo: ${compatibilidad.ram_requerida}`}
                size="small"
                color="secondary"
                variant="outlined"
              />
            )}
            {tipo === "fuentes" && compatibilidad.fuente_minima > 0 && (
              <Chip
                label={`Min: ${compatibilidad.fuente_minima}W`}
                size="small"
                color="warning"
                variant="outlined"
              />
            )}
          </Box>
        )}
      </Box>

      {/* Grid de productos */}
      <Grid container spacing={2}>
        {currentProducts.map((producto) => {
          const productInfo = getProductInfo(producto, tipo);
          const isCompatible =
            !compatibilidad?.fuente_minima ||
            tipo !== "fuentes" ||
            producto.consumo >= compatibilidad.fuente_minima;

          return (
            <Grid item xs={12} sm={6} lg={4} key={producto.id_producto}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  border: !isCompatible
                    ? "2px solid #f44336"
                    : "1px solid #e0e0e0",
                  "&:hover": {
                    boxShadow: 3,
                    transform: "translateY(-2px)",
                    transition: "all 0.2s ease-in-out",
                  },
                  opacity: !isCompatible ? 0.7 : 1,
                }}
              >
                {/* Badge del proveedor */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    zIndex: 2,
                    width: 35,
                    height: 35,
                  }}
                >
                  <Tooltip title={`Proveedor: ${producto.nombre_proveedor}`}>
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
                        filter: !isCompatible ? "grayscale(50%)" : "none",
                      }}
                    />
                  </Tooltip>
                </Box>

                {/* Imagen del producto */}
                <Box
                  sx={{
                    height: 180,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 2,
                    bgcolor: "grey.50",
                  }}
                >
                  <img
                    src={
                      producto.url_imagenes?.[producto.url_imagenes.length - 1]
                    }
                    alt={producto.nombre}
                    loading="lazy"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                      filter: !isCompatible ? "grayscale(30%)" : "none",
                    }}
                  />
                </Box>

                <CardContent
                  sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
                >
                  {/* Nombre del producto */}
                  <Tooltip title={producto.nombre} placement="top">
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: "0.95rem",
                        fontWeight: "bold",
                        mb: 1,
                        display: "-webkit-box",
                        overflow: "hidden",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2,
                        minHeight: "2.4em",
                        lineHeight: 1.2,
                        color: !isCompatible ? "text.disabled" : "text.primary",
                      }}
                    >
                      {producto.nombre}
                    </Typography>
                  </Tooltip>

                  {/* Chips de información técnica */}
                  {productInfo.length > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.5,
                        mb: 2,
                      }}
                    >
                      {productInfo.map((info, index) => (
                        <Chip
                          key={index}
                          label={info.label}
                          size="small"
                          color={info.color}
                          icon={info.icon}
                          variant="outlined"
                          sx={{ fontSize: "0.7rem", height: 24 }}
                        />
                      ))}
                    </Box>
                  )}

                  {/* Información de stock */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Stock: {producto.stock} unidades
                  </Typography>

                  {/* Precio */}
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      color: "success.main",
                      mb: 2,
                      fontSize: "1.1rem",
                    }}
                  >
                    {Number(producto.precio_pesos_iva_ajustado).toLocaleString(
                      "es-AR",
                      {
                        style: "currency",
                        currency: "ARS",
                        maximumFractionDigits: 0,
                      }
                    )}
                  </Typography>

                  {/* Botón de selección */}
                  <Button
                    variant="contained"
                    onClick={() => handleSeleccionar(producto.id_producto)}
                    disabled={!isCompatible}
                    sx={{
                      backgroundColor: isCompatible ? "#FF852A" : "#bdbdbd",
                      color: "white",
                      borderRadius: "25px",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                      mt: "auto",
                      py: 1,
                      "&:hover": {
                        backgroundColor: isCompatible ? "#E66A0D" : "#bdbdbd",
                      },
                      "&:disabled": {
                        color: "white",
                      },
                    }}
                  >
                    {!isCompatible ? "Incompatible" : "Seleccionar"}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Paginación */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Stack spacing={2}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
              sx={{
                "& .MuiPaginationItem-root": {
                  fontSize: "1rem",
                },
              }}
            />
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              Página {currentPage} de {totalPages}({startIndex + 1}-
              {Math.min(startIndex + ITEMS_PER_PAGE, productosFiltrados.length)}{" "}
              de {productosFiltrados.length} productos)
            </Typography>
          </Stack>
        </Box>
      )}
    </Box>
  );
}
