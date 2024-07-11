import React, { useEffect, useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // Importar estilos del carrusel
import './styles.css';
import Dolar from './Dolar';

const MyCarousel = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [dolarOficial, setDolarOficial] = useState(null);

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

    // Fetch productos
    fetch("https://clientes.elit.com.ar/v1/api/productos?limit=100", requestOptions)
      .then(response => response.json())
      .then(result => setData(result))
      .catch(error => setError(error));

    // Fetch dolar oficial
    fetch("https://dolarapi.com/v1/dolares")
      .then(response => response.json())
      .then(data => {
        const oficialDollar = data.find(item => item.casa === 'oficial');
        setDolarOficial(oficialDollar);
      })
      .catch(error => console.error('Error fetching dolar oficial data:', error));
  }, []);

  return (
    <div className="carousel-container">
      <h1 className="ofertas-title">MODEX</h1>
      <Dolar />
      
      {error && <div className="tipografico">Error: {error.message}</div>}
      {data ? (
        <Carousel
          showArrows={true}
          infiniteLoop={true}
          showThumbs={false}
          showStatus={false}
          centerMode={true}
          centerSlidePercentage={25}
          
        >
          {data.resultado.map(product => (
            <div key={product.id} className="product-card">
              <img src={product.imagenes[0]} alt={product.nombre} />
              <h2 className="principal">{product.nombre}</h2>
              <p>Precio: ${product.precio} </p>
              {dolarOficial ? (
                <>
                  <p>Precio en pesos: ${parseInt((parseFloat(parseFloat(product.iva)/100+1) * parseFloat(product.precio)) * parseFloat(dolarOficial.venta))}</p>
                  <p>Precio sugerido para la venta: ${parseInt(parseInt((parseFloat(parseFloat(product.iva)/100+1) * parseFloat(product.precio)) * parseFloat(dolarOficial.venta))*1.15)}</p>
                </>
              ) : (
                <p>Cargando precio en pesos...</p>
              )}
              <p>iva: {product.iva}</p>
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

