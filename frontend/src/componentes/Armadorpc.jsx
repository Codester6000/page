// ✅ ArmadorPc.jsx (COMPLETO Y FUNCIONAL)
import { useState, useEffect, useCallback } from "react";
import "../styleArmador.css";
import axios from "axios";
import { useAuth } from "../Auth";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  setProductos,
  setTotal,
  setWatts,
  setOrder,
  selectPart,
  removePart,
} from "../redux/slices/buildSlice";
import { ListadoProductos } from "./armador/listadoProductos";
import { TotalesYComprar } from "./armador/totalesYComprar";
import { CategoriasSelector } from "./armador/categoriasSelector";
import { ProductosSeleccionados } from "./armador/productosSeleccionados";

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

function ArmadorPc({ category, parts }) {
  const url = import.meta.env.VITE_URL_BACK;
  const { sesion } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const selectedParts = useSelector((state) => state.build.selectedParts);
  const productos = useSelector((state) => state.build.productos);
  const total = useSelector((state) => state.build.total);
  const watts = useSelector((state) => state.build.watts);
  const order = useSelector((state) => state.build.order);

  const [tipo, setTipo] = useState(Object.keys(categoryMap)[0]);

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
      } else {
        console.error("Error al obtener productos:", response.status);
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  }, [url, selectedParts, order, watts, sesion.token, dispatch, buscarPorId]);

  const calcularTotales = useCallback(() => {
    let nuevoTotal = 0;
    let nuevoWatts = 0;

    Object.entries(selectedParts || {}).forEach(([category, valor]) => {
      if (valor) {
        const ids = Array.isArray(valor) ? valor : [valor];
        ids.forEach((productoId) => {
          const producto = buscarPorId(productoId);
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
    const categoriaRedux = categoryMap[tipo || category];
    if (!categoriaRedux) {
      console.warn("Categoría no mapeada:", tipo || category);
      return;
    }
    console.log("👉 handleSeleccionar:", {
      tipo,
      category,
      categoriaRedux,
    });
    dispatch(selectPart({ category: categoriaRedux, part: id_producto }));
  };

  const eliminarID = (id_producto) => {
    const producto = buscarPorId(id_producto);
    if (!producto) return;

    const categoria = categoryMap[producto.categoria] || producto.categoria;
    dispatch(removePart({ category: categoria, part: id_producto }));
  };

  useEffect(() => {
    getArmador();
  }, [getArmador]);

  useEffect(() => {
    calcularTotales();
  }, [calcularTotales]);

  useEffect(() => {
    console.log("🧩 Partes seleccionadas:", selectedParts);
  }, [selectedParts]);

  return (
    <div className="containerArmador">
      <div className="armador">
        <Box display="flex" className="ladoIzquierdoArmador">
          <CategoriasSelector
            setTipo={setTipo}
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
          <ListadoProductos
            productos={productos}
            tipo={tipo || category}
            handleSeleccionar={handleSeleccionar}
          />
        </Box>
      </div>
    </div>
  );
}

export default ArmadorPc;
