import { useState, useEffect } from "react";
import "../styleArmador.css";

import { useAuth } from "../Auth";

import { useNavigate } from "react-router-dom";
import { Box, Paper } from "@mui/material";
import { useDispatch } from "react-redux";
import { selectPart } from "../redux/slices/buildSlice";
import { ListadoProductos } from "./armador/listadoProductos";
import { TotalesYComprar } from "./armador/totalesYComprar";
import { CategoriasSelector } from "./armador/categoriasSelector";
import { ProductosSeleccionados } from "./armador/productosSeleccionados";

function ArmadorPc({ category, parts }) {
  const url = import.meta.env.VITE_URL_BACK;
  const { sesion } = useAuth();
  const navigate = useNavigate();
  const [productos, setProductos] = useState({
    productos: {
      procesadores: [],
      mothers: [],
      placas: [],
      almacenamiento: [],
      memorias: [],
      fuentes: [],
      gabinetes: [],
      coolers: [],
      monitores: [],
    },
  });

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

  // Crear el índice una vez
  const indiceProductos = crearIndice(productos.productos);

  // Búsqueda rápida
  const buscarPorId = (id) => indiceProductos[id] || null;
  const [watts, setWatts] = useState(0);
  const [tipo, setTipo] = useState("procesadores");
  const [elecciones, setElecciones] = useState({
    procesador: "",
    mother: "",
    placa: "",
    memorias: [],
    almacenamiento: [],
    coolers: [],
    fuente: "",
    gabinete: "",
    monitores: [],
  });
  const [total, setTotal] = useState(0);
  const [order, setOrder] = useState("asc");
  const getArmador = async () => {
    let query = `?`;
    if (elecciones.procesador != "") {
      query += `&procesador_id=${elecciones.procesador}`;
    }
    if (elecciones.mother != "") {
      query += `&motherboard_id=${elecciones.mother}`;
    }
    if (elecciones.memorias.length > 0) {
      query += `&memoria_id=${elecciones.memorias[0]}`;
    }
    if (order != "") {
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
        setProductos(data);
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
  }, [elecciones, order]);
  const eliminarID = (id) => {
    setElecciones((prevElecciones) => {
      const nuevasElecciones = { ...prevElecciones };

      Object.keys(nuevasElecciones).forEach((key) => {
        if (Array.isArray(nuevasElecciones[key])) {
          // Si es un array, eliminamos el ID si está presente
          nuevasElecciones[key] = nuevasElecciones[key].filter(
            (item) => item !== id
          );
        } else if (nuevasElecciones[key] === id) {
          // Si no es un array y coincide, lo eliminamos
          nuevasElecciones[key] = "";
        }
      });

      return nuevasElecciones;
    });
  };
  const handleSeleccionar = (id_producto) => {
    switch (tipo) {
      case "procesadores":
        setElecciones({ ...elecciones, procesador: id_producto });
        setTipo("motherboards");
        break;
      case "motherboards":
        setElecciones({ ...elecciones, mother: id_producto });
        setTipo("gpus");
        break;
      case "gpus":
        setElecciones({ ...elecciones, placa: id_producto });
        setTipo("memorias");
        break;
      case "memorias":
        if (elecciones.memorias.length < 4) {
          setElecciones({
            ...elecciones,
            memorias: [...elecciones.memorias, id_producto],
          });
          if (elecciones.memorias.length == 4) {
            setTipo("almacenamiento");
          }
        } else {
          setTipo("almacenamiento");
        }

        break;
      case "almacenamiento":
        if (elecciones.memorias.length < 4) {
          setElecciones({
            ...elecciones,
            almacenamiento: [...elecciones.almacenamiento, id_producto],
          });
          if (elecciones.memorias.length == 4) {
            setTipo("fuentes");
          }
        } else {
          setTipo("fuentes");
        }

        break;
      case "fuentes":
        setElecciones({ ...elecciones, fuente: id_producto });
        setTipo("gabinetes");
        break;
      case "gabinetes":
        setElecciones({ ...elecciones, gabinete: id_producto });
        setTipo("coolers");
        break;
      case "coolers":
        setElecciones({
          ...elecciones,
          coolers: [...elecciones.coolers, id_producto],
        });
        break;
      case "monitores":
        setElecciones({
          ...elecciones,
          monitores: [...elecciones.monitores, id_producto],
        });
        break;

      default:
        break;
    }
  };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const handleAgregarCarrito = async () => {
    if (total == 0) {
      return;
    }
    const carritoObj = {}; // Objeto para agrupar productos por id y sumar cantidades

    // eslint-disable-next-line no-unused-vars
    Object.entries(elecciones).forEach(([categoria, valor]) => {
      if (
        valor === 0 ||
        valor === "" ||
        (Array.isArray(valor) && valor.length === 0)
      ) {
        // Ignorar valores vacíos, 0 o arreglos vacíos
        return;
      }

      if (Array.isArray(valor)) {
        // Procesar cada elemento del arreglo
        valor.forEach((producto) => {
          if (producto && typeof producto === "number") {
            // Asegurarse de que el ID sea un número válido
            carritoObj[producto] = (carritoObj[producto] || 0) + 1;
          }
        });
      } else if (typeof valor === "number" && valor > 0) {
        // Agregar IDs numéricos no pertenecientes a arreglos
        carritoObj[valor] = (carritoObj[valor] || 0) + 1;
      }
    });

    try {
      // Procesar cada producto de forma secuencial
      const entries = Object.entries(carritoObj);

      for (const [id_producto, cantidad] of entries) {
        // Esperar 1000ms antes de cada petición
        await sleep(50);

        const response = await fetch(`${url}/carrito`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sesion.token}`,
          },
          body: JSON.stringify({
            id_producto: id_producto,
            cantidad: cantidad,
          }),
        });

        if (response.ok) {
          console.log("Producto agregado al carrito");
        }
      }

      // Solo navegar cuando todo esté listo
      navigate("/checkout");
    } catch (error) {
      console.error("Error al agregar productos al carrito:", error);
      // Manejar el error, tal vez mostrar una notificación al usuario
    }
  };

  // Agregar nuevo useEffect para manejar el cálculo de totales
  useEffect(() => {
    const calcularTotales = () => {
      let nuevoTotal = 0;
      let nuevoWatts = 0;

      Object.entries(elecciones).forEach(([, valor]) => {
        if (valor) {
          if (Array.isArray(valor)) {
            valor.forEach((productoId) => {
              const producto = buscarPorId(productoId);
              if (producto) {
                nuevoTotal += Number(producto.precio_pesos_iva_ajustado);
                // Solo suma watts si no es una fuente y tiene consumo
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
              // Solo suma watts si no es una fuente y tiene consumo
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

      setTotal(nuevoTotal);
      setWatts(nuevoWatts);
    };

    calcularTotales();
  }, [elecciones]);

  return (
    <>
      return (
      <div className="containerArmador">
        <div className="armador">
          <Box display="flex" className="ladoIzquierdoArmador">
            <CategoriasSelector setTipo={setTipo} />
            <Box className="elecciones" flex={1} p={2}>
              <ProductosSeleccionados
                elecciones={elecciones}
                buscarPorId={buscarPorId}
                eliminarID={eliminarID}
              />
              <TotalesYComprar
                total={total}
                watts={watts}
                handleAgregarCarrito={handleAgregarCarrito}
              />
            </Box>
          </Box>

          <div className="productos">
            <div className="filtrosContainer">
              <form className="filtrosArmador">
                <select
                  className="ordernarPor"
                  name="ordenarPor"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                >
                  <option value="ASC">Precio menor a mayor</option>
                  <option value="DESC">Precio mayor a menor</option>
                </select>

                {((tipo === "memorias" && elecciones.memorias.length > 0) ||
                  (tipo === "almacenamiento" &&
                    elecciones.almacenamiento.length > 0) ||
                  (tipo === "coolers" && elecciones.coolers.length > 0)) && (
                  <div
                    className="siguiente"
                    onClick={() => {
                      if (tipo === "almacenamiento") setTipo("fuentes");
                      else if (tipo === "memorias") setTipo("almacenamiento");
                      else if (tipo === "coolers") setTipo("monitores");
                    }}
                  >
                    Siguiente
                  </div>
                )}
              </form>
            </div>

            <ListadoProductos
              productos={productos}
              tipo={tipo}
              handleSeleccionar={handleSeleccionar}
            />
          </div>
        </div>
      </div>
      );
    </>
  );
}
export default ArmadorPc;
