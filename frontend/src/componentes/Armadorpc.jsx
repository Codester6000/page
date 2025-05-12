import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Button,
  Grid,
  Container,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import axios from "axios";
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
import { useAuth } from "../Auth";
import { useNavigate, Navigate } from "react-router-dom";
import { ListadoProductos } from "./armador/listadoProductos";
import { CategoriasSelector } from "./armador/categoriasSelector";
import { ProductosSeleccionados } from "./armador/productosSeleccionados";
import TotalesYComprar from "./armador/totalesYComprar";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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

  if (!sesion) {
    return <Navigate to="/login" replace />;
  }

  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const selectedParts = useSelector((state) => state.build.selectedParts);
  const productos = useSelector((state) => state.build.productos);
  const total = useSelector((state) => state.build.total);
  const watts = useSelector((state) => state.build.watts);
  const order = useSelector((state) => state.build.order);

  const [tipoIndex, setTipoIndex] = useState(0);
  const tipo = secuenciaCategorias[tipoIndex];

  const crearIndice = useCallback((productosRaw) => {
    const indice = {};
    for (const categoria in productosRaw?.productos || {}) {
      const lista = productosRaw.productos[categoria];
      if (Array.isArray(lista)) {
        lista.forEach((p) => {
          if (p.id_producto) {
            indice[p.id_producto] = { ...p, categoria };
          }
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

  const calcularTotalesYWatts = useCallback(() => {
    let total = 0;
    let watts = 0;
    Object.entries(selectedParts).forEach(([categoria, ids]) => {
      const lista = Array.isArray(ids) ? ids : [ids];
      lista.forEach((id) => {
        const producto = buscarPorId(id);
        if (producto) {
          total += Number(producto.precio_pesos_iva_ajustado || 0);
          if (
            producto.consumo &&
            !producto.nombre?.toLowerCase().includes("fuente")
          ) {
            watts += Number(producto.consumo || 0);
          }
        }
      });
    });
    dispatch(setTotal(total));
    dispatch(setWatts(watts));
  }, [selectedParts, buscarPorId, dispatch]);

  useEffect(() => {
    calcularTotalesYWatts();
  }, [selectedParts, calcularTotalesYWatts]);

  const getArmador = useCallback(async () => {
    const query = [];
    if (selectedParts.cpu) query.push(`procesador_id=${selectedParts.cpu}`);
    if (selectedParts.motherboard)
      query.push(`motherboard_id=${selectedParts.motherboard}`);
    if (selectedParts.ram?.length)
      query.push(`memoria_id=${selectedParts.ram[0]}`);
    if (order) query.push(`order=${order}`);
    if (watts) query.push(`consumoW=${watts}`);

    try {
      const res = await axios.get(
        `${url}/armador${query.length ? `?${query.join("&")}` : ""}`,
        {
          headers: {
            Authorization: `Bearer ${sesion.token}`,
          },
        }
      );
      if (res.status === 200) {
        dispatch(setProductos(res.data));
      }
    } catch (error) {
      console.error("Error al obtener productos:", error);
    }
  }, [url, selectedParts, order, watts, sesion.token, dispatch]);

  const handleSeleccionar = (id) => {
    const reduxKey = categoryMap[tipo || category];
    const current = selectedParts[reduxKey];
    const isArray = Array.isArray(current);
    if (isArray) {
      const next = [...current, id];
      if (next.length <= 4) {
        dispatch(selectPart({ category: reduxKey, part: id }));
        if (next.length === 4) {
          setTimeout(() => {
            setTipoIndex((prev) =>
              Math.min(prev + 1, secuenciaCategorias.length - 1)
            );
          }, 300);
        }
      }
    } else {
      dispatch(selectPart({ category: reduxKey, part: id }));
      setTipoIndex((prev) =>
        Math.min(prev + 1, secuenciaCategorias.length - 1)
      );
    }
  };

  const eliminarID = (id) => {
    const producto = buscarPorId(id);
    if (!producto) return;
    const reduxKey = categoryMap[producto.categoria] || producto.categoria;
    dispatch(removePart({ category: reduxKey, part: id }));
  };

  const handleReset = () => {
    dispatch(clearBuild());
    setTipoIndex(0);
  };

  const cambiarOrden = (orden) => dispatch(setOrder(orden));

  const handleAgregarCarrito = async () => {
    if (total === 0) return;

    const carritoObj = {};

    Object.entries(selectedParts).forEach(([_, valor]) => {
      if (!valor || (Array.isArray(valor) && valor.length === 0)) return;

      if (Array.isArray(valor)) {
        valor.forEach((id) => {
          carritoObj[id] = (carritoObj[id] || 0) + 1;
        });
      } else {
        carritoObj[valor] = (carritoObj[valor] || 0) + 1;
      }
    });

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    try {
      for (const [id_producto, cantidad] of Object.entries(carritoObj)) {
        await sleep(50);
        await fetch(`${url}/carrito`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sesion.token}`,
          },
          body: JSON.stringify({ id_producto, cantidad }),
        });
      }
      navigate("/checkout");
    } catch (error) {
      console.error("Error al agregar productos al carrito:", error);
    }
  };

  useEffect(() => {
    getArmador();
  }, [getArmador]);

  const pdfRef = useRef();

  const exportarPDF = async () => {
    const input = pdfRef.current;
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("presupuesto_pc.pdf");
  };

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <CategoriasSelector
            setTipo={(categoria) => {
              const index = secuenciaCategorias.indexOf(categoria);
              if (index !== -1) setTipoIndex(index);
            }}
            selectedParts={selectedParts}
            buscarPorId={buscarPorId}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Box
            display="flex"
            justifyContent="center"
            gap={2}
            mb={2}
            flexWrap="wrap"
          >
            <Button
              variant="outlined"
              onClick={() => setTipoIndex((prev) => Math.max(prev - 1, 0))}
              disabled={tipoIndex === 0}
            >
              Anterior
            </Button>
            <Button
              variant="contained"
              sx={{ backgroundColor: "#FF852A" }}
              onClick={() =>
                setTipoIndex((prev) =>
                  Math.min(prev + 1, secuenciaCategorias.length - 1)
                )
              }
              disabled={tipoIndex >= secuenciaCategorias.length - 1}
            >
              Siguiente
            </Button>
            <Button color="error" onClick={handleReset}>
              Reiniciar
            </Button>
          </Box>

          <div ref={pdfRef}>
            <ProductosSeleccionados
              elecciones={selectedParts}
              buscarPorId={buscarPorId}
              eliminarID={eliminarID}
            />
            <ListadoProductos
              productos={productos}
              tipo={tipo}
              handleSeleccionar={handleSeleccionar}
            />
          </div>
        </Grid>

        <Grid item xs={12} md={3}>
          <TotalesYComprar
            total={total}
            watts={watts}
            handleAgregarCarrito={handleAgregarCarrito}
          />
        </Grid>
      </Grid>
    </Container>
  );
}

export default ArmadorPc;
