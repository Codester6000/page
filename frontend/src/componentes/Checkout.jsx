import React, { useEffect, useState, useRef } from "react";
import "../checkout.css";
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  Divider,
  ListItemIcon,
  Radio,
  ListItemText,
  ListItemButton,
  Avatar,
  List,
  Stack,
  Button,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import logoModo from "../assets/Logo_modo.svg";
import logoMP from "../assets/mplogo.svg";
import logoGN from "../assets/getnet.png";
import { useAuth } from "../Auth";
import { set, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formCheckoutSchema } from "../validations/formcheckout";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import { motion } from "framer-motion";
import FormularioArchivo from "./ComprobanteFormulario";

const urlBack = import.meta.env.VITE_URL_BACK;
const urlFront = "https://modex.com.ar";

// async function createPaymentIntention(total,nombre_producto,id_carrito,total_a_pagar){
//   const res = await fetch(`${urlBack}/checkout/intencion-pago`, {
//           method: 'POST',
//           headers: {
//               'Content-Type': 'application/json'
//           },
//           body: JSON.stringify({price:total,productName:nombre_producto,id_carrito:id_carrito,total:total_a_pagar})

//       }
//   );
//   const jsonRes = await res.json();
//   console.log(jsonRes)
//   return {
//     checkoutId: jsonRes.data.id,
//     qrString: jsonRes.data.qr,
//     deeplink: jsonRes.data.deeplink,
//   };
// }
// async function showModal(total,nombre_producto,id_carrito,total_a_pagar) {
//   const modalData = await createPaymentIntention(total,nombre_producto,id_carrito,total_a_pagar);
//   var modalObject = {
//       qrString: modalData.qrString,
//       checkoutId: modalData.checkoutId,
//       deeplink:  {
//           url: modalData.deeplink,
//           callbackURL: `${urlFront}/checkout`,
//           callbackURLSuccess: `${urlFront}/thank-you`
//       },
//       callbackURL: `${urlFront}/thank-you`,
//       refreshData: createPaymentIntention,
//       onSuccess: async function () {
//         const res = await fetch(`${urlBack}/checkout/modo/exito/${modalData.checkoutId}`, {
//           method: 'GET',
//           headers: {
//               'Content-Type': 'application/json'
//           },

//       }
//   );
//   const jsonRes = await res.json();
//   console.log(jsonRes)
//       },
//       onFailure: function () { console.log('onFailure') },
//       onCancel: function () { console.log('onCancel') },
//       onClose: async function () {  const res = await fetch(`${urlBack}/checkout/modo/exito/${modalData.checkoutId}`, {
//         method: 'GET',
//         headers: {
//             'Content-Type': 'application/json'
//         },

//     }
// );
// const jsonRes = await res.json();
// console.log(jsonRes) },
//   }
//   ModoSDK.modoInitPayment(modalObject);
// }

const Checkout = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    trigger,
  } = useForm({
    resolver: zodResolver(formCheckoutSchema),
    mode: "onChange",
  });
  const formRef = useRef(null);
  const handleHover = async () => {
    await trigger(); // Valida todos los campos al pasar el mouse sobre el botón
  };
  const [metodoPago, setMetodoPago] = useState("transferencia");
  initMercadoPago("APP_USR-868c1d1d-2922-496f-bf87-56b0aafe44a2", {
    locale: "es-AR",
  });
  const [preferenciaMP, setPreferenciaMP] = useState(null);
  const [productos, setProductos] = useState([]);
  const [itemsGN, setItemsGN] = useState([]);
  const [idCarrito, setIdCarrito] = useState(0);
  const [total, setTotal] = useState(0);
  const [nombreCompra, setNombreCompra] = useState("");
  const [linkGN, setLinkGN] = useState("");
  const [didMount, setDidMount] = useState(false);
  const [totalMP, setTotalMP] = useState(0);
  const [multiplicador, setMultiplicador] = useState(1);
  const [isArchivoModalOpen, setIsArchivoModalOpen] = useState(false);
  const { sesion } = useAuth();



 const onSubmit = async (data) => {
    console.log("Form data submitted:", data);
    try {
      const res = await fetch(`${urlBack}/usuarios/agregar-info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sesion.token}`,
        },
        body: JSON.stringify(data),
      });
      
      const resJson = await res.json();
      
      if (!res.ok) {
        console.error("Error al enviar la información:", res.status);
        return false; // Indicate failure
      }
      
      console.log("Información enviada correctamente:", resJson);
      return true; // Indicate success
    } catch (error) {
      console.error("Error en la solicitud:", error);
      return false; // Indicate failure
    }
  };

  const getCarrito = async () => {
    try {
      const response = await fetch(`${urlBack}/carrito`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sesion.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.carrito && Array.isArray(data.carrito)) {
          setProductos(data.carrito);
          const total = data.carrito.reduce(
            (sum, producto) =>
              sum +
              parseFloat(producto.precio_pesos_iva_ajustado).toFixed(0) *
                producto.cantidad,
            0
          );
          setTotal(total);

          setIdCarrito(data.carrito[0]?.id_carrito);
          console.log(idCarrito);
        } else {
          console.error("Estructura de datos incorrecta:", data);
        }
      } else {
        console.error("Error al obtener productos:", response.status);
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  };

  const createPreferenceMP = async () => {
    try {
      const totalRecargo = Number(Number(total) * 1.15).toFixed(0);
      setTotalMP(totalRecargo);
      const response = await fetch(
        `${urlBack}/checkoutMP/crear-preferencia-mercadopago`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: `Insumos Informaticos Modex, ${idCarrito}`,
            quantity: 1,
            price: totalRecargo,
            id_carrito: idCarrito,
          }),
        }
      );
      console.log(response);
      if (response.ok) {
        const data = await response.json();
        const id = data.id;
        return id;
      } else {
        console.error(
          "Error al crear la preferencia de Mercado Pago:",
          response.status
        );
      }
    } catch (error) {
      console.log(error);
    }
  };
  const createLinkGetNet = async () => {
    if (linkGN !== "") {
      return linkGN;
    }
    let itemsAux = [];
    try {
      productos.forEach((producto) => {
        const precioGN = Number(
          Number(producto.precio_pesos_iva_ajustado) * 1.15
        )
          .toFixed(2)
          .replace(".", "");

        itemsAux.push({
          id: producto.id_producto,
          name: producto.nombre,
          unitPrice: {
            currency: "032",
            amount: precioGN,
          },
          quantity: producto.cantidad,
        });
      });

      setItemsGN(itemsAux);
      console.log(itemsAux);
      const response = await fetch(`${urlBack}/checkoutGN/intencion-pago`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: itemsAux,
          id_carrito: idCarrito,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Link de GetNet recibido:", data.links[0].checkout);
        setLinkGN(data.links[0].checkout);
        return data.links[0].checkout;
      }
      return "";
    } catch (error) {
      console.log(error);
    }
  };

  const handleTransferencia = handleSubmit(async (data) => {
  const success = await onSubmit(data);
  if (success) {
    setIsArchivoModalOpen(true);
  }
});
const handleGetnet = handleSubmit(async (data) => {
  const success = await onSubmit(data);
  if (success) {
    handleGN();
  }
});

const handlemp = handleSubmit(async (data) => {
  const success = await onSubmit(data);
  if (success) {
    console.log('exito')
  }
});

  const handleGN = async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    window.open(linkGN);
  };
  const handleBuyMP = async () => {
    const id = await createPreferenceMP();
    console.log(id);
    if (id) {
      setPreferenciaMP(id);
    }
  };
  useEffect(() => {
    getCarrito();
    setDidMount(true);
  }, []);

  const handleExternalSubmit = () => {
    // productos.map((producto) => {
    //   setNombreCompra(
    //     producto.categorias + " " + producto.cantidad + " " + nombreCompra
    //   );
    // });
    if (formRef.current) {
      formRef.current.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true })
      );
    }
    // console.log(nombreCompra);
  };
  const handleLinkLag = async () => {
    if (linkGN !== "") {
      console.log(linkGN);
      return linkGN;
    }
    if (linkGN === "") {
      const linkGN2 = await createLinkGetNet();
      setLinkGN(linkGN2);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log(linkGN);
      return linkGN;
    }
  };
  useEffect(() => {
    if (didMount) {
      const handleGN = async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const link = await createLinkGetNet();
        setLinkGN(link);
      };
      handleGN();
    }
  }, [productos]);
  useEffect(() => {
    switch (metodoPago) {
      case "transferencia":
        setMultiplicador(1);
        break;
      case "mercadoPago":
        setMultiplicador(1.15);
        break;
      case "getnet":
        setMultiplicador(1.15);
      default:
        break;
    }
  }, [metodoPago]);

  const deleteCarrito = async (id_producto) => {
    try {
      setLinkGN("");
      const response = await fetch(`${urlBack}/carrito`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sesion.token}`,
        },
        body: JSON.stringify({ id_producto }),
      });

      if (response.ok) {
        console.log(`Producto ${id_producto} eliminado del carrito.`);

        // Actualiza el carrito y guarda los datos actualizados
        const carritoResponse = await fetch(`${urlBack}/carrito`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sesion.token}`,
          },
        });

        if (carritoResponse.ok) {
          const data = await carritoResponse.json();
          if (data.carrito && Array.isArray(data.carrito)) {
            // Actualiza el estado con los nuevos datos
            setProductos(data.carrito);
            const total = data.carrito.reduce(
              (sum, producto) =>
                sum +
                parseFloat(producto.precio_pesos_iva_ajustado).toFixed(0) *
                  producto.cantidad,
              0
            );
            setTotal(total);
            setIdCarrito(
              data.carrito.length > 0 ? data.carrito[0]?.id_carrito : 0
            );

            // Después de actualizar los datos, maneja las acciones adicionales según el método de pago
            await new Promise((resolve) => setTimeout(resolve, 500)); // Pequeña pausa para asegurar que el estado se haya actualizado

            if (metodoPago === "mercadoPago") {
              const newMP = await createPreferenceMP();
              if (newMP) {
                setPreferenciaMP(newMP);
              }
            } else if (metodoPago === "getnet") {
              const newLinkGN = await createLinkGetNet();
              setLinkGN(newLinkGN);
            }
          } else {
            console.error("Estructura de datos incorrecta:", data);
          }
        } else {
          console.error("Error al obtener productos:", carritoResponse.status);
        }
      } else {
        console.error("Error al eliminar producto:", response.status);
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  };

  
  return (
    <div className="containerCheckout">
      <div className="parteIzq">
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Información de contacto
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Deja tus datos así podemos contactarte.
          </Typography>

          <Box component="form" ref={formRef} noValidate autoComplete="off" onSubmit={handleExternalSubmit(onSubmit)} >
            <TextField
              label="Email"
              fullWidth
              margin="normal"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
              onClick={handleLinkLag}
              onTouchStart={handleLinkLag}
            />
            <TextField
              label="Nombre"
              fullWidth
              margin="normal"
              {...register("nombre")}
              error={!!errors.nombre}
              helperText={errors.nombre?.message}
              onClick={handleLinkLag}
              onTouchStart={handleLinkLag}
            />
            <TextField
              label="Apellido"
              fullWidth
              margin="normal"
              {...register("apellido")}
              error={!!errors.apellido}
              helperText={errors.apellido?.message}
              onClick={handleLinkLag}
              onTouchStart={handleLinkLag}
            />
            <TextField
              label="Dirección"
              fullWidth
              margin="normal"
              {...register("direccion")}
              error={!!errors.direccion}
              helperText={errors.direccion?.message}
              onClick={handleLinkLag}
              onTouchStart={handleLinkLag}
            />
            <TextField
              label="Teléfono"
              fullWidth
              margin="normal"
              {...register("telefono")}
              error={!!errors.telefono}
              helperText={errors.telefono?.message}
              onClick={handleLinkLag}
              onTouchStart={handleLinkLag}
            />
          </Box>

          <Divider sx={{ my: 2 }} />
        </Paper>
        <div className="pagoC">
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Pago
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Selecciona tu método de pago.
            </Typography>

            <List sx={{ mt: 2 }}>
              <ListItemButton
                selected={metodoPago === "getnet"}
                onClick={() => {
                  setMetodoPago("getnet");
                  createLinkGetNet();
                }}
              >
                <ListItemIcon>
                  <Radio checked={metodoPago === "getnet"} />
                </ListItemIcon>
                <ListItemText primary="GetNet by Santander" />
              </ListItemButton>

              <ListItemButton
                selected={metodoPago === "mercadoPago"}
                onClick={() => {
                  setMetodoPago("mercadoPago");
                  handleBuyMP();
                }}
              >
                <ListItemIcon>
                  <Radio checked={metodoPago === "mercadoPago"} />
                </ListItemIcon>
                <ListItemText primary="Mercado Pago" />
              </ListItemButton>

              <ListItemButton
                selected={metodoPago === "transferencia"}
                onClick={() => {
                  setMetodoPago("transferencia");
                }}
              >
                <ListItemIcon>
                  <Radio checked={metodoPago === "transferencia"} />
                </ListItemIcon>
                <ListItemText primary="Transferencia Bancaria" />
              </ListItemButton>

              <Divider sx={{ my: 1 }} />

              <ListItemButton disabled>
                <ListItemText primary="Otra opción próximamente" />
              </ListItemButton>
            </List>
          </Paper>
          <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Paga con
            </Typography>

            <Box sx={{ my: 2 }}>
              {metodoPago === "getnet" && (
                <Avatar
                  src={logoGN}
                  alt="GetNet"
                  sx={{ width: 64, height: 64 }}
                />
              )}
              {metodoPago === "mercadoPago" && (
                <Avatar
                  src={logoMP}
                  alt="MercadoPago"
                  sx={{ width: 64, height: 64 }}
                />
              )}
              {metodoPago === "modo" && (
                <Avatar
                  src={logoModo}
                  alt="Modo"
                  sx={{ width: 64, height: 64 }}
                />
              )}
              {metodoPago === "transferencia" && (
                <Typography variant="subtitle1" fontWeight="bold">
                  Transferencia
                </Typography>
              )}
            </Box>

            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  PASO 1
                </Typography>
                {metodoPago === "modo" ? (
                  <Typography>
                    Al avanzar con el pago en la tienda{" "}
                    <strong>se generará un QR</strong>.
                  </Typography>
                ) : (
                  <Typography>
                    Asegurate de rellenar el <strong>formulario</strong>.
                  </Typography>
                )}
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  PASO 2
                </Typography>
                {metodoPago === "modo" ? (
                  <Typography>
                    En tu celular, <strong>abrí MODO</strong> o la{" "}
                    <strong>app de tu banco</strong> y{" "}
                    <strong>escaneá el QR</strong>.
                  </Typography>
                ) : metodoPago === "transferencia" ? (
                  <Typography>
                    Consultá el stock a través del número{" "}
                    <strong>3804353826</strong>.
                  </Typography>
                ) : (
                  <Typography>
                    <strong>Hacé click</strong> en el botón para ir al{" "}
                    <strong>link de pago</strong>.
                  </Typography>
                )}
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  PASO 3
                </Typography>
                {metodoPago === "modo" ? (
                  <Typography>
                    Seleccioná la tarjeta de <strong>Débito</strong> o{" "}
                    <strong>Crédito</strong> que quieras usar.
                  </Typography>
                ) : metodoPago === "transferencia" ? (
                  <Typography>
                    Realizá la transferencia por el total al alias{" "}
                    <strong>Modex.mp</strong>.
                  </Typography>
                ) : (
                  <Typography>
                    <strong>Realizá</strong> el pago con la tarjeta de tu
                    preferencia.
                  </Typography>
                )}
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  PASO 4
                </Typography>
                {metodoPago === "modo" ? (
                  <Typography>
                    Elegí la cantidad de <strong>cuotas</strong> que más te
                    convenga y <strong>confirmá tu pago</strong>.
                  </Typography>
                ) : (
                  <Typography>
                    Mandanos por <strong>WhatsApp</strong> el comprobante.
                  </Typography>
                )}
              </Box>
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
              {[
                "visa.png",
                "mastercard.png",
                "amex.png",
                "naranja.png",
                "maestro.png",
              ].map((img) => (
                <Avatar
                  key={img}
                  variant="rounded"
                  src={`/tarjetas/${img}`}
                  sx={{ width: 56, height: 36 }}
                />
              ))}
            </Box>
          </Paper>
        </div>
      </div>

      <Paper elevation={4} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Resumen de la compra
        </Typography>

        {productos.map((producto) => (
          <Box key={producto.id_producto} sx={{ mb: 2 }}>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
            >
              <Avatar
                src={producto.url_imagenes[producto.url_imagenes.length - 1]}
                variant="rounded"
                sx={{ width: 64, height: 64 }}
              />
              <Box flex={1}>
                <Typography fontWeight={600}>{producto.nombre}</Typography>
                <Typography color="text.secondary" variant="body2">
                  Cantidad: {producto.cantidad}
                </Typography>
                <Typography variant="body1" color="primary">
                  {Number(
                    producto.precio_pesos_iva_ajustado * multiplicador
                  ).toLocaleString("es-ar", {
                    style: "currency",
                    currency: "ARS",
                    maximumFractionDigits: 0,
                  })}
                </Typography>
              </Box>
              <IconButton onClick={() => deleteCarrito(producto.id_producto)}>
                <DeleteIcon />
              </IconButton>
            </Stack>
            <Divider sx={{ my: 1 }} />
          </Box>
        ))}

        <Box display="flex" justifyContent="space-between" mt={2}>
          <Typography variant="h6">Total:</Typography>
          <Typography variant="h6" color="primary">
            {metodoPago === "transferencia" &&
              Number(total).toLocaleString("es-ar", {
                style: "currency",
                currency: "ARS",
                maximumFractionDigits: 0,
              })}
            {metodoPago === "getnet" &&
              Number(Number(total) * 1.15).toLocaleString("es-ar", {
                style: "currency",
                currency: "ARS",
                maximumFractionDigits: 0,
              })}
            {metodoPago === "mercadoPago" &&
              Number(totalMP).toLocaleString("es-ar", {
                style: "currency",
                currency: "ARS",
                maximumFractionDigits: 0,
              })}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box textAlign="center" mt={3}>
          {metodoPago === "modo" && (
            <Button
              variant="contained"
              color="secondary"
              disabled={!isValid}
              onClick={() => {
                handleExternalSubmit();
                showModal(total, "HOLA", idCarrito, total);
              }}
              startIcon={<ShoppingCartCheckoutIcon />}
            >
              Pagá con QR
            </Button>
          )}

          {metodoPago === "getnet" && (
            <Button
              variant="contained"
              color="success"
              disabled={!isValid}
              onClick={handleGetnet}
              startIcon={<ShoppingCartCheckoutIcon />}
            >
              Link de Pago
            </Button>
          )}

          {metodoPago === "transferencia" && (
            <Button
              variant="contained"
              color="primary"
              disabled={!isValid}
              onClick={handleTransferencia}
            >
              Enviar Comprobante
            </Button>
          )}
        </Box>

        {preferenciaMP && metodoPago === "mercadoPago" && (
          <motion.div
            className="mpcontainer"
            animate={
              !isValid
                ? { opacity: 0, pointerEvents: "none" }
                : { opacity: 1, disabled: false }
            }
            onClick={handleSubmit(onSubmit)}
          >
            <Box mt={3}>
              <div id="wallet_container">
                <Wallet initialization={{ preferenceId: preferenciaMP }} />
              </div>
            </Box>
          </motion.div>
        )}
      </Paper>
      <FormularioArchivo 
      isModalOpen={isArchivoModalOpen} 
      setIsModalOpen={setIsArchivoModalOpen}
    />
    </div>
  );
};

export default Checkout;
