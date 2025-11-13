import { useState, useEffect, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/swiper-bundle.css";
// Importación correcta del Auth
import { useAuth, useIsAdmin } from "../Auth";

const Carousel = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 800);
  const [imageUrls, setImageUrls] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  // Ahora usa las funciones reales de autenticación
  const { sesion } = useAuth();
  const isAdmin = useIsAdmin();

  const defaultImages = useMemo(
    () => ({
      mobile: [
        { id: "m1", src: "1-mobile.png", url: "" },
        { id: "m2", src: "3-mobile.png", url: "" },
        { id: "m3", src: "7-mobile.png", url: "" },
        { id: "m4", src: "8-mobile.png", url: "" },
        { id: "m5", src: "10-mobile.png", url: "" },
      ],
      desktop: [
        { id: "d1", src: "6.png", url: "" },
        { id: "d2", src: "7.png", url: "" },
        { id: "d3", src: "8.png", url: "" },
      ],
    }),
    []
  );

  const currentImages = isMobile ? defaultImages.mobile : defaultImages.desktop;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 800);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Limpiar URLs de objetos cuando el componente se desmonte
  useEffect(() => {
    return () => {
      Object.values(imageUrls).forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imageUrls]);

  const uploadImageToServer = async (file, imageId) => {
    const url = import.meta.env.VITE_URL_BACK;
    const formData = new FormData();
    formData.append("image", file);
    formData.append("imageId", imageId);
    formData.append("isMobile", isMobile);

    try {
      const response = await fetch(`${url}/carousel/upload`, {
        method: "POST",
        body: formData,
        // Si tu backend requiere autenticación, agrega el token aquí
        // headers: {
        //   'Authorization': `Bearer ${sesion.token}`
        // }
      });

      if (!response.ok) {
        throw new Error("Error al subir la imagen");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handleFileChange = async (event, imageId) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen es demasiado grande. Máximo 5MB");
      return;
    }

    // Revocar URL anterior si existe
    if (imageUrls[imageId]?.startsWith("blob:")) {
      URL.revokeObjectURL(imageUrls[imageId]);
    }

    // Crear URL temporal con createObjectURL para preview inmediato
    const objectUrl = URL.createObjectURL(file);
    setImageUrls((prev) => ({ ...prev, [imageId]: objectUrl }));

    // Subir al servidor
    setIsUploading(true);
    try {
      await uploadImageToServer(file, imageId);
      alert("Imagen actualizada exitosamente");
    } catch (error) {
      alert("Error al actualizar la imagen. Por favor intenta de nuevo.");
      // Revertir el cambio visual si falla
      setImageUrls((prev) => {
        const newUrls = { ...prev };
        delete newUrls[imageId];
        return newUrls;
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getImageSrc = (image) => {
    return imageUrls[image.id] || `/carousel/${image.src}`;
  };

  return (
    <div className="carousel-container">
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
        {currentImages.map((image) => (
          <SwiperSlide key={image.id} className="carousel-slide">
            {image.url ? (
              <a href={image.url} rel="noopener noreferrer">
                <img
                  className="imgCR"
                  src={getImageSrc(image)}
                  alt={`Slide ${image.id}`}
                  loading="lazy"
                />
              </a>
            ) : (
              <img
                className="imgCR"
                src={getImageSrc(image)}
                alt={`Slide ${image.id}`}
                loading="lazy"
              />
            )}

            {isAdmin && (
              <div className="admin-controls">
                <label
                  htmlFor={`file-${image.id}`}
                  className={`change-btn ${isUploading ? "uploading" : ""}`}
                >
                  {isUploading ? "Subiendo..." : "Cambiar"}
                </label>
                <input
                  id={`file-${image.id}`}
                  type="file"
                  accept="image/*"
                  className="file-input"
                  onChange={(e) => handleFileChange(e, image.id)}
                  disabled={isUploading}
                />
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      <style>{`
        .carousel-container {
          width: 100%;
          max-width: 100%;
        }

        .carousel-slide {
          position: relative;
        }

        .imgCR {
          width: 100%;
          height: auto;
          display: block;
          object-fit: cover;
        }

        .admin-controls {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 10;
        }

        .change-btn {
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: background-color 0.2s;
          display: inline-block;
        }

        .change-btn:hover {
          background-color: rgba(0, 0, 0, 0.85);
        }

        .change-btn.uploading {
          background-color: rgba(161, 17, 173, 0.7);
          cursor: not-allowed;
        }

        .file-input {
          display: none;
        }

        /* Swiper customization */
        .swiperRR {
          width: 100%;
        }

        .swiperRR .swiper-pagination-bullet {
          background: white;
          opacity: 0.5;
        }

        .swiperRR .swiper-pagination-bullet-active {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default Carousel;
