import '../styles/portada.css';
import Carousel from './Carousel';
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay} from 'swiper/modules';
import "swiper/css";
import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Portada(){
    const url = 'http://192.168.1.8:3000'
    const [notebooks, setNotebooks] = useState([]);
    const [armados, setArmados] = useState([]);
    const [nuevosIngresos, setNuevosIngresos] = useState([]);
    const [isMobile, setIsMobile] = useState(true);
    const navigate = useNavigate();
    const getNotebooks = async () => {
        const response = await fetch(`${url}/productos?offset=0&limit=12&categoria=Notebook`)
        const data = await response.json()
        setNotebooks(data.productos)
    }
    const getNuevosIngresos = async () => {
        const response = await fetch(`${url}/productos?offset=0&limit=12`)
        const data = await response.json()
        setNuevosIngresos(data.productos)
    }
    const getArmados = async () => {
        const response = await fetch(`${url}/productos?offset=0&limit=22&categoria=computadoras`)
        const data = await response.json()
        setArmados(data.productos)
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
        
        getNotebooks()
        getNuevosIngresos()
        getArmados()
    }, [])

    return(
        <div>
            
            <Carousel/>
            <motion.div className="marcas" initial={{ opacity: 0, rotateX: 100 }} whileInView={{ opacity: 1, rotateX: 0 }} transition={{ duration: 0.5 }}>
                
                <div className="marca" onClick={() => navigate('/productos?categoria=nvidia')}><img src="/iconos/nvidia.png" alt="" className="margalogo" width={"100%"} /></div>
                <div className="marca" onClick={() => navigate('/productos?categoria=amdrx')}><img src="/iconos/radeon.png" alt="" className="margalogo"  width={"100%"}/></div>
                <div className="marca" onClick={() => navigate('/productos?categoria=intel')}><img src="/iconos/intel.png" alt="" className="margalogo" width={"60%"}/></div>
                <div className="marca" onClick={() => navigate('/productos?categoria=amd')}><img src="/iconos/amd.png" alt="" className="margalogo" width={"100%"}/></div>
            </motion.div>

            <div className="nuevosIngresos">
                <div className="bloqueNI">
                    <h1>NUEVOS INGRESOS</h1>
                <div className="lineaNaranja"></div>
                </div>
                <div className="productosPortada">
                <motion.div className="animacion" initial={{ opacity: 0, x:isMobile ? 0 : 800 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease:"linear" }}>
                    <Swiper watchSlidesProgress={true} slidesPerView={isMobile ? 2 : 5} className="mySwiper" loop={true} modules={[Autoplay]} autoplay={{ delay: 2000, disableOnInteraction: false }} >
                        {nuevosIngresos.map((nuevoIngreso) => (
                            <SwiperSlide key={nuevoIngreso.id_producto}>
                                <div className="productoCarousel">
                                    <img src={nuevoIngreso.url_imagenes[nuevoIngreso.url_imagenes.length - 1]} alt={nuevoIngreso.nombre} width={"155"} height={"155"} />
                                    <h3>{nuevoIngreso.nombre}</h3>
                                    <p>{Number(nuevoIngreso.precio_pesos_iva_ajustado).toLocaleString('es-ar', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits:0
})}</p>
                                    <button className="btn-agregar-carrito">COMPRAR</button>
                                </div>
                            </SwiperSlide>
                        ))}
                          </Swiper>
                </motion.div>
                </div>
            </div>
            <div className="armados">
                <h2 className="armadosTitulo">ARMADOS</h2>
                <div className="productosPortada">
                <motion.div className="animacion" initial={{ opacity: 0, x: isMobile ? 0 : 800 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease:"linear" }}>
                    <Swiper watchSlidesProgress={true} slidesPerView={isMobile ? 2 : 5} className="mySwiper" loop={true} modules={[Autoplay]} autoplay={{ delay: 2000, disableOnInteraction: true }} >
                        {armados.map((armado) => (
                            <SwiperSlide key={armado.id_producto}>
                                <div className="productoCarousel">
                                    <img src={armado.url_imagenes[armado.url_imagenes.length - 1]} alt={armado.nombre} width={"155"} height={"155"} />
                                    <h3>{armado.nombre}</h3>
                                    <p>{Number(armado.precio_pesos_iva_ajustado).toLocaleString('es-ar', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits:0
})}</p>
                                    <button className="btn-agregar-carrito">COMPRAR</button>
                                </div>
                            </SwiperSlide>
                        ))}
                          </Swiper>
                </motion.div>
                </div>
            </div>

            <div className="nuevosIngresos">
                <div className="bloqueNI">
                    <h1>NOTEBOOKS</h1>
                <div className="lineaNaranja"></div>
                </div>
                <div className="productosPortada">
                <motion.div className="animacion" initial={{ opacity: 0, x: isMobile ? 0 : 800 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease:"linear" }}>
                    <Swiper watchSlidesProgress={true} slidesPerView={isMobile ? 2 : 5} className="mySwiper" loop={true} modules={[Autoplay]} autoplay={{ delay: 2000, disableOnInteraction: true }} >
                        {notebooks.map((notebook) => (
                            <SwiperSlide key={notebook.id_producto}>
                                <div className="productoCarousel">
                                    <img src={notebook.url_imagenes[notebook.url_imagenes.length - 1]} alt={notebook.nombre} width={"155"} height={"155"} />
                                    <h3>{notebook.nombre}</h3>
                                    <p>{Number(notebook.precio_pesos_iva_ajustado).toLocaleString('es-ar', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits:0
})}</p>
                                    <button className="btn-agregar-carrito">COMPRAR</button>
                                </div>
                            </SwiperSlide>
                        ))}
                          </Swiper>
                </motion.div>
                </div>
            </div>
        </div>
    )
}   
