import '../styles/producto.css'
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import logoModo from '../assets/Logo_modo.svg';
import logoMP from '../assets/mplogo.svg';
import escudo from '/iconos/escudo.png'
import deli from '/iconos/deli.png'
import local from '/iconos/local.png'
import { useAuth } from "../Auth";
import { useNavigate } from "react-router-dom";
import { Snackbar, Alert } from '@mui/material';
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
export default function Producto() {
    const url = 'https://api.modex.com.ar'
    const { id } = useParams();
    const [producto, setProducto] = useState(null);
    const [disponibilidad, setDisponibilidad] = useState("NO DISPONIBLE");

    const [alerta, setAlerta] = useState(false)
    const { sesion, logout } = useAuth();
    const navigate = useNavigate();
    const disponible = (producto) =>{
        (producto?.stock == 0) ? setDisponibilidad("NO DISPONIBLE") : (producto?.stock == 1) 
            ? setDisponibilidad("ULTIMA UNIDAD") : setDisponibilidad("DISPONIBLE");
    }
    const agregarCarrito = async (producto_id) => {
        setAlerta(true)
        try {
            const response = await fetch(
                `${url}/carrito`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${sesion.token}`,
                    },
                    body: JSON.stringify({ "id_producto": producto_id,"cantidad":1 })
                }
            );
            if (response.ok) {
                const mensaje = await response.json()
                console.log(mensaje)

            } else {
                console.log(response)
                console.log(producto_id)
            }
        } catch (error) {
            logout(navigate("/login"))
            console.log(error)
        }
    };
    
    useEffect(() => {
        const getProducto = async () => {
            try {
                const response = await fetch(`${url}/productos/${id}`);
                const data = await response.json();
                setProducto(data.datos[0]);
                disponible(data.datos[0])
            } catch (error) {
                console.error("Error al obtener el producto:", error);
            }
        };

        getProducto();
    }, [id]);
    return (
        <div className="productoContainer">
            <div className="responsiveDiv">
                <div className="productPhoto">
                    <img src={producto?.url_imagenes[producto.url_imagenes.length -1]} alt="" className="productImage" />
                </div>
            <div className="responsiveDiv2">
                
                    <div className="productInfo">
                        <div className="productTitle">{producto?.nombre}</div>
                        <div className="productCategory">{producto?.categorias[0]}</div>
                        <div className="productStock" style={(disponibilidad=="DISPONIBLE") ? {color:'#5ca845'} : {color:'#ff6a00'}}>
                           <div className="stockTxt">Stock</div> {disponibilidad}</div>
                    </div>
                        <div className="productPayment">
                
                            <div className="productPrice">
                                Precio <span>
                                {Number(producto?.precio_pesos_iva_ajustado).toLocaleString('es-ar', {
                                    style: 'currency',
                                    currency: 'ARS',
                                    maximumFractionDigits:0
                                })}
                                                </span>
                                <button className="btn-agregar-carrito add-cart" onClick={()=>agregarCarrito(producto.id_producto)}>Agregar al carrito</button>
                            </div>
                            <div className="warranty"> <img src={escudo} width='25px' alt="escudo garantia" />Garantía - {producto?.garantia_meses} meses</div>
                            <div className="warranty"> <img src={deli} width='25px' alt="escudo garantia" />Envios a La Rioja y alrededores</div>
                            <div className="warranty"> <img src={local} width='25px' alt="escudo garantia" />Retiro en el local</div>
                            <div className="grayLine"></div>
                            <div className="paymentOptions">
                                <p>Medios de pago</p>
                                <div className="tarjetas">
                                    <img src={logoMP} alt="mercado pago" className="tarjetaimg" />
                                    <img src={logoModo} alt="MODO" className="tarjetaimg" />
                                    <img src="/tarjetas/visa.png" alt="visaicon" className="tarjetaimg" />
                                    <img src="/tarjetas/mastercard.png" alt="mastercard" className="tarjetaimg" />
                                    <img src="/tarjetas/amex.png" alt="amex" className="tarjetaimg" />
                                    <img src="/tarjetas/naranja.png" alt="naranja" className="tarjetaimg" />
                                    <img src="/tarjetas/maestro.png" alt="maestro" className="tarjetaimg" />
                                </div>
                            </div>
                
            </div>
                    </div>
            </div>
                <div className="aditionalInfo">{producto?.detalle}</div>
                <Snackbar
                        open={alerta}
                        autoHideDuration={2000}
                        onClose={() => setAlerta(false)}
                        variant="solid"
                    >
                    <Alert size="large" severity="success" icon={<AddShoppingCartIcon sx={{fontSize: "2rem", color:"white"}}/>}
                    sx={{
                        backgroundColor: "#a111ad", color: "white", fontSize: "1rem", padding: "12px", display: "flex", alignItems: "center", borderRadius: 3
                    }}>
                        El producto fué Añadido al Carrito
                    </Alert>
                </Snackbar>
        </div>
    )
}