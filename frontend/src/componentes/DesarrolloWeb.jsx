import React, {useState} from 'react';
import '../styles/desarrollo.css';
import { motion } from "framer-motion"
import html5 from '../images/svgs/html5.svg'
import css3 from '../images/svgs/css3.svg'
import js from '../images/svgs/javascript.svg'
import mysql from '../images/svgs/mysql.svg'
import nodejs from '../images/svgs/nodejs.svg'
import python from '../images/svgs/python.svg'
import reactSvg from '../images/svgs/react.svg'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
const DesarrolloWeb = () => {
    const [proyectos, setProyectos] = useState({1:false,2:false,3:false,4:false,5:false}) 
    const variantes ={
        'esconder':{
            opacity:0,
            y: 100
        },
        'mostrar':{
            opacity:1,
            y:0
        },
        'esconderIconos':{
            opacity:0,
            
        },
        'mostrarIconos':{
            opacity:1,
        }
    }
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true },[Autoplay()])
    return (
        <div className="containerDesarrolloWeb">
            <div className="infoDesarrollo">
                <h2 className='saludoDesarrollo'>HOLA, SOMOS MODEX WEB</h2>
                <h1 className='tituloDesarrollo'>Hacemos paginas y software a medida.</h1>
                <p>Tenemos un desarrollador <span>Full-Stack</span>  y un diseñador <span>UX/UI</span>.</p>
            </div>

                <h2>Paginas Web</h2>
            <div className="proyectosWeb">
                    <a target='_blank' href="https://obemasa.com.ar">
                <div className="cardProyecto" onTouchStart={()=>setProyectos({...proyectos,1:true})} onTouchEnd={()=>setProyectos({...proyectos,1:false})} onMouseEnter={()=>setProyectos({...proyectos,1:true})} onMouseLeave={()=>setProyectos({...proyectos,1:false})} id='obema'>
                        <h4 >OBEMA S.A</h4>
                        <motion.p variants={variantes} initial='esconder' animate={(proyectos[1]) ? 'mostrar': 'esconder'} >Landing page para la constructora OBEMA S.A, animaciones personalizadas.</motion.p>
                    <motion.div variants={variantes} initial='mostrar' animate={(proyectos[1]) ? 'esconderIconos': 'mostrarIconos'}  className="tecnologias">
                    <img src={reactSvg} alt=""  />
                        <img src={html5} alt="" />
                        <img src={css3} alt="" />
                        <img src={js} alt="" />

                    </motion.div>
                </div>
                    </a>
                <a href="">
                <div className="cardProyecto"  onTouchStart={()=>setProyectos({...proyectos,2:true})} onTouchEnd={()=>setProyectos({...proyectos,2:false})}  onMouseEnter={()=>setProyectos({...proyectos,2:true})} onMouseLeave={()=>setProyectos({...proyectos,2:false})} id='estancia38'>
                        <h4>MENU ESTANCIA 38</h4>
                        <motion.p variants={variantes} initial='esconder' animate={(proyectos[2]) ? 'mostrar': 'esconder'}>Menu que se accede mediante un QR del restaurante Estancia 38</motion.p>
                        <div className="tecnologias">
                        <motion.div variants={variantes} initial='mostrar' animate={(proyectos[2]) ? 'esconderIconos': 'mostrarIconos'}  className="tecnologias">
                        <img src={html5} alt="" />
                        <img src={css3} alt="" />
                        <img src={js} alt="" />

                    </motion.div>
                        </div>
                </div>
                    </a>
                    <a href="">
                <div className="cardProyecto"  onTouchStart={()=>setProyectos({...proyectos,3:true})} onTouchEnd={()=>setProyectos({...proyectos,3:false})}  onMouseEnter={()=>setProyectos({...proyectos,3:true})} onMouseLeave={()=>setProyectos({...proyectos,3:false})} id='modex'>
                        <h4>MODEX E-COMMERCE</h4>
                        <motion.p variants={variantes} initial='esconder' animate={(proyectos[3]) ? 'mostrar': 'esconder'}>Tienda Online, con pagos usando MODO, un armador de pc personalizado.</motion.p>
                        <div className="tecnologias">
                        <motion.div variants={variantes} initial='mostrar' animate={(proyectos[3]) ? 'esconderIconos': 'mostrarIconos'}  className="tecnologias">
                        <img src={reactSvg} alt=""  />
                        <img src={js} alt="" />
                        <img src={html5} alt="" />
                        <img src={css3} alt="" />
                        <img src={nodejs} alt="" />
                        <img src={mysql} alt="" />

                    </motion.div>
                        </div>
                </div>
                    </a>
            </div>

                <h2>Software a medida</h2>
            <div className="software">
                    <a href=""  onTouchStart={()=>setProyectos({...proyectos,4:true})} onTouchEnd={()=>setProyectos({...proyectos,4:false})}  onMouseEnter={()=>setProyectos({...proyectos,4:true})} onMouseLeave={()=>setProyectos({...proyectos,4:false})}>
                <div className="cardProyecto" id='pdv'  >
                    <div className="carousel__viewport" ref={emblaRef} >
                        <div className="carousel__container">
                            <div className="carousel__slide"><img src="/images/pdv1.png" /></div>
                            <div className="carousel__slide"><img src="/images/pdv2.png" /></div>
                            <div className="carousel__slide"><img src="/images/pdv3.png" /></div>
                        </div>
                    </div>

                    <h4>PUNTO DE VENTA</h4>
                    <motion.p variants={variantes} initial='esconder' animate={(proyectos[4]) ? 'mostrar': 'esconder'}>Punto de venta con gestion de inventario para negocios fisicos</motion.p>
                        <div className="tecnologias">
                        <motion.div variants={variantes} initial='mostrar' animate={(proyectos[4]) ? 'esconderIconos': 'mostrarIconos'}  className="tecnologias">
                        <img src={python} alt="" />


                    </motion.div>
                        </div>
                </div>

                    </a>
                    <a href="">
                <div className="cardProyecto" onTouchStart={()=>setProyectos({...proyectos,5:true})} onTouchEnd={()=>setProyectos({...proyectos,5:false})}   onMouseEnter={()=>setProyectos({...proyectos,5:true})} onMouseLeave={()=>setProyectos({...proyectos,5:false})} id='vales'>
                <h4>GENERADOR PDFs</h4>
                <motion.p variants={variantes} initial='esconder' animate={(proyectos[5]) ? 'mostrar': 'esconder'}>Menu interactivo para generar vales con codigo de barras para la empresa Y.P.F</motion.p>
                        <div className="tecnologias">
                        <motion.div variants={variantes} initial='mostrar' animate={(proyectos[5]) ? 'esconderIconos': 'mostrarIconos'}  className="tecnologias">
                        <img src={python} alt="" />


                    </motion.div>
                        </div>
                </div>
                    </a>
            </div>
        </div>
    );
};

export default DesarrolloWeb;