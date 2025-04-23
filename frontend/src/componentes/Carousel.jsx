import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/swiper-bundle.css";
import "./Carousel.css";

// Notas:
// - Asegurate de instalar Swiper: `npm install swiper`
// - Imágenes optimizadas: 1600x350px, con contenido centrado
// - Las imágenes deben estar en: /public/carousel/
// - Próximamente: eliminar límite de cantidad de imágenes

const Carousel = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 800);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 800);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Rutas de imágenes según tipo de dispositivo
  const mobileImages = [
    "1-mobile.png",
    "3-mobile.png",
    "7-mobile.png",
    "8-mobile.png",
    "10-mobile.png",
  ];

  const desktopImages = ["6.png", "7.png", "8.png"];

  const images = isMobile ? mobileImages : desktopImages;

  return (
    <Swiper
      className="swiperRR"
      pagination={{ clickable: true }}
      modules={[Pagination, Autoplay]}
      spaceBetween={0}
      slidesPerView={1}
      loop
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
      }}
    >
      {images.map((imageName, index) => (
        <SwiperSlide key={index}>
          <img
            className="imgCR"
            src={`carousel/${imageName}`}
            alt={`Slide ${index + 1}`}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default Carousel;
