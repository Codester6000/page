import { Swiper, SwiperSlide } from 'swiper/react';
import {  Pagination, Autoplay,} from 'swiper/modules';
import 'swiper/swiper-bundle.css';
import './Carousel.css'
// poner en la terminar
// npm install swiper

// para tener mejor obtimizadas las imagenes del carusel
// deben de ser imagenes en 1600 x350px
// el contenido tiene que estar bien centrado así evitamos
// que se pierda el contenido importante

// tengo que hacer que tome las imagenes de una carpeta especifica
//(probablemente "/public/noticias/" y dejar una cantidad especifica)
// proximamente hacer que no tenga limitacion de cantidad

const Carousel = () => {
  
  return (
    <Swiper
      className='swiperR'
      pagination={true}
      modules={[Pagination, Autoplay]}
      spaceBetween={0} 
      slidesPerView={1} 
      navigation 
      loop={true} 
      autoplay={{ delay : 5000}}
    >
      <SwiperSlide>
        <img className='imgCR' src="/1.png" alt="Slide 1" />
      </SwiperSlide>
      <SwiperSlide>
        <img className='imgCR' src="/2.png" alt="Slide 2" />
      </SwiperSlide>
      <SwiperSlide>
        <img className='imgCR' src="/3.png" alt="Slide 3" />
      </SwiperSlide>
      <SwiperSlide>
        <img className='imgCR' src="/4.png" alt="Slide 4" />
      </SwiperSlide>
      <SwiperSlide>
        <img className='imgCR' src="/5.png" alt="Slide 5" />
      </SwiperSlide>
      <SwiperSlide>
        <img className='imgCR' src="/6.png" alt="Slide 6" />
      </SwiperSlide>
      <SwiperSlide>
        <img className='imgCR' src="/7.png" alt="Slide 7" />
      </SwiperSlide>
      <SwiperSlide>
        <img className='imgCR' src="/8.png" alt="Slide 8" />
      </SwiperSlide>
      <SwiperSlide>
        <img className='imgCR' src="/9.png" alt="Slide 9" />
      </SwiperSlide>
      <SwiperSlide>
        <img className='imgCR' src="/10.png" alt="Slide 10" />
      </SwiperSlide>
    </Swiper>
  );
};


export default Carousel;
