import React, { useEffect, useState } from "react";
const showModal = async () => {
    try {
      // Crear intención de pago desde el backend
      const response = await fetch('http://192.168.1.8:3000/checkout/intencion-pago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        
      });
      const data = await response.json();

      // Mostrar el modal de MODO con la respuesta obtenida
      const modalObject = {
        qrString: data.qr,
        checkoutId: data.checkoutId,
        deeplink: {
          url: data.deeplink,
          callbackURL: 'https://myshop.com/checkout',
          callbackURLSuccess: 'https://myshop.com/thank-you',
        },
        onSuccess: () => alert('Pago exitoso!'),
        onFailure: () => alert('Pago fallido'),
        onCancel: () => alert('Pago cancelado'),
        refreshData: showModal, // Regenera el QR
      };

      ModoSDK.modoInitPayment(modalObject);
    } catch (error) {
      console.error('Error iniciando el pago:', error);
    }
  };


const Checkout =  () => {
    const [productos, setProductos] = useState(0)
    const [total,setTotal] = useState(0)
    
return (
    
    <div className="containerCheckout">
        
        <form className="formCheckout">
            <label htmlFor=""></label>
            <input type="email" name="" id="" />

            <label htmlFor=""></label>
            <input type="text" />

            <label htmlFor=""></label>
            <input type="text" />

            <label htmlFor=""></label>
            <input type="text" />

            <div className="wrapperFormCheckout">
            <label htmlFor=""></label>
            <input type="text" />
            
            <label htmlFor=""></label>
            <input type="text" />

            <label htmlFor=""></label>
            <input type="text" />

            <label htmlFor=""></label>
            <input type="text" />

            </div>
        </form>

        <div className="detalle">
            <h2>Tu pedido</h2>
            <div className="lineaGris"></div>

            {/* {productos.map((producto) =>{
                return (
                    <div className="bloqueProducto" id={producto.id_producto}>
                        <div className="productoCheckout" >
                            <div className="imgProductoCheckout"></div>
                            <div className="infoProductoCheckout"></div>
                            <div className="cantidadCheckout"></div>
                        </div>
                        <div className="lineaGris"></div>
                    </div>
                )
            })} */}

            <div className="totalCheckout">{total}</div>
            <div className="lineaGris"></div>
            <div className="botonPagaModo">
            <button onClick={showModal}>Pagá con MODO</button>;
            </div>

        </div>
    </div>
)
}

export default Checkout;