import { useState, useEffect } from "react";
import "../styleArmador.css";
import icono_cpu from "/iconos/armadorIconos/cpu.png";
import icono_gpu from "/iconos/armadorIconos/gpu.png";
import icono_psu from "/iconos/armadorIconos/psu.png";
import icono_ram from "/iconos/armadorIconos/ram.png";
import icono_hdd from "/iconos/armadorIconos/hdd.png";
import icono_mother from "/iconos/armadorIconos/motherboard.png";
import icono_gabinete from "/iconos/armadorIconos/gabinete.png";
import icono_cooler from "/iconos/armadorIconos/cooler.png";
import icono_monitor from "/iconos/armadorIconos/monitor.png";
import { useAuth } from "../Auth";

import Card from "@mui/joy/Card";
import Grid from "@mui/joy/Grid";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import AspectRatio from "@mui/joy/AspectRatio";
import Button from "@mui/material/Button";
import IconButton from "@mui/joy/IconButton";

import Delete from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { Box, Paper } from "@mui/material";

function ArmadorPc() {
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
    <div className="containerArmador">
      <div className="armador">
        <Box display="flex" className="ladoIzquierdoArmador">
          {/* Sección de íconos de categorías */}
          <Box
            className="tipo"
            display="flex"
            flexDirection="column"
            gap={2}
            p={2}
          >
            {[
              ["procesadores", icono_cpu],
              ["motherboards", icono_mother],
              ["gpus", icono_gpu],
              ["memorias", icono_ram],
              ["almacenamiento", icono_hdd],
              ["fuentes", icono_psu],
              ["gabinetes", icono_gabinete],
              ["coolers", icono_cooler],
              ["monitores", icono_monitor],
            ].map(([tipo, icono]) => (
              <Box
                key={tipo}
                sx={{
                  cursor: "pointer",
                  p: 1,
                  "&:hover": {
                    backgroundColor: "#f0f0f0",
                    borderRadius: "10px",
                  },
                }}
                onClick={() => setTipo(tipo)}
              >
                <img src={icono} alt={tipo} width={40} />
              </Box>
            ))}
          </Box>

          {/* Sección de productos seleccionados */}
          <Box className="elecciones" flex={1} p={2}>
            <Grid container spacing={2}>
              {Object.entries(elecciones).map(([categoria, valor]) => {
                if (valor == 0) return null;

                if (typeof valor === "object") {
                  return valor.map((productoArreglo, index) => {
                    const producto = buscarPorId(productoArreglo);
                    return (
                      <Grid item xs={12} key={`${productoArreglo}-${index}`}>
                        <Paper
                          elevation={3}
                          sx={{ p: 2, position: "relative" }}
                        >
                          <Typography fontWeight="bold">
                            {producto.nombre}
                          </Typography>
                          <Typography color="text.secondary">
                            {Number(
                              producto.precio_pesos_iva_ajustado
                            ).toLocaleString("es-ar", {
                              style: "currency",
                              currency: "ARS",
                              maximumFractionDigits: 0,
                            })}
                          </Typography>
                          <IconButton
                            onClick={() => eliminarID(producto.id_producto)}
                            sx={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              backgroundColor: "#a111ad",
                              color: "white",
                              "&:hover": {
                                backgroundColor: "#e0e0e0",
                                color: "black",
                              },
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Paper>
                      </Grid>
                    );
                  });
                } else {
                  const producto = buscarPorId(valor);
                  return (
                    <Grid item xs={12} key={categoria}>
                      <Paper elevation={23} sx={{ p: 2, position: "relative" }}>
                        <Typography fontWeight="bold">
                          {producto.nombre}
                        </Typography>
                        <Typography color="text.secondary">
                          {Number(
                            producto.precio_pesos_iva_ajustado
                          ).toLocaleString("es-ar", {
                            style: "currency",
                            currency: "ARS",
                            maximumFractionDigits: 0,
                          })}
                        </Typography>
                        <IconButton
                          onClick={() => eliminarID(producto.id_producto)}
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            backgroundColor: "#a111ad",
                            color: "white",
                            "&:hover": {
                              backgroundColor: "#e0e0e0",
                              color: "black",
                            },
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Paper>
                    </Grid>
                  );
                }
              })}
            </Grid>

            <Box mt={3}>
              <Typography variant="h6">
                Total:{" "}
                <span style={{ marginLeft: 10, color: "green" }}>
                  {total.toLocaleString("es-ar", {
                    style: "currency",
                    currency: "ARS",
                    maximumFractionDigits: 0,
                  })}
                </span>
              </Typography>
              <Typography variant="body1" color="text.secondary" mt={1}>
                Consumo: {watts} W
              </Typography>

              <Button
                variant="contained"
                onClick={handleAgregarCarrito}
                sx={{
                  mt: 2,
                  backgroundColor: "#FF7D20",
                  borderRadius: "20px",
                  fontSize: "0.875rem",
                }}
              >
                Comprar
              </Button>
            </Box>
          </Box>
        </Box>
        <div className="productos">
          <div className="chupalaIvan">
            <form className="filtrosArmador">
              <select
                className="ordernarPor"
                name="ordernar Por"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
              >
                <option value="ASC">Precio menor a mayor</option>
                <option value="DESC">Precio mayor a menor</option>
              </select>
              {((tipo == "memorias" && elecciones.memorias.length > 0) ||
                (tipo == "almacenamiento" &&
                  elecciones.almacenamiento.length > 0) ||
                (tipo == "coolers" && elecciones.coolers.length > 0)) && (
                <div
                  className="siguiente"
                  onClick={() => {
                    if (tipo == "almacenamiento") {
                      setTipo("fuentes");
                    } else if (tipo == "memorias") {
                      setTipo("almacenamiento");
                    } else if (tipo == "coolers") {
                      setTipo("monitores");
                    }
                  }}
                >
                  {" "}
                  Siguiente{" "}
                </div>
              )}
            </form>
            <br />
          </div>
          <Grid
            container
            spacing={2}
            style={{ marginTop: "10px", justifyContent: "center" }}
          >
            {
              // eslint-disable-next-line no-unused-vars
              productos.productos[`${tipo}`].map((producto, index) => (
                <Grid lg={3.9} key={producto.id_producto}>
                  <Card
                    orientation="horizontal"
                    sx={{ width: "95%", bgcolor: "#ffff", height: 190 }}
                  >
                    <AspectRatio ratio="1" sx={{ width: "45%" }}>
                      <img
                        src={
                          producto.url_imagenes[
                            producto.url_imagenes.length - 1
                          ]
                        }
                        alt={producto.nombre}
                        loading="lazy"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <div className="badge">
                        {producto.nombre_proveedor == "air" ? (
                          <img src="/badges/24HS.png" alt="" />
                        ) : producto.nombre_proveedor == "elit" ? (
                          <img src="/badges/5_DIAS.png" alt="" />
                        ) : (
                          <img src="/badges/LOCAL.png" alt="" />
                        )}{" "}
                      </div>
                    </AspectRatio>
                    <CardContent
                      orientation="horizontal"
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                      }}
                    >
                      <div>
                        <Typography
                          sx={{
                            display: "-webkit-box",
                            overflow: "hidden",
                            WebkitBoxOrient: "vertical",
                            WebkitLineClamp: 2,
                            textOverflow: "ellipsis",
                            fontWeight: "bold",
                          }}
                        >
                          {producto.nombre}
                        </Typography>
                        <Typography>{producto.descripcion}</Typography>
                        <Typography sx={{ fontWeight: "xl", mt: 0.8 }}>
                          {Number(
                            producto.precio_pesos_iva_ajustado
                          ).toLocaleString("es-ar", {
                            style: "currency",
                            currency: "ARS",
                            maximumFractionDigits: 0,
                          })}
                        </Typography>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginLeft: "auto",
                          }}
                        >
                          <Button
                            variant="contained"
                            onClick={() =>
                              handleSeleccionar(producto.id_producto)
                            }
                            size=""
                            sx={{
                              ml: 2,
                              my: 1.5,
                              backgroundColor: "#FF852A",
                              height: 40,
                              borderRadius: "20px",
                              fontSize: "0.75rem",
                              objectFit: "contain",
                            }}
                          >
                            Seleccionar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            }
          </Grid>
        </div>
      </div>
    </div>
  );
}

export default ArmadorPc;
