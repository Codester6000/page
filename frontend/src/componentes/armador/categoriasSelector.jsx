import { Box, Typography, Tooltip, Badge } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";

// Íconos por defecto
import icono_cpu from "/iconos/armadorIconos/cpu.png";
import icono_gpu from "/iconos/armadorIconos/gpu.png";
import icono_psu from "/iconos/armadorIconos/psu.png";
import icono_ram from "/iconos/armadorIconos/ram.png";
import icono_hdd from "/iconos/armadorIconos/hdd.png";
import icono_mother from "/iconos/armadorIconos/motherboard.png";
import icono_gabinete from "/iconos/armadorIconos/gabinete.png";
import icono_cooler from "/iconos/armadorIconos/cooler.png";
import icono_monitor from "/iconos/armadorIconos/monitor.png";

const categoryMap = {
  procesadores: "cpu",
  motherboards: "motherboard",
  gpus: "gpu",
  memorias: "ram",
  almacenamiento: "storage",
  fuentes: "psu", // Cambiado para coincidir con tu Redux
  gabinetes: "case",
  coolers: "cooler",
  monitores: "monitor",
};

const iconos = {
  procesadores: icono_cpu,
  motherboards: icono_mother,
  gpus: icono_gpu,
  memorias: icono_ram,
  almacenamiento: icono_hdd,
  fuentes: icono_psu,
  gabinetes: icono_gabinete,
  coolers: icono_cooler,
  monitores: icono_monitor,
};

const descripciones = {
  procesadores: "Es el cerebro de la PC, ejecuta instrucciones y programas.",
  motherboards: "Placa base que conecta y alimenta todos los componentes.",
  gpus: "Procesador gráfico, esencial para juegos y diseño.",
  memorias: "Memoria RAM, guarda datos temporales de programas en uso.",
  almacenamiento: "Guarda tus archivos, sistema operativo y programas.",
  fuentes: "Provee energía a todos los componentes de la PC.",
  gabinetes: "Caja que aloja y protege los componentes internos.",
  coolers: "Mantiene la temperatura de la PC bajo control.",
  monitores: "Dispositivo de salida visual para ver lo que haces.",
};

export function CategoriasSelector({
  setTipo,
  selectedParts,
  buscarPorId,
  compatibilidad,
  validacionErrors,
}) {
  const categorias = Object.keys(categoryMap);

  // Función para determinar el estado de compatibilidad de una categoría
  const getCompatibilidadStatus = (categoria) => {
    const clave = categoryMap[categoria];
    const seleccionado = selectedParts?.[clave];

    if (!seleccionado) return "empty";

    // Verificar si hay errores específicos para esta categoría
    const hasError = validacionErrors.some((error) => {
      const errorLower = error.toLowerCase();
      if (categoria === "procesadores" && errorLower.includes("procesador"))
        return true;
      if (categoria === "motherboards" && errorLower.includes("motherboard"))
        return true;
      if (categoria === "memorias" && errorLower.includes("memoria"))
        return true;
      if (categoria === "fuentes" && errorLower.includes("fuente")) return true;
      return false;
    });

    if (hasError) return "error";

    // Si hay selección y no hay errores, es compatible
    return "success";
  };

  // Función para obtener información adicional de compatibilidad
  const getCompatibilidadInfo = (categoria, producto) => {
    if (!producto) return null;

    const nombre = producto.nombre?.toLowerCase() || "";
    let info = [];

    // Para procesadores, mostrar socket
    if (categoria === "procesadores") {
      const sockets = ["am4", "am5", "1200", "1700", "1151", "1851"];
      const socket = sockets.find((s) => nombre.includes(s));
      if (socket) info.push(socket.toUpperCase());
    }

    // Para motherboards, mostrar socket y RAM
    if (categoria === "motherboards") {
      const sockets = ["am4", "am5", "1200", "1700", "1151", "1851"];
      const rams = ["ddr3", "ddr4", "ddr5"];

      const socket = sockets.find((s) => nombre.includes(s));
      const ram = rams.find((r) => nombre.includes(r));

      if (socket) info.push(socket.toUpperCase());
      if (ram) info.push(ram.toUpperCase());
    }

    // Para memorias, mostrar tipo
    if (categoria === "memorias") {
      const rams = ["ddr3", "ddr4", "ddr5"];
      const ram = rams.find((r) => nombre.includes(r));
      if (ram) info.push(ram.toUpperCase());
    }

    // Para fuentes, mostrar wattage si disponible
    if (categoria === "fuentes" && producto.consumo) {
      info.push(`${producto.consumo}W`);
    }

    return info.length > 0 ? info.join(" | ") : null;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return <CheckCircleIcon sx={{ color: "green", fontSize: 16 }} />;
      case "error":
        return <ErrorIcon sx={{ color: "red", fontSize: 16 }} />;
      case "warning":
        return <WarningIcon sx={{ color: "orange", fontSize: 16 }} />;
      default:
        return null;
    }
  };

  const getTooltipContent = (categoria, status, producto) => {
    let baseDescription = descripciones[categoria];

    if (status === "error") {
      const relatedErrors = validacionErrors.filter((error) => {
        const errorLower = error.toLowerCase();
        if (categoria === "procesadores" && errorLower.includes("procesador"))
          return true;
        if (categoria === "motherboards" && errorLower.includes("motherboard"))
          return true;
        if (categoria === "memorias" && errorLower.includes("memoria"))
          return true;
        if (categoria === "fuentes" && errorLower.includes("fuente"))
          return true;
        return false;
      });

      if (relatedErrors.length > 0) {
        baseDescription += "\n\n⚠️ Problemas:\n" + relatedErrors.join("\n");
      }
    }

    if (compatibilidad && status === "success") {
      baseDescription += "\n\n✅ Compatible con la configuración actual";
    }

    return baseDescription;
  };

  return (
    <Box className="tipo" display="flex" flexDirection="column" gap={2} p={2}>
      {categorias.map((categoria) => {
        const clave = categoryMap[categoria];
        const seleccionado = selectedParts?.[clave];
        const status = getCompatibilidadStatus(categoria);

        let producto = null;
        let cantidad = 0;

        if (Array.isArray(seleccionado) && seleccionado.length > 0) {
          producto = buscarPorId(seleccionado[0]);
          cantidad = seleccionado.length;
        } else if (seleccionado) {
          producto = buscarPorId(seleccionado);
        }

        const compatibilidadInfo = getCompatibilidadInfo(categoria, producto);

        return (
          <Tooltip
            key={categoria}
            title={getTooltipContent(categoria, status, producto)}
            placement="right"
            arrow
          >
            <Badge
              badgeContent={getStatusIcon(status)}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <Box
                sx={{
                  cursor: "pointer",
                  p: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  border:
                    status === "error"
                      ? "2px solid red"
                      : status === "success"
                      ? "2px solid green"
                      : "2px solid transparent",
                  borderRadius: "10px",
                  backgroundColor:
                    status === "error"
                      ? "rgba(255, 0, 0, 0.1)"
                      : status === "success"
                      ? "rgba(0, 255, 0, 0.1)"
                      : "transparent",
                  "&:hover": {
                    backgroundColor:
                      status === "error"
                        ? "rgba(255, 0, 0, 0.2)"
                        : status === "success"
                        ? "rgba(0, 255, 0, 0.2)"
                        : "#e4e3e3",
                  },
                  transition: "all 0.2s ease-in-out",
                }}
                onClick={() => setTipo(categoria)}
              >
                <img
                  src={
                    producto?.url_imagenes?.[
                      producto.url_imagenes.length - 1
                    ] ?? iconos[categoria]
                  }
                  alt={producto?.nombre || categoria}
                  style={{
                    width: 40,
                    height: 40,
                    objectFit: "contain",
                    borderRadius: producto ? "5px" : "0px",
                  }}
                />

                <Typography
                  variant="caption"
                  sx={{
                    mt: 1,
                    textAlign: "center",
                    fontSize: "0.6rem",
                    lineHeight: 1.2,
                    color: producto ? "inherit" : "gray",
                    fontWeight: status === "error" ? "bold" : "normal",
                  }}
                >
                  {producto?.nombre
                    ? producto.nombre.slice(0, 20) +
                      (producto.nombre.length > 20 ? "..." : "")
                    : categoria}
                </Typography>

                {/* Información de compatibilidad */}
                {compatibilidadInfo && (
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "0.55rem",
                      fontWeight: "bold",
                      color:
                        status === "error"
                          ? "red"
                          : status === "success"
                          ? "green"
                          : "#1976d2",
                      textAlign: "center",
                      mt: 0.5,
                    }}
                  >
                    {compatibilidadInfo}
                  </Typography>
                )}

                {/* Contador para arrays - CORREGIDO */}
                {["ram", "storage"].includes(clave) && (
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "0.6rem",
                      fontWeight: "bold",
                      color: cantidad > 0 ? "primary.main" : "gray",
                    }}
                  >
                    {cantidad > 0 ? `x${cantidad}` : "x0"}
                  </Typography>
                )}

                {/* Indicador de restricciones activas */}
                {!producto && compatibilidad && (
                  <Box
                    sx={{
                      mt: 0.5,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    {categoria === "procesadores" &&
                      compatibilidad.socket_requerido && (
                        <Typography
                          variant="caption"
                          sx={{ fontSize: "0.5rem", color: "#666" }}
                        >
                          Req: {compatibilidad.socket_requerido}
                        </Typography>
                      )}
                    {categoria === "motherboards" &&
                      compatibilidad.socket_requerido && (
                        <Typography
                          variant="caption"
                          sx={{ fontSize: "0.5rem", color: "#666" }}
                        >
                          Req: {compatibilidad.socket_requerido}
                        </Typography>
                      )}
                    {categoria === "memorias" &&
                      compatibilidad.ram_requerida && (
                        <Typography
                          variant="caption"
                          sx={{ fontSize: "0.5rem", color: "#666" }}
                        >
                          Req: {compatibilidad.ram_requerida}
                        </Typography>
                      )}
                    {categoria === "fuentes" &&
                      compatibilidad.fuente_minima > 0 && (
                        <Typography
                          variant="caption"
                          sx={{ fontSize: "0.5rem", color: "#666" }}
                        >
                          Min: {compatibilidad.fuente_minima}W
                        </Typography>
                      )}
                  </Box>
                )}
              </Box>
            </Badge>
          </Tooltip>
        );
      })}
    </Box>
  );
}
