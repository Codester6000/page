import { Box } from "@mui/material";
import icono_cpu from "/iconos/armadorIconos/cpu.png";
import icono_gpu from "/iconos/armadorIconos/gpu.png";
import icono_psu from "/iconos/armadorIconos/psu.png";
import icono_ram from "/iconos/armadorIconos/ram.png";
import icono_hdd from "/iconos/armadorIconos/hdd.png";
import icono_mother from "/iconos/armadorIconos/motherboard.png";
import icono_gabinete from "/iconos/armadorIconos/gabinete.png";
import icono_cooler from "/iconos/armadorIconos/cooler.png";
import icono_monitor from "/iconos/armadorIconos/monitor.png";
export function CategoriasSelector({ setTipo }) {
  const categorias = [
    ["procesadores", icono_cpu],
    ["motherboards", icono_mother],
    ["gpus", icono_gpu],
    ["memorias", icono_ram],
    ["almacenamiento", icono_hdd],
    ["fuentes", icono_psu],
    ["gabinetes", icono_gabinete],
    ["coolers", icono_cooler],
    ["monitores", icono_monitor],
  ];

  return (
    <Box className="tipo" display="flex" flexDirection="column" gap={2} p={2}>
      {categorias.map(([tipo, icono]) => (
        <Box
          key={tipo}
          sx={{
            cursor: "pointer",
            p: 1,
            "&:hover": { backgroundColor: "#e4e3e3", borderRadius: "10px" },
          }}
          onClick={() => setTipo(tipo)}
        >
          <img src={icono} alt={tipo} width={40} />
        </Box>
      ))}
    </Box>
  );
}
