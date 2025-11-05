import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Button,
  Grid,
  Container,
  useMediaQuery,
  useTheme,
  Alert,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
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
  setCompatibilidad,
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
  const compatibilidad = useSelector((state) => state.build.compatibilidad);
  const total = useSelector((state) => state.build.total);
  const watts = useSelector((state) => state.build.watts);
  const order = useSelector((state) => state.build.order);

  const [tipoIndex, setTipoIndex] = useState(0);
  const [validacionErrors, setValidacionErrors] = useState([]);
  const [isValidating, setIsValidating] = useState(false);
  // Estado para controlar el modal de mantenimiento
  const [openMantenimiento, setOpenMantenimiento] = useState(false);

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
        if (!id) return;

        const producto = buscarPorId(id);
        if (producto) {
          total += Number(producto.precio_pesos_iva_ajustado || 0);

          if (categoria !== "psu" && producto.consumo) {
            let consumoProducto = Number(producto.consumo || 0);

            if (
              categoria === "cpu" &&
              (consumoProducto === 0 || consumoProducto < 50)
            ) {
              const nombreUpper = producto.nombre?.toUpperCase() || "";

              if (
                (nombreUpper.includes("RYZEN") && nombreUpper.includes("3")) ||
                nombreUpper.includes("I3")
              ) {
                consumoProducto = 65;
              } else if (
                (nombreUpper.includes("RYZEN") && nombreUpper.includes("5")) ||
                nombreUpper.includes("I5")
              ) {
                consumoProducto = 90;
              } else if (
                (nombreUpper.includes("RYZEN") && nombreUpper.includes("7")) ||
                nombreUpper.includes("I7")
              ) {
                if (
                  nombreUpper.includes("7950X") ||
                  nombreUpper.includes("7900X") ||
                  nombreUpper.includes("I7-13700") ||
                  nombreUpper.includes("I7-12700")
                ) {
                  consumoProducto = 180;
                } else {
                  consumoProducto = 140;
                }
              } else if (
                (nombreUpper.includes("RYZEN") && nombreUpper.includes("9")) ||
                nombreUpper.includes("I9")
              ) {
                if (
                  nombreUpper.includes("I9-13900") ||
                  nombreUpper.includes("9950X")
                ) {
                  consumoProducto = 240;
                } else {
                  consumoProducto = 180;
                }
              } else {
                consumoProducto = 65;
              }
            }

            watts += consumoProducto;
          }
        }
      });
    });

    console.log("Cálculo de watts:", { selectedParts, watts, total });

    dispatch(setTotal(total));
    dispatch(setWatts(watts));
  }, [selectedParts, buscarPorId, dispatch]);

  const validarCompatibilidad = async (partsToValidate) => {
    if (
      !partsToValidate ||
      Object.keys(partsToValidate).every(
        (key) =>
          !partsToValidate[key] ||
          (Array.isArray(partsToValidate[key]) &&
            partsToValidate[key].length === 0)
      )
    ) {
      setValidacionErrors([]);
      return;
    }

    setIsValidating(true);
    const componentes = {
      procesador_id: partsToValidate.cpu || null,
      motherboard_id: partsToValidate.motherboard || null,
      memoria_id: partsToValidate.ram?.[0] || null,
      gpu_id: partsToValidate.gpu || null,
      fuente_id: partsToValidate.psu || null,
    };

    try {
      const res = await axios.post(
        `${url}/armador/validar-compatibilidad`,
        { componentes },
        {
          headers: {
            Authorization: `Bearer ${sesion.token}`,
          },
        }
      );

      if (res.status === 200) {
        const { validaciones, restricciones } = res.data;
        setValidacionErrors(validaciones.errores || []);

        const newCompatibilidad = {
          socket_requerido: restricciones.socketRequerido,
          ram_requerida: restricciones.ramRequerida,
          consumo_total: restricciones.consumoTotal,
          fuente_minima: restricciones.fuenteMinima,
        };

        const currentCompatibilidad = compatibilidad;
        if (
          JSON.stringify(currentCompatibilidad) !==
          JSON.stringify(newCompatibilidad)
        ) {
          dispatch(setCompatibilidad(newCompatibilidad));
        }
      }
    } catch (error) {
      console.error("Error validando compatibilidad:", error);
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    calcularTotalesYWatts();
  }, [selectedParts, calcularTotalesYWatts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      validarCompatibilidad(selectedParts);
    }, 500);

    return () => clearTimeout(timer);
  }, [
    selectedParts.cpu,
    selectedParts.motherboard,
    selectedParts.ram,
    selectedParts.gpu,
    selectedParts.psu,
  ]);

  const getArmador = useCallback(async () => {
    const query = [];
    if (selectedParts.cpu) query.push(`procesador_id=${selectedParts.cpu}`);
    if (selectedParts.motherboard)
      query.push(`motherboard_id=${selectedParts.motherboard}`);
    if (selectedParts.ram?.length)
      query.push(`memoria_id=${selectedParts.ram[0]}`);
    if (selectedParts.gpu) query.push(`gpu_id=${selectedParts.gpu}`);
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

        if (res.data.compatibilidad) {
          const newCompatibilidad = res.data.compatibilidad;
          const currentCompatibilidad = compatibilidad;

          if (
            JSON.stringify(currentCompatibilidad) !==
            JSON.stringify(newCompatibilidad)
          ) {
            dispatch(setCompatibilidad(newCompatibilidad));
          }
        }
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

      if (["procesadores", "motherboards", "gpus"].includes(tipo)) {
        setTimeout(() => {
          setTipoIndex((prev) =>
            Math.min(prev + 1, secuenciaCategorias.length - 1)
          );
        }, 300);
      }
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
    setValidacionErrors([]);
  };

  const cambiarOrden = (orden) => dispatch(setOrder(orden));

  // Función modificada para mostrar el modal en lugar de agregar al carrito
  const handleAgregarCarrito = async () => {
    // Mostrar el modal de mantenimiento
    setOpenMantenimiento(true);

    // Código original comentado para cuando quieras reactivarlo:
    /*
    // Verificar que no haya errores de compatibilidad críticos
    if (validacionErrors.length > 0) {
      const hasSocketError = validacionErrors.some(
        (error) => error.includes("socket") || error.includes("compatible")
      );

      if (hasSocketError) {
        alert(
          "No puedes proceder con componentes incompatibles. Por favor, revisa la selección."
        );
        return;
      }
    }

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
    */
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setOpenMantenimiento(false);
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
      {/* Alertas de compatibilidad */}
      {validacionErrors.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Box>
            <strong>Problemas de compatibilidad detectados:</strong>
            <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
              {validacionErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Box>
        </Alert>
      )}

      {/* Información de compatibilidad actual */}
      {compatibilidad &&
        (compatibilidad.socket_requerido || compatibilidad.ram_requerida) && (
          <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
            {compatibilidad.socket_requerido && (
              <Chip
                label={`Socket: ${compatibilidad.socket_requerido}`}
                color="primary"
                size="small"
              />
            )}
            {compatibilidad.ram_requerida && (
              <Chip
                label={`RAM: ${compatibilidad.ram_requerida}`}
                color="secondary"
                size="small"
              />
            )}
            {compatibilidad.fuente_minima > 0 && (
              <Chip
                label={`Fuente mín: ${compatibilidad.fuente_minima}W`}
                color="warning"
                size="small"
              />
            )}
          </Box>
        )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <CategoriasSelector
            setTipo={(categoria) => {
              const index = secuenciaCategorias.indexOf(categoria);
              if (index !== -1) setTipoIndex(index);
            }}
            selectedParts={selectedParts}
            buscarPorId={buscarPorId}
            compatibilidad={compatibilidad}
            validacionErrors={validacionErrors}
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

            {isValidating && (
              <Tooltip title="Validando compatibilidad...">
                <Button variant="outlined" disabled size="small">
                  🔄
                </Button>
              </Tooltip>
            )}
          </Box>

          <div ref={pdfRef}>
            <ProductosSeleccionados
              elecciones={selectedParts}
              buscarPorId={buscarPorId}
              eliminarID={eliminarID}
              compatibilidad={compatibilidad}
              validacionErrors={validacionErrors}
            />

            <ListadoProductos
              productos={productos}
              tipo={tipo}
              handleSeleccionar={handleSeleccionar}
              compatibilidad={compatibilidad}
              selectedParts={selectedParts}
            />
          </div>
        </Grid>

        <Grid item xs={12} md={3}>
          <TotalesYComprar
            total={total}
            watts={watts}
            handleAgregarCarrito={handleAgregarCarrito}
            compatibilidad={compatibilidad}
            validacionErrors={validacionErrors}
          />
        </Grid>
      </Grid>

      {/* Modal de Mantenimiento */}
      <Dialog
        open={openMantenimiento}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            textAlign: "center",
          },
        }}
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              pt: 2,
            }}
          >
            <Box
              sx={{
                backgroundColor: "warning.light",
                borderRadius: "50%",
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BuildIcon sx={{ fontSize: 48, color: "warning.dark" }} />
            </Box>
            <Typography variant="h5" fontWeight="bold">
              Funcionalidad en Mantenimiento
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Estamos trabajando para mejorar tu experiencia de compra.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            El proceso de agregar componentes al carrito se encuentra
            temporalmente deshabilitado mientras realizamos mejoras en el
            sistema.
          </Typography>
          <Box
            sx={{
              mt: 3,
              p: 2,
              backgroundColor: "info.lighter",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "info.light",
            }}
          >
            <Typography variant="body2" fontWeight="medium">
              💡 Puedes seguir armando tu PC y exportar el presupuesto en PDF
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
          <Button
            onClick={handleCloseModal}
            variant="contained"
            color="primary"
            size="large"
          >
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ArmadorPc;
