import { Box, Typography } from "@mui/material";

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
  fuentes: "psu",
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

export function CategoriasSelector({ setTipo, selectedParts, buscarPorId }) {
  const categorias = Object.keys(categoryMap);

  return (
    <Box className="tipo" display="flex" flexDirection="column" gap={2} p={2}>
      {categorias.map((categoria) => {
        const clave = categoryMap[categoria];
        const seleccionado = selectedParts?.[clave];

        // Detectar si hay selección válida
        let producto = null;
        let cantidad = 0;

        if (Array.isArray(seleccionado) && seleccionado.length > 0) {
          producto = buscarPorId(seleccionado[0]);
          cantidad = seleccionado.length;
        } else if (seleccionado) {
          producto = buscarPorId(seleccionado);
        }

        const nombre = producto?.nombre?.toLowerCase();
        const isAM4 = nombre?.includes("am4");
        const isAM5 = nombre?.includes("am5");

        return (
          <Box
            key={categoria}
            sx={{
              cursor: "pointer",
              p: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              "&:hover": {
                backgroundColor: "#e4e3e3",
                borderRadius: "10px",
              },
            }}
            onClick={() => setTipo(categoria)}
          >
            <img
              src={
                producto?.url_imagenes?.[producto.url_imagenes.length - 1] ??
                iconos[categoria]
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
              }}
            >
              {producto?.nombre
                ? producto.nombre.slice(0, 20) +
                  (producto.nombre.length > 20 ? "..." : "")
                : categoria}
            </Typography>

            {clave === "cpu" && producto && (
              <Typography
                variant="caption"
                sx={{
                  fontSize: "0.6rem",
                  fontWeight: "bold",
                  color: isAM4 ? "#1976d2" : isAM5 ? "#9c27b0" : "gray",
                }}
              >
                {isAM4 ? "AM4" : isAM5 ? "AM5" : "¿?"}
              </Typography>
            )}

            {["ram", "storage"].includes(clave) &&
              Array.isArray(seleccionado) && (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.6rem",
                    fontWeight: "bold",
                    color: "gray",
                  }}
                >
                  x{cantidad}
                </Typography>
              )}
          </Box>
        );
      })}
    </Box>
  );
}
