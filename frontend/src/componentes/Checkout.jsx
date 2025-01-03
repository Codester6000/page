import React, { useEffect, useState, useRef } from "react";
import '../checkout.css'
import logoModo from '../assets/Logo_modo.svg';
import { useAuth } from "../Auth";
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { formCheckoutSchema } from '../validations/formcheckout'

const url = "http://192.168.1.8:3000"

async function createPaymentIntention(total,nombre_producto,id_carrito,total_a_pagar){
  const res = await fetch(`${url}/checkout/intencion-pago`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({price:total,productName:nombre_producto,id_carrito:id_carrito,total:total_a_pagar})

      }  
  );    
  const jsonRes = await res.json();
  console.log(jsonRes)
  return {
    checkoutId: jsonRes.data.id,
    qrString: jsonRes.data.qr,
    deeplink: jsonRes.data.deeplink,
  };
}
async function showModal(total,nombre_producto,id_carrito,total_a_pagar) {
  const modalData = await createPaymentIntention(total,nombre_producto,id_carrito,total_a_pagar);
  var modalObject = {
      qrString: modalData.qrString,
      checkoutId: modalData.checkoutId,
      deeplink:  {
          url: modalData.deeplink,
          callbackURL: `${url}/checkout`,
          callbackURLSuccess: `${url}/thank-you`
      },
      callbackURL: `${url}/thank-you`,
      refreshData: createPaymentIntention,
      onSuccess: async function () { 
        const res = await fetch(`${url}/checkout/modo/exito/${modalData.checkoutId}`, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json'
          },

      }  
  );    
  const jsonRes = await res.json();
  console.log(jsonRes)
      },
      onFailure: function () { console.log('onFailure') },
      onCancel: function () { console.log('onCancel') },
      onClose: async function () {  const res = await fetch(`${url}/checkout/modo/exito/${modalData.checkoutId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },

    }  
);    
const jsonRes = await res.json();
console.log(jsonRes) },
  }
  ModoSDK.modoInitPayment(modalObject);
}



const Checkout =  () => {

    const {register,handleSubmit,formState:{errors,isValid},trigger} = useForm({
            resolver:zodResolver(formCheckoutSchema),
            mode:'onChange'
        })
    const formRef = useRef(null);
    const handleHover = async () => {
      await trigger(); // Valida todos los campos al pasar el mouse sobre el botón
    };

    const [productos, setProductos] = useState([])
    const [idCarrito, setIdCarrito] = useState(0)
    const [total,setTotal] = useState(0)
    const { sesion } = useAuth();
    const onSubmit = async (data) => {
      console.log("entre")
      const res = await fetch(`${url}/usuarios/agregar-info`, {
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
              `${url}/carrito`,
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
      useEffect(() => {
          getCarrito();
      }, []);
    
      const handleExternalSubmit =  () => {
        if (formRef.current) {
            formRef.current.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
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
                  <input type="email" name="email" id="email" {...register("email")}/>
                  { errors.email?.message && <p style={{color:"red"}}>{errors.email.message}</p>}
                </div>
                <div className="labelInputC">
                  <label htmlFor="">Nombre</label>
                  <input type="text" name="nombreC" id="nombreC" {...register("nombre")}/>
                  { errors.nombre?.message && <p style={{color:"red"}}>{errors.nombre.message}</p>}
                </div>
                <div className="labelInputC">
                  <label htmlFor="">Apellido</label>
                  <input type="text" name="apellidoC" id="apellidoC" {...register("apellido")} />
                  { errors.apellido?.message && <p style={{color:"red"}}>{errors.apellido.message}</p>}
                </div>
                <div className="labelInputC">
                  <label htmlFor="">Direccion</label>
                  <input type="text" name="direccionC" id="direccionC" {...register("direccion")} />
                  { errors.direccion?.message && <p style={{color:"red"}}>{errors.direccion.message}</p>}
                </div>
                <div className="labelInputC">
                  <label htmlFor="">Telefono</label>
                  <input type="text" name="telefonoC" id="telefonoC" {...register("telefono")} />
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
              <div className="opcionPago seleccionada">
                MODO o App Bancaria
                <img src={logoModo} alt="" className="logoModo" />
              </div>
              <div className="opcionPago">
                Otra opcion Proximamente
              </div>
            </div>
            <div className="wrapperCheckout">
              <div className="pagaModo">
                <h2>Paga con</h2>
                <img src={logoModo} alt="" className="logoModo" />
              </div>
          
              <div className="cuadroPagoInfo">
                <div className="paso">PASO 1</div>
                <p>Al avanzar con el pago en la tienda <span>Se generara un QR.</span></p>
              </div>
              <div className="cuadroPagoInfo">
              <div className="paso">PASO 2</div>
              <p>En tu celular, <span>abri MODO</span> o la <span>App de tu banco</span> y <span>escanea</span> el QR.</p>
              </div>
              <div className="cuadroPagoInfo">
              <div className="paso">PASO 3</div>
              <p>Selecciona la tarjeda de <span>Debito</span> o  <span>Credito</span> que quieras usar.</p>
              </div>
              <div className="cuadroPagoInfo">
              <div className="paso">PASO 4</div>
              <p>Elegi la cantidad de <span>cuotas</span> que mas te convenga y <span>confirma tu pago!</span></p>
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
                              <div className="precioUnitario">{Number(producto.precio_pesos_iva_ajustado).toLocaleString('es-ar', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits:0
})}</div>
                            </div>
                            <div className="cantidadCheckout"> {producto.cantidad}</div>
                        </div>
                        <div className="lineaGris"></div>
                    </div>
                )
            })}

            <div className="totalCheckout">
              
              <div className="totalC">Total :</div>
              <div className="totalNum">
              {Number(total).toLocaleString('es-ar', {
                  style: 'currency',
                  currency: 'ARS',
                  maximumFractionDigits:0
              })}
            </div></div>
            <div className="lineaGris"></div>
            <div className="botonPagaModo">
            <div onMouseEnter={handleHover}><button  disabled={!isValid}  onClick={()=>{
              handleExternalSubmit();
              showModal(total,'HOLA',idCarrito,total)
              
              }}>Pagá con QR</button></div>
            </div>

        </div>
    </div>
)
}

export default Checkout;