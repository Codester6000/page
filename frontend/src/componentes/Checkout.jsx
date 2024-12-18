import React, { useEffect, useState } from "react";

const Checkout = async () => {
    const [productos, setProductos] = useState({})
    const [total,setTotal] = useState(0)

return (
    
    <div className="containerCheckout">
        <script src="https://ecommerce-modal.modo.com.ar/bundle.js"></script>
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

            {productos.map((producto) =>{
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
            })}

            <div className="totalCheckout">{total}</div>
            <div className="lineaGris"></div>
            <div className="botonPagaModo"></div>

        </div>
    </div>
)
}

export default Checkout;