import React, { useEffect, useState, useRef } from "react";
import '../checkout.css'
import logoModo from '../assets/Logo_modo.svg';
import logoMP from '../assets/mplogo.svg';
import logoGN from '../assets/getnet.png';
import { useAuth } from "../Auth";
import { set, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { formCheckoutSchema } from '../validations/formcheckout'
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'
import {motion} from 'framer-motion'

const urlBack = import.meta.env.VITE_URL_BACK;
const urlFront = 'https://modex.com.ar'

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



const Checkout =  () => {
    const {register,handleSubmit,formState:{errors,isValid},trigger} = useForm({
            resolver:zodResolver(formCheckoutSchema),
            mode:'onChange'
        })
    const formRef = useRef(null);
    const handleHover = async () => {
      await trigger(); // Valida todos los campos al pasar el mouse sobre el botón
    };
    const [metodoPago,setMetodoPago] = useState("transferencia")
    initMercadoPago('APP_USR-868c1d1d-2922-496f-bf87-56b0aafe44a2',{
      locale: 'es-AR',
    });
    const [preferenciaMP, setPreferenciaMP] = useState(null);
    const [productos, setProductos] = useState([])
    const [itemsGN, setItemsGN] = useState([])
    const [idCarrito, setIdCarrito] = useState(0)
    const [total,setTotal] = useState(0)
    const [nombreCompra,setNombreCompra] = useState("")
    const [linkGN, setLinkGN] = useState("")
    const [didMount, setDidMount] = useState(false)
    const [totalMP, setTotalMP] = useState(0)
    const [multiplicador, setMultiplicador] = useState(1)
    const { sesion } = useAuth();
    const onSubmit = async (data) => {
      console.log("entre")
      const res = await fetch(`${urlBack}/usuarios/agregar-info`, {
        method: "POST",
        headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${sesion.token}`
        }
        , body: JSON.stringify(data) });
        console.log(res);
        console.log("eeee")
        const resJson = await res.json();
        console.log(resJson);
        if (!res.ok) {
          console.error("Error al enviar la información:", res.status);
        }
      }
    const getCarrito = async () => {
      try {
          const response = await fetch(
              `${urlBack}/carrito`,
              {
                  method: "GET",
                  headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${sesion.token}`,
                  },
              }
          );

          if (response.ok) {
              const data = await response.json();
              if (data.carrito && Array.isArray(data.carrito)) {
                  setProductos(data.carrito);
                  const total = data.carrito.reduce((sum, producto) => sum + (parseFloat(producto.precio_pesos_iva_ajustado).toFixed(0) * producto.cantidad), 0);
                  setTotal(total);
                  
                  setIdCarrito(data.carrito[0]?.id_carrito)
                  console.log(idCarrito)
                  
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
      setTotalMP(totalRecargo)
      const response = await fetch(`${urlBack}/checkoutMP/crear-preferencia-mercadopago`, {
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
      });
      console.log(response)
      if (response.ok) {
        const data = await response.json();
        const id = data.id
        return id;
      } else {
        console.error("Error al crear la preferencia de Mercado Pago:", response.status);
      }
    } catch (error) {
      console.log(error);
    }
   
  }
  const createLinkGetNet = async () =>{
    if (linkGN !== ""){
      return linkGN;
    }
    let itemsAux = []
    try {
      productos.forEach(producto =>{
        const precioGN = Number(Number(producto.precio_pesos_iva_ajustado)*1.15).toFixed(2).replace('.', '');

        itemsAux.push({
          "id": producto.id_producto,
          "name": producto.nombre,
          "unitPrice": {
            "currency": "032",
            "amount": precioGN
          },
          "quantity": producto.cantidad
        })
      })

      setItemsGN(itemsAux)
      console.log(itemsAux)
      const response = await fetch(`${urlBack}/checkoutGN/intencion-pago`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: itemsAux,
          id_carrito: idCarrito,
        }),
      })

      if (response.ok) {
        const data = await response.json();
        console.log("Link de GetNet recibido:", data.links[0].checkout);
        setLinkGN(data.links[0].checkout)
        return data.links[0].checkout;
      }
      return "";
    }
    catch (error) {
      console.log(error);
    }
  }
  const handleGN = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    window.open(linkGN)
  }
  const handleBuyMP = async () => {
    const id = await createPreferenceMP();
    console.log(id)
    if(id){
      setPreferenciaMP(id);
    }
  };
      useEffect(() => {
          getCarrito();
          setDidMount(true)
      }, []);


      
      const handleExternalSubmit =  () => {
        productos.map((producto) => {
          setNombreCompra(producto.categorias + " "+ producto.cantidad + " "  + nombreCompra)
        })
        if (formRef.current) {
            formRef.current.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
        }
        console.log(nombreCompra)
    };
    const handleLinkLag = async () => {
      if (linkGN !== ""){
        console.log(linkGN)
        return linkGN;
      }
      if (linkGN === ""){
        const linkGN2 = await createLinkGetNet();
        setLinkGN(linkGN2)
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log(linkGN)
        return linkGN;
    }}
    useEffect( () =>{
      if (didMount){
        const handleGN = async () => {
          await new Promise(resolve => setTimeout(resolve, 2000));
          const link = await createLinkGetNet();
          setLinkGN(link)
        }
        handleGN();
      }
    },[productos])
    useEffect(()=>{
      switch (metodoPago) {
        case 'transferencia':
          setMultiplicador(1)
          break;
        case 'mercadoPago':
          setMultiplicador(1.15)
          break;
        case 'getnet':
          setMultiplicador(1.15)
        default:
          break;
      }
    },[metodoPago])

    const deleteCarrito = async (id_producto) => {
      try {
        setLinkGN("");
        const response = await fetch(
          `${urlBack}/carrito`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sesion.token}`,
            }, 
            body: JSON.stringify({ id_producto })
          }
        );
    
        if (response.ok) {
          console.log(`Producto ${id_producto} eliminado del carrito.`);
          
          // Actualiza el carrito y guarda los datos actualizados
          const carritoResponse = await fetch(
            `${urlBack}/carrito`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sesion.token}`,
              },
            }
          );
          
          if (carritoResponse.ok) {
            const data = await carritoResponse.json();
            if (data.carrito && Array.isArray(data.carrito)) {
              // Actualiza el estado con los nuevos datos
              setProductos(data.carrito);
              const total = data.carrito.reduce((sum, producto) => sum + (parseFloat(producto.precio_pesos_iva_ajustado).toFixed(0) * producto.cantidad), 0);
              setTotal(total);
              setIdCarrito(data.carrito.length > 0 ? data.carrito[0]?.id_carrito : 0);
              
              // Después de actualizar los datos, maneja las acciones adicionales según el método de pago
              await new Promise(resolve => setTimeout(resolve, 500)); // Pequeña pausa para asegurar que el estado se haya actualizado
              
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
          <div className="wrapperCheckout">
            <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="formCheckout">
                <div className="tituloYp">
                  <h2 className="tituloC">Informacion</h2>
                  <p>Deja tus datos asi podemos contactarte.</p>
                </div>
                <div className="labelInputC">
                  <label htmlFor="">Email</label>
                  <input type="email" name="email" id="email" {...register("email")} onClick={()=>handleLinkLag()} onTouchStart={()=>handleLinkLag()}/>
                  { errors.email?.message && <p style={{color:"red"}}>{errors.email.message}</p>}
                </div>
                <div className="labelInputC">
                  <label htmlFor="">Nombre</label>
                  <input type="text" name="nombreC" id="nombreC" {...register("nombre")} onClick={()=>handleLinkLag()} onTouchStart={()=>handleLinkLag()}/>
                  { errors.nombre?.message && <p style={{color:"red"}}>{errors.nombre.message}</p>}
                </div>
                <div className="labelInputC">
                  <label htmlFor="">Apellido</label>
                  <input type="text" name="apellidoC" id="apellidoC" {...register("apellido")} onClick={()=>handleLinkLag()} onTouchStart={()=>handleLinkLag()}/>
                  { errors.apellido?.message && <p style={{color:"red"}}>{errors.apellido.message}</p>}
                </div>
                <div className="labelInputC">
                  <label htmlFor="">Direccion</label>
                  <input type="text" name="direccionC" id="direccionC" {...register("direccion")} onClick={()=>handleLinkLag()} onTouchStart={()=>handleLinkLag()} />
                  { errors.direccion?.message && <p style={{color:"red"}}>{errors.direccion.message}</p>}
                </div>
                <div className="labelInputC">
                  <label htmlFor="">Telefono</label>
                  <input type="text" name="telefonoC" id="telefonoC" {...register("telefono")} onClick={()=>handleLinkLag()} onTouchStart={()=>handleLinkLag()} />
                  { errors.telefono?.message && <p style={{color:"red"}}>{errors.telefono.message}</p>}
                </div>
            </form>
          </div>
          <div className="lineaGris"></div>
          <div className="pagoC">
            <div className="wrapperCheckout">
              <div className="tituloYp">
                <h2>Pago</h2>
                <p>Selecciona tu metodo de pago.</p>
              </div>
              <div 
                className={`opcionPago ${metodoPago === "getnet" ? "seleccionada" : ""}`} 
                onClick={() => {
                  setMetodoPago("getnet")
                  createLinkGetNet()
                }}
              >
                GetNet by Santander
                <img src={logoGN} alt="" className="logoGN" />
              </div>
              {/* <div 
                className={`opcionPago ${metodoPago === "modo" ? "seleccionada" : ""}`} 
                onClick={() => setMetodoPago("modo")}
              >
                MODO o App Bancaria
                <img src={logoModo} alt="" className="logoModo" />
              </div> */}
              <div 
                className={`opcionPago ${metodoPago === "mercadoPago" ? "seleccionada" : ""}`} 
                onClick={() => {
                  setMetodoPago("mercadoPago")
                  handleBuyMP();
                }}
              >
                Mercado Pago
                <img src={logoMP} alt="" className="logoMP" />
              </div>
              
              <div 
                className={`opcionPago ${metodoPago === "transferencia" ? "seleccionada" : ""}`} 
                onClick={() => {
                  setMetodoPago("transferencia")
                }}
              >
                Transferencia Bancaria
              </div>
              <div 
                className='opcionPago'
              >
                Otra opcion Proximamente
              </div>
              
            </div>
            <div className="wrapperCheckout">
              <div className="pagaModo">
                <h2>Paga con</h2>
                {metodoPago === "getnet" && <img src={logoGN} alt="" className="logoGN" />}
                {metodoPago === "mercadoPago" && <img src={logoMP} alt="" className="logoMP" />}
                {metodoPago === "modo" && <img src={logoModo} alt="" className="logoModo" />}
                {metodoPago === "transferencia" && <p style={{fontWeight:'bolder'}}>   Transferencia</p>}
              </div>
          
              <div className="cuadroPagoInfo">
                <div className="paso">PASO 1</div>
                {metodoPago === "modo" && <p>Al avanzar con el pago en la tienda <span>Se generara un QR.</span></p>}
                {metodoPago !='modo' && <p>Asegurate de rellenar el <span>Formulario.</span></p>}
                
              </div>
              <div className="cuadroPagoInfo">
              <div className="paso">PASO 2</div>
              {metodoPago === "modo" && <p>En tu celular, <span>abri MODO</span> o la <span>App de tu banco</span> y <span>escanea</span> el QR.</p>}
              
              {(metodoPago == "getnet" || metodoPago =="mercadoPago") && <p><span>Hacé click</span> en el boton para ir al <span>link de pago.</span> </p>}
              {metodoPago == "transferencia" && <p>Consulta el stock a traves del numero <span>3804353826</span>.</p>}
              </div>
              <div className="cuadroPagoInfo">
              <div className="paso">PASO 3</div>
              {metodoPago === "modo" && <p>Selecciona la tarjeta de <span>Debito</span> o  <span>Credito</span> que quieras usar.</p>}
              {(metodoPago == "getnet" || metodoPago == "mercadoPago") && <p><span>Realiza</span> el pago con la tarjeta de tu preferencia.</p>}
              {metodoPago == "transferencia" && <p>Realiza la transferencia por el total al Alias "<span>Modex.mp</span>".</p>}
              
              </div>
              <div className="cuadroPagoInfo">
              <div className="paso">PASO 4</div>
              {metodoPago === "modo" && <p>Elegi la cantidad de <span>cuotas</span> que mas te convenga y <span>confirma tu pago!</span></p>}
              {metodoPago != "modo" && <p>Mandanos por <span>whatsapp</span> el comprobante.</p>}
              
              </div>

              <div className="tarjetas">
                <img src="/tarjetas/visa.png" alt="visaicon" className="tarjetaimg" />
                <img src="/tarjetas/mastercard.png" alt="" className="tarjetaimg" />
                <img src="/tarjetas/amex.png" alt="" className="tarjetaimg" />
                <img src="/tarjetas/naranja.png" alt="" className="tarjetaimg" />
                <img src="/tarjetas/maestro.png" alt="" className="tarjetaimg" />
              </div>
            </div>
          </div>
          
        </div>

        <div className="detalle">
            <h2>Resumen de la compra</h2>

            {productos.map((producto) =>{
              
                return (
                    <div className="bloqueProducto" key={producto.id_producto}>
                        <div className="productoCheckout" >
                            <img src={producto.url_imagenes[producto.url_imagenes.length -1]} alt="" className="productoCheckout" />
                            <div className="infoNyP">
                              <div className="infoProductoCheckout">{producto.nombre}</div>
                              <div className="precioUnitario">{Number(Number(producto.precio_pesos_iva_ajustado)*multiplicador).toLocaleString('es-ar', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits:0
})}</div>
                            </div>
                            <div className="cantidadCheckout"> {producto.cantidad}</div>
                            <div className="deleteCheckout" onClick={()=> deleteCarrito(producto.id_producto)}> <img src="/iconos/basura.png" alt="boton borrar"   /> </div>
                        </div>
                        <div className="lineaGris"></div>
                    </div>
                )
            })}

            <div className="totalCheckout">
              
              <div className="totalC">Total :</div>
              <div className="totalNum">
              {metodoPago =="transferencia" && Number(total).toLocaleString('es-ar', {
                  style: 'currency',
                  currency: 'ARS',
                  maximumFractionDigits:0
              })}
              {metodoPago =="getnet" && Number(Number(total)*1.15).toLocaleString('es-ar', {
                  style: 'currency',
                  currency: 'ARS',
                  maximumFractionDigits:0
              })}

{metodoPago=="mercadoPago" && Number(totalMP).toLocaleString('es-ar', {
                  style: 'currency',
                  currency: 'ARS',
                  maximumFractionDigits:0
              })}
            </div></div>
            <div className="lineaGris"></div>
            <div className="botonPagaModo">
            <div onMouseEnter={handleHover}>
              
              
              {(metodoPago == 'modo') && <button  disabled={!isValid}  onClick={()=>{
                handleExternalSubmit();
                showModal(total,'HOLA',idCarrito,total)
                }}>Pagá con QR
              </button>}

              {(metodoPago == 'getnet') && <button  disabled={!isValid}  onClick={()=>{
                handleExternalSubmit();
                handleGN();
                }}>Link de Pago
              </button>}
              {(metodoPago == 'transferencia') && <button  disabled={!isValid}  onClick={()=>{
                handleExternalSubmit();
                
                }}> <a href="https://api.whatsapp.com/send/?phone=543804353826&amp;text=Hola,+realice+una+compra+via+transferencia+por+la+pagina!&amp;type=phone_number&amp;app_absent=0" target="_blank">Enviar Comprobante </a>
              </button>}
              


              </div>
            </div>

            {preferenciaMP && metodoPago=="mercadoPago" &&
               <motion.div className="mpcontainer" animate={(!isValid) ? {opacity:0, pointerEvents:"none"} : {opacity:1, disabled:false}} onClick={()=>handleExternalSubmit()} >
                 <div id="wallet_container">
                 
                 <Wallet initialization={{ preferenceId: preferenciaMP }} />
                 </div>
               </motion.div>
}
        </div>

    </div>
)
}

export default Checkout;