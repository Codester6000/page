import { useEffect } from "react";
import "../styleArmador.css";
import { useAuth } from "../Auth";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { selectPart } from "../redux/slices/buildSlice";
import {
  setProductos,
  setTotal,
  setWatts,
  setOrder,
} from "../redux/slices/buildSlice";
import { ListadoProductos } from "./armador/listadoProductos";
import { TotalesYComprar } from "./armador/totalesYComprar";
import { CategoriasSelector } from "./armador/categoriasSelector";
import { ProductosSeleccionados } from "./armador/productosSeleccionados";

function ArmadorPc({ category, parts }) {
  const url = import.meta.env.VITE_URL_BACK;
  const { sesion } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedParts = useSelector((state) => state.build.selectedParts);
  const productos = useSelector((state) => state.armador.productos);
  const total = useSelector((state) => state.armador.total);
  const watts = useSelector((state) => state.armador.watts);
  const order = useSelector((state) => state.armador.order);

  // Crear un índice
  const crearIndice = (productos) => {
    const indice = {};
    for (const categoria in productos) {
      productos[categoria].forEach((producto) => {
        indice[producto.id_producto] = { ...producto, categoria };
      });
    }
    return indice;
  };

  const indiceProductos = crearIndice(productos);

  // Búsqueda rápida
  const buscarPorId = (id) => indiceProductos[id] || null;

  const getArmador = async () => {
    let query = `?`;
    if (selectedParts.cpu) {
      query += `&procesador_id=${selectedParts.cpu}`;
    }
    if (selectedParts.motherboard) {
      query += `&motherboard_id=${selectedParts.motherboard}`;
    }
    if (selectedParts.ram) {
      query += `&memoria_id=${selectedParts.ram[0]}`;
    }
    if (order) {
      query += `&order=${order}`;
    }
    if (watts > 0) {
      query += `&consumoW=${watts}`;
    }

    try {
      const response = await fetch(`${url}/armador${query}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sesion.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        dispatch(setProductos(data));
      } else {
        console.error("Error al obtener productos:", response.status);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getArmador();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedParts, order]);

  useEffect(() => {
    const calcularTotales = () => {
      let nuevoTotal = 0;
      let nuevoWatts = 0;

      Object.entries(selectedParts).forEach(([category, valor]) => {
        if (valor) {
          if (Array.isArray(valor)) {
            valor.forEach((productoId) => {
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
          } else {
            const producto = buscarPorId(valor);
            if (producto) {
              nuevoTotal += Number(producto.precio_pesos_iva_ajustado);
              if (
                producto.consumo &&
                !producto.nombre.toLowerCase().includes("fuente")
              ) {
                nuevoWatts += Number(producto.consumo);
              }
            }
          }
        }
      });

      dispatch(setTotal(nuevoTotal));
      dispatch(setWatts(nuevoWatts));
    };

    calcularTotales();
  }, [selectedParts, dispatch]);

  const handleSeleccionar = (id_producto) => {
    dispatch(selectPart({ category, part: id_producto }));
  };

  return (
    <div className="containerArmador">
      <div className="armador">
        <Box display="flex" className="ladoIzquierdoArmador">
          <CategoriasSelector setTipo={setTipo} />
          <Box className="elecciones" flex={1} p={2}>
            <ProductosSeleccionados
              elecciones={selectedParts}
              buscarPorId={buscarPorId}
            />
            <TotalesYComprar total={total} watts={watts} />
          </Box>
        </Box>

        <div className="productos">
          <div className="filtrosContainer">
            <form className="filtrosArmador">
              <select
                className="ordernarPor"
                name="ordenarPor"
                value={order}
                onChange={(e) => dispatch(setOrder(e.target.value))}
              >
                <option value="ASC">Precio menor a mayor</option>
                <option value="DESC">Precio mayor a menor</option>
              </select>
            </form>
          </div>

          <ListadoProductos
            productos={productos}
            tipo={category}
            handleSeleccionar={handleSeleccionar}
          />
        </div>
      </div>
    </div>
  );
}

export default ArmadorPc;
