import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/swiper-bundle.css";
import "./Carousel.css";
import { useAuth } from "../Auth"; // importa el hook personalizado

const Carousel = () => {
  const { sesion } = useAuth(); // obtenemos la sesión actual
  const [isMobile, setIsMobile] = useState(window.innerWidth < 800);
  const [images, setImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});

  const mobileImages = [
    { src: "1-mobile.png", url: "" },
    { src: "3-mobile.png", url: "" },
    { src: "7-mobile.png", url: "" },
    { src: "8-mobile.png", url: "" },
    { src: "10-mobile.png", url: "" },
  ];
  const desktopImages = [
    { src: "6.png", url: "" },
    { src: "7.png", url: "" },
    { src: "8.png", url: "" },
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 800);
    };

    window.addEventListener("resize", handleResize);
    setImages(window.innerWidth < 800 ? mobileImages : desktopImages);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleFileChange = (event, index) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const newImages = [...images];
      newImages[index] = { ...newImages[index], src: reader.result };
      setImages(newImages);

      const updatedFiles = { ...selectedFiles, [index]: file };
      setSelectedFiles(updatedFiles);
    };
    reader.readAsDataURL(file);
  };

  const isAdmin = sesion?.rol === 2;

  return (
    <div>
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
        {images.map((image, index) => (
          <SwiperSlide key={index} style={{ position: "relative" }}>
            <a href={image.url || "#"}>
              <img
                className="imgCR"
                src={
                  `/carousel/${image.src}`
                }
                alt={`Slide ${index + 1}`}
              />
            </a>

            {isAdmin && (
              <div style={{ position: "absolute", top: 10, right: 10 }}>
                <label
                  htmlFor={`fileInput-${index}`}
                  style={{
                    backgroundColor: "rgba(0,0,0,0.6)",
                    color: "#fff",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Cambiar
                </label>
                <input
                  id={`fileInput-${index}`}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => handleFileChange(e, index)}
                />
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Carousel;
