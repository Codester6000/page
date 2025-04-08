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
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay} from 'swiper/modules';
import { motion } from "framer-motion";
export default function Producto() {
    const url = import.meta.env.VITE_URL_BACK;
    const { id } = useParams();
    const [producto, setProducto] = useState(null);
    const [similiraes,setSimilares] = useState([])
    const [disponibilidad, setDisponibilidad] = useState("NO DISPONIBLE");
    const [isMobile, setIsMobile] = useState(true);
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
    const getSimilares = async (categoria)=>{
        try {
            const response = await fetch(`${url}/productos?offset=0&limit=22&categoria=${categoria}`)
            if (response.ok){
                const data = await response.json()
                console.log(data)
                setSimilares(data.productos)
            }
        } catch (error) {
            console.error(error)
        }
    }
    useEffect(() => {
        setIsMobile(window.innerWidth < 800);
        const handleResize = () => {
            setIsMobile(window.innerWidth < 800);
          };
      
          window.addEventListener("resize", handleResize);
      
          //cleanup of event listener
          return () => window.removeEventListener("resize", handleResize);
    }, []);
    
    useEffect(() => {
        const getProducto = async () => {
            try {
                const response = await fetch(`${url}/productos/${id}`);
                const data = await response.json();
                setProducto(data.datos[0]);
                disponible(data.datos[0])
                getSimilares(data.datos[0].categorias[0])
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
                <div className="bloqueNI" style={{marginBottom:"10px"}}>
                    <h1 style={{fontSize:'24px'}}>PRODUCTOS SIMILARES</h1>
                <div className="lineaNaranja">
                <a href={`/productos?categoria=${producto?.categorias[0]}`} style={{backgroundColor:"#f7f7f7"}}>VER TODO</a>
                </div>
                </div>                  
                 <div className="productosPortada">
                <motion.div className="animacion" initial={{ opacity: 0, x: isMobile ? 0 : 800 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease:"linear" }} >
                    <Swiper watchSlidesProgress={true} slidesPerView={isMobile ? 2 : 5} className="mySwiper" loop={true} modules={[Autoplay]} autoplay={{ delay: 2000, disableOnInteraction: true }} style={{width:'100%'}} >
                        {similiraes.map((similar) => (
                            <SwiperSlide style={{zIndex:1}} key={similar.id_producto} >
                                    <div className="productoCarousel">
                                        <div onClick={() => navigate(`/producto/${similar.id_producto}`)} style={{cursor: 'pointer'}}>
                                            <img src={similar.url_imagenes[similar.url_imagenes.length - 1]} alt={similar.nombre} width={"155"} height={"155"} />
                                            <h3>{similar.nombre}</h3>
                                            <p>{Number(similar.precio_pesos_iva_ajustado).toLocaleString('es-ar', {
                                            style: 'currency',
                                            currency: 'ARS',
                                            maximumFractionDigits:0
                                        })}</p>
                                        </div>
                                        <button className="btn-agregar-carrito" onClick={()=>agregarCarrito(similar.id_producto)} style={{zIndex:10}}>COMPRAR</button>
                                    </div>
                            </SwiperSlide>
                        ))}
                          </Swiper>
                </motion.div>
                </div> 
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