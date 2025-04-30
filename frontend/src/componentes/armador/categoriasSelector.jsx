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

// Mapeo de nombres visuales a claves del estado
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

// Íconos por categoría
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

export function CategoriasSelector({
  setTipo,
  selectedParts = {},
  buscarPorId,
}) {
  const categorias = Object.keys(categoryMap);

  return (
    <Box className="tipo" display="flex" flexDirection="column" gap={2} p={2}>
      {categorias.map((categoria) => {
        const clave = categoryMap[categoria];
        const seleccionado = selectedParts[clave];

        // Buscar el producto si hay uno seleccionado
        const producto =
          Array.isArray(seleccionado) && seleccionado.length > 0
            ? buscarPorId(seleccionado[0])
            : buscarPorId(seleccionado);

        // Imagen a mostrar: si hay producto con imagen, usarla; si no, usar ícono
        const imagen = producto?.url_imagenes?.length
          ? producto.url_imagenes[producto.url_imagenes.length - 1]
          : iconos[categoria];

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
              src={imagen}
              alt={producto?.nombre || categoria}
              style={{
                width: 40,
                height: 40,
                objectFit: "contain",
                borderRadius: producto ? "5px" : "0px",
              }}
            />

            {producto?.nombre && (
              <Typography
                variant="caption"
                sx={{
                  mt: 1,
                  textAlign: "center",
                  fontSize: "0.6rem",
                  lineHeight: 1.2,
                }}
              >
                {producto.nombre.length > 20
                  ? producto.nombre.slice(0, 20) + "..."
                  : producto.nombre}
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
