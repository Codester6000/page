import '../styles/portada.css';
import Carousel from './Carousel';
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
export default function Portada(){
    return(
        <div>
            
            <Carousel/>
            <div className="marcas">
                <div className="marca"><img src="/iconos/nvidia.png" alt="" className="margalogo" width={"100%"} /></div>
                <div className="marca"><img src="/iconos/radeon.png" alt="" className="margalogo"  width={"100%"}/></div>
                <div className="marca"><img src="/iconos/intel.png" alt="" className="margalogo" width={"60%"}/></div>
                <div className="marca"><img src="/iconos/amd.png" alt="" className="margalogo" width={"100%"}/></div>
            </div>

            <div className="nuevosIngresos">
                <div className="bloqueNI">
                    <h1>NUEVOS INGRESOS</h1>
                <div className="lineaNaranja"></div>
                </div>
                <div className="productosPortada">
                <Swiper watchSlidesProgress={true} slidesPerView={3} className="mySwiper">
        <SwiperSlide>Slide 1</SwiperSlide>
        <SwiperSlide>Slide 2</SwiperSlide>
        <SwiperSlide>Slide 3</SwiperSlide>
        <SwiperSlide>Slide 4</SwiperSlide>
        <SwiperSlide>Slide 5</SwiperSlide>
        <SwiperSlide>Slide 6</SwiperSlide>
        <SwiperSlide>Slide 7</SwiperSlide>
        <SwiperSlide>Slide 8</SwiperSlide>
        <SwiperSlide>Slide 9</SwiperSlide>
      </Swiper>
                </div>
            </div>
            <div className="armados">
                <h2 className="armadosTitulo">ARMADOS</h2>
                <div className="productosPortada"></div>
            </div>

            <div className="nuevosIngresos">
                <div className="bloqueNI">
                    <h1>NOTEBOOKS</h1>
                <div className="lineaNaranja"></div>
                </div>
                <div className="productosPortada"></div>
            </div>
        </div>
    )
}   
