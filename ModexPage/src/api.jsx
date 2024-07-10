import React, { useEffect, useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // Importar estilos del carrusel
import './styles.css';

const MyCarousel = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      user_id: 23363,
      token: "3f13t8v309t"
    });

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    fetch("https://clientes.elit.com.ar/v1/api/productos?limit=100", requestOptions)
      .then(response => response.json())
      .then(result => setData(result))
      .catch(error => setError(error));
  }, []);

  return (
    <div className="carousel-container">
      <h1 className="ofertas-title">MODEX</h1>
      {error && <div className="tipografico">Error: {error.message}</div>}
      {data ? (
        <Carousel
          showArrows={true}
          infiniteLoop={true}
          showThumbs={false}
          showStatus={false}
          centerMode={true}
          centerSlidePercentage={20}
        >
          {data.resultado.map(product => (
            <div key={product.id} className="product-card">
              <img src={product.imagenes[0]} alt={product.nombre} />
              <h2 className="principal">{product.nombre}</h2>
              <p>Precio: ${product.precio}</p>
              <p>Categoría: {product.categoria}</p>
              <a href={product.url} className="promocional">Ver más</a>
            </div>
          ))}
        </Carousel>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default MyCarousel;

