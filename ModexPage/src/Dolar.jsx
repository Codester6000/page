import React, { useEffect, useState } from 'react';

export default function Dolar() {
  const [dolarOficial, setDolarOficial] = useState(null);

  useEffect(() => {
    fetch("https://dolarapi.com/v1/dolares")
      .then(response => response.json())
      .then(data => {
        const oficialDollar = data.find(item => item.casa === 'oficial');
        setDolarOficial(oficialDollar);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div className="dolar">
      <h1>Precio del Dólar Oficial</h1>
      {dolarOficial ? (
        <div>
          <p>Compra: ${dolarOficial.compra}</p>
          <p>Venta: ${dolarOficial.venta}</p>
          <p>Última actualización: {new Date(dolarOficial.fechaActualizacion).toLocaleString()}</p>
        </div>
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  );
}



