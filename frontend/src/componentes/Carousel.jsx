import { Swiper, SwiperSlide } from 'swiper/react';
import {  Pagination, Autoplay,} from 'swiper/modules';
import 'swiper/swiper-bundle.css';
import './Carousel.css'
import { useState,useEffect } from 'react';
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
  const [isMobile, setIsMobile] = useState(true);
  useEffect(() => {
    setIsMobile(window.innerWidth < 800);
    const handleResize = () => {
        setIsMobile(window.innerWidth < 800);
      };
  
      window.addEventListener("resize", handleResize);
  
      //cleanup of event listener
      return () => window.removeEventListener("resize", handleResize);
}, []);
  return (
    <Swiper
      className='swiperRR'
      pagination={true}
      modules={[Pagination, Autoplay]}
      spaceBetween={0} 
      slidesPerView={1} 
      loop={true} 
    > 
      {isMobile ? 
      <div>

      <SwiperSlide>
      <img className='imgCR' src="carousel/1-mobile.png" alt="Slide 3" />
      </SwiperSlide>
      <SwiperSlide>
      <img className='imgCR' src="carousel/2-mobile.png" alt="Slide 3" />
      </SwiperSlide>
      <SwiperSlide>
      <img className='imgCR' src="carousel/3-mobile.png" alt="Slide 3" />
      </SwiperSlide>
      <SwiperSlide>
      <img className='imgCR' src="carousel/4-mobile.png" alt="Slide 3" />
      </SwiperSlide>
      <SwiperSlide>
      <img className='imgCR' src="carousel/5-mobile.png" alt="Slide 3" />
      </SwiperSlide>
      <SwiperSlide>
      <img className='imgCR' src="carousel/6-mobile.png" alt="Slide 3" />
      </SwiperSlide>
      <SwiperSlide>
      <img className='imgCR' src="carousel/7-mobile.png" alt="Slide 3" />
      </SwiperSlide>
      <SwiperSlide>
      <img className='imgCR' src="carousel/8-mobile.png" alt="Slide 3" />
      </SwiperSlide>
      <SwiperSlide>
      <img className='imgCR' src="carousel/9-mobile.png" alt="Slide 3" />
      </SwiperSlide>
      <SwiperSlide>
      <img className='imgCR' src="carousel/10-mobile.png" alt="Slide 3" />
      </SwiperSlide>

      </div>
    :
      <div>
      <SwiperSlide>
      <img className='imgCR' src="carousel/1.png" alt="Slide 3" />
      </SwiperSlide>
      <SwiperSlide>
      <img className='imgCR' src="carousel/2.png" alt="Slide 3" />
      </SwiperSlide>
      <SwiperSlide>
      <img className='imgCR' src="carousel/3.png" alt="Slide 3" />
      </SwiperSlide>
      <SwiperSlide>
      <img className='imgCR' src="carousel/4.png" alt="Slide 3" />
      </SwiperSlide>
      <SwiperSlide>
      <img className='imgCR' src="carousel/5.png" alt="Slide 3" />
      </SwiperSlide>
      <SwiperSlide>
      <img className='imgCR' src="carousel/6.png" alt="Slide 3" />
      </SwiperSlide>
      <SwiperSlide>
      <img className='imgCR' src="carousel/7.png" alt="Slide 3" />
      </SwiperSlide>
      <SwiperSlide>
      <img className='imgCR' src="carousel/8.png" alt="Slide 3" />
      </SwiperSlide>

      </div>

    }

    </Swiper>
  );
};


export default Carousel;
