import { useState, useEffect, useCallback } from "react";
import "../styleArmador.css";
import axios from "axios";
import { useAuth } from "../Auth";
import { useNavigate } from "react-router-dom";
import { Box, Button, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  setProductos,
  setTotal,
  setWatts,
  setOrder,
  selectPart,
  removePart,
  clearBuild,
} from "../redux/slices/buildSlice";
import { ListadoProductos } from "./armador/listadoProductos";
import { TotalesYComprar } from "./armador/totalesYComprar";
import { CategoriasSelector } from "./armador/categoriasSelector";
import { ProductosSeleccionados } from "./armador/productosSeleccionados";

const categoryMap = {
  procesadores: "cpu",
  motherboards: "motherboard",
  memorias: "ram",
  gpus: "gpu",
  almacenamiento: "storage",
  fuentes: "psu",
  gabinetes: "case",
  coolers: "cooler",
  monitores: "monitor",
};

const secuenciaCategorias = Object.keys(categoryMap);

function ArmadorPc({ category }) {
  const url = import.meta.env.VITE_URL_BACK;
  const { sesion } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const selectedParts = useSelector((state) => state.build.selectedParts);
  const productos = useSelector((state) => state.build.productos);
  const total = useSelector((state) => state.build.total);
  const watts = useSelector((state) => state.build.watts);
  const order = useSelector((state) => state.build.order);

  const [tipoIndex, setTipoIndex] = useState(0);
  const [marcaCPU, setMarcaCPU] = useState(null);

  const tipo = secuenciaCategorias[tipoIndex];

  const crearIndice = useCallback((productos) => {
    const indice = {};
    for (const categoria in productos) {
      const productosCategoria = productos[categoria];
      if (Array.isArray(productosCategoria)) {
        productosCategoria.forEach((producto) => {
          indice[producto.id_producto] = { ...producto, categoria };
        });
      }
    }
    return indice;
  }, []);

  const indiceProductos = productos ? crearIndice(productos) : {};

  const buscarPorId = useCallback(
    (id) => indiceProductos[id] || null,
    [indiceProductos]
  );

  const getArmador = useCallback(async () => {
    const queryParams = [];

    if (selectedParts.cpu)
      queryParams.push(`procesador_id=${selectedParts.cpu}`);
    if (selectedParts.motherboard)
      queryParams.push(`motherboard_id=${selectedParts.motherboard}`);
    if (selectedParts.ram?.length > 0)
      queryParams.push(`memoria_id=${selectedParts.ram[0]}`);
    if (order) queryParams.push(`order=${order}`);
    if (watts > 0) queryParams.push(`consumoW=${watts}`);

    const query = queryParams.length ? `?${queryParams.join("&")}` : "";

    try {
      const response = await axios.get(`${url}/armador${query}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sesion.token}`,
        },
      });

      if (response.status === 200) {
        let nuevosProductos = response.data;
        if (marcaCPU === "amd") {
          nuevosProductos.productos.procesadores =
            nuevosProductos.productos.procesadores.filter((p) =>
              p.nombre.toLowerCase().includes("amd")
            );
        } else if (marcaCPU === "intel") {
          nuevosProductos.productos.procesadores =
            nuevosProductos.productos.procesadores.filter((p) =>
              p.nombre.toLowerCase().includes("intel")
            );
        }

        const cpu = buscarPorId(selectedParts.cpu);
        if (cpu && nuevosProductos?.productos?.motherboards) {
          nuevosProductos.productos.motherboards =
            nuevosProductos.productos.motherboards.filter((mb) => {
              const isAMD = cpu.nombre.toLowerCase().includes("amd");
              return isAMD
                ? mb.socket.includes("AM4") || mb.socket.includes("AM5")
                : mb.socket.toLowerCase().startsWith("lga");
            });
        }

        dispatch(setProductos(nuevosProductos));
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  }, [
    url,
    selectedParts,
    order,
    watts,
    sesion.token,
    dispatch,
    buscarPorId,
    marcaCPU,
  ]);

  const calcularTotales = useCallback(() => {
    let nuevoTotal = 0;
    let nuevoWatts = 0;

    Object.entries(selectedParts).forEach(([category, valor]) => {
      if (valor) {
        const ids = Array.isArray(valor) ? valor : [valor];
        ids.forEach((id) => {
          const producto = buscarPorId(id);
          if (producto) {
            nuevoTotal += Number(producto.precio_pesos_iva_ajustado);
            if (
              producto.consumo &&
              !producto.nombre.toLowerCase().includes("fuente")
            ) {
              nuevoWatts += Number(producto.consumo);
            }
          }
        });
      }
    });

    dispatch(setTotal(nuevoTotal));
    dispatch(setWatts(nuevoWatts));
  }, [selectedParts, buscarPorId, dispatch]);

  const handleSeleccionar = (id_producto) => {
    const categoriaRedux =
      categoryMap[secuenciaCategorias[tipoIndex] || category];
    if (!categoriaRedux) return;

    const currentSelected = selectedParts[categoriaRedux];
    const isArrayField =
      categoriaRedux === "ram" || categoriaRedux === "storage";

    if (isArrayField) {
      const max = categoriaRedux === "ram" ? 4 : 4;
      if (
        !currentSelected.includes(id_producto) &&
        currentSelected.length < max
      ) {
        dispatch(selectPart({ category: categoriaRedux, part: id_producto }));
      }
    } else {
      dispatch(selectPart({ category: categoriaRedux, part: id_producto }));
      const siguiente = tipoIndex + 1;
      if (siguiente < secuenciaCategorias.length) setTipoIndex(siguiente);
    }
  };

  const eliminarID = (id_producto) => {
    const producto = buscarPorId(id_producto);
    if (!producto) return;
    const categoria = categoryMap[producto.categoria] || producto.categoria;
    dispatch(removePart({ category: categoria, part: id_producto }));
  };

  const handleReset = () => {
    dispatch(clearBuild());
    setTipoIndex(0);
    setMarcaCPU(null);
  };

  useEffect(() => {
    getArmador();
  }, [getArmador]);

  useEffect(() => {
    calcularTotales();
  }, [calcularTotales]);

  const handleSiguiente = () => {
    if (tipoIndex < secuenciaCategorias.length - 1) {
      setTipoIndex(tipoIndex + 1);
    }
  };

  const handleAnterior = () => {
    if (tipoIndex > 0) {
      setTipoIndex(tipoIndex - 1);
    }
  };

  const cambiarOrden = (nuevoOrden) => {
    dispatch(setOrder(nuevoOrden));
  };

  return (
    <div className="containerArmador">
      <div className="armador">
        <Box display="flex" className="ladoIzquierdoArmador">
          <CategoriasSelector
            setTipo={(categoria) => {
              const index = secuenciaCategorias.indexOf(categoria);
              if (index !== -1) setTipoIndex(index);
            }}
            selectedParts={selectedParts}
            buscarPorId={buscarPorId}
          />
          <Box className="elecciones" flex={1} p={2}>
            <ProductosSeleccionados
              elecciones={selectedParts}
              buscarPorId={buscarPorId}
              eliminarID={eliminarID}
            />
            <TotalesYComprar total={total} watts={watts} />
          </Box>
        </Box>

        <Box>
          <Box display="flex" justifyContent="center" gap={2} my={2}>
            <Button onClick={handleReset} variant="outlined" color="error">
              Reiniciar Armado
            </Button>
          </Box>

          {tipoIndex === 0 && !marcaCPU && (
            <Box display="flex" justifyContent="center" gap={2} my={2}>
              <Button
                variant="contained"
                onClick={() => setMarcaCPU("amd")}
                sx={{ backgroundColor: "#9c27b0" }}
              >
                AMD
              </Button>
              <Button
                variant="contained"
                onClick={() => setMarcaCPU("intel")}
                sx={{ backgroundColor: "#1976d2" }}
              >
                Intel
              </Button>
            </Box>
          )}

          {marcaCPU && (
            <>
              <Box display="flex" justifyContent="center" gap={2} mb={2}>
                <Button
                  variant="outlined"
                  onClick={handleAnterior}
                  disabled={tipoIndex === 0}
                >
                  Anterior
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSiguiente}
                  disabled={tipoIndex >= secuenciaCategorias.length - 1}
                  sx={{ backgroundColor: "#FF852A" }}
                >
                  Siguiente
                </Button>
              </Box>

              <Box display="flex" justifyContent="center" gap={2} mb={2}>
                <Button
                  variant={order === "ASC" ? "contained" : "outlined"}
                  onClick={() => cambiarOrden("ASC")}
                >
                  Menor a Mayor
                </Button>
                <Button
                  variant={order === "DESC" ? "contained" : "outlined"}
                  onClick={() => cambiarOrden("DESC")}
                >
                  Mayor a Menor
                </Button>
              </Box>

              <ListadoProductos
                productos={productos}
                tipo={secuenciaCategorias[tipoIndex] || category}
                handleSeleccionar={handleSeleccionar}
              />
            </>
          )}
        </Box>
      </div>
    </div>
  );
}

export default ArmadorPc;
