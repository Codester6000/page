import '../styles/producto.css'
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
export default function Producto() {
    const url = 'https://api.modex.com.ar'
    const { id } = useParams();
    const [producto, setProducto] = useState(null);
    const [disponibilidad, setDisponibilidad] = useState("NO DISPONIBLE");

    const disponible = (producto) =>{
        (producto?.stock == 0) ? setDisponibilidad("NO DISPONIBLE") : (producto?.stock == 1) 
            ? setDisponibilidad("ULTIMA UNIDAD") : setDisponibilidad("DISPONIBLE");
    }
    useEffect(() => {
        const getProducto = async () => {
            try {
                const response = await fetch(`${url}/productos/${id}`);
                const data = await response.json();
                setProducto(data.datos[0]);
                disponible(data.datos[0])
            } catch (error) {
                console.error("Error al obtener el producto:", error);
            }
        };

        getProducto();
    }, [id]);
    return (
        <div className="productoContainer">
            <div className="productPhoto">
                <img src={producto?.url_imagenes[producto.url_imagenes.length -1]} alt="" className="productImage" />
            </div>
            <div className="productInfo">
                <div className="productTitle">{producto?.nombre}</div>
                <div className="productCategory">{producto?.categorias[0]}</div>
                <div className="productStock" style={(disponibilidad=="DISPONIBLE") ? {color:'#5ca845'} : {color:'#ff6a00'}}>
                   <div className="stockTxt">Stock</div> {disponibilidad}</div>
            </div>
                <div className="productPrice">Precio <span>
                    {Number(producto?.precio_pesos_iva_ajustado).toLocaleString('es-ar', {
                        style: 'currency',
                        currency: 'ARS',
                        maximumFractionDigits:0
                    })}
                </span></div>
                <div className="aditionalInfo">{producto?.detalle}</div>
        </div>
    )
}