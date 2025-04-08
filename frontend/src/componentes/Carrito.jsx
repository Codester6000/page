import  { useEffect, useState } from "react";

import Card from "@mui/joy/Card";
import Grid from "@mui/joy/Grid";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import AspectRatio from "@mui/joy/AspectRatio";
import IconButton from "@mui/joy/IconButton";
import Pagination from "@mui/material/Pagination";
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from "../Auth";
import { Button, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Carrito() {
    const url = import.meta.env.VITE_URL_BACK;
    const navigate = useNavigate(); 
    const [productos, setProductos] = useState([]);
    const [pagina, setPagina] = useState(1);
    const itemPorPagina = 30;
    const [totales, setTotales] = useState(0);
    const [isMobile, setIsMobile] = useState(true);

    const { sesion } = useAuth();

    const getCarrito = async () => {
        try {
            const response = await fetch(
                `${url}/carrito`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${sesion.token}`,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setTotales(data.cantidadProductos);
                if (data.carrito && Array.isArray(data.carrito)) {
                    setProductos(data.carrito);
                    const total = data.carrito.reduce((sum, producto) => sum + (parseFloat(producto.precio_pesos_iva_ajustado).toFixed(0) * producto.cantidad), 0);
                    setTotales(total);
                } else {
                    console.error("Estructura de datos incorrecta:", data);
                }
            } else {
                console.error("Error al obtener productos:", response.status);
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
        }
    };
    // a partir de aca todas estas funciones estan incompletas o no probe que funcionen
    const deleteCarrito = async (id_producto) => {
        try {
            const response = await fetch(
                `${url}/carrito`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${sesion.token}`,
                    }, body: JSON.stringify({ id_producto })
                }
            );

            if (response.ok) {
                console.log(`Producto ${id_producto} eliminado del carrito.`)
                getCarrito()
            }
            else {
                console.error("Error al obtener productos:", response.status);
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
        }
    };
    // cantidadProductos tiene que ser 1+ o 1- de la cantidad que tiene cada producto en el carrito 
    const putCarrito = async (id_producto, cantidadProductos) => {
        try {
            const response = await fetch(
                `${url}/carrito`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${sesion.token}`,
                    }, body: JSON.stringify({ id_producto, cantidad: cantidadProductos })
                }
            );

            if (response.ok) {
                console.log(`Cantidad del producto ${id_producto} actualizada a ${cantidadProductos}.`)
                getCarrito()
            } else {
                console.error("Error al actualizar producto:", response.status);
            }
        } catch (error) {
            console.error("Error en la solicitud de actualización:", error);
        }
    };

    useEffect(() => {
        getCarrito();
    }, [pagina]);
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
        <div style={{margin:"0px", padding:"0px", display:"flex", justifyContent:"center", alignItems:"center", width:"100dvw"}}>
            
            <Card sx={{ width:isMobile ? "100dvw" : "80dvw", bgcolor: "#e0e0e0", my: "20px", paddingLeft:isMobile ? 3 : 9}} >
                
            <Typography  level="h1" id="card-description"  sx={{ fontWeight: 'bold' }}> Carrito de {sesion.username}</Typography>
            
            <Typography className="divComprar" textAlign='center' level="h3" sx={{ mt: 3, fontWeight: 'bold', color: 'orange',display:'flex',flexDirection:'column' }}>
                    Total: {totales.toLocaleString('es-ar', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits:0
})}
    <button style={{width:'100px',border:"none", backgroundColor:"#a111ad", padding:"7px",alignSelf:'center', color:"#ffffff",borderRadius:'12px', cursor:"pointer", marginTop:"5px"}} onClick={()=>navigate('/checkout')}>Comprar</button>
                </Typography>
                <Grid container spacing={3} sx={{mt: "10px"}} >
                    {//aca hay que conectar los los botones con sus respectivas funciones eliminar , y un put para el + - 
                    }
                    {productos.length > 0 ? (
                        productos.map((producto, index) => (
                            <Grid key={index} xs={12} > 
                                <Card 
                                    variant="outlined"
                                    orientation={isMobile ? 'vertical' : 'horizontal' }
                                    sx={{
                                        width: "95%",
                                        '&:hover': { boxShadow: 'md', borderColor: 'neutral.outlinedHoverBorder' }
                                    }}
                                >
                                    <AspectRatio ratio="1" sx={{ width: isMobile ? 300 : 150 }}>
                                        <img
                                            src={producto.url_imagenes[producto.url_imagenes.length -1]}
                                            alt={producto.nombre}
                                            loading="lazy"
                                        />
                                         <div className="badge">{(producto.nombre_proveedor == 'air') ? <img src="/badges/24HS.png" alt="" /> : (producto.nombre_proveedor == 'elit') ? <img src="/badges/5_DIAS.png" alt="" /> : <img src="/badges/LOCAL.png" alt="" />} </div>
                                    </AspectRatio>
                                    <CardContent >
                                        <Typography level="h2" id="card-description" sx={{ fontWeight: 'bold' }}>
                                            {producto.nombre}
                                        </Typography>
                                        <Typography level="body-m" aria-describedby="card-description" sx={{ mb: 1 }}>
                                            {producto.categorias[0]},
                                            {producto.categorias[1]}
                                        </Typography>
                                        <Typography level="body-m" aria-describedby="card-description" sx={{ mb: 1 }}>
                                            {producto.codigo_fabricante}
                                        </Typography>
                                        <Typography level="h2" sx={{ fontWeight: "bold", mt: 0.8, color: "#FF7d21" }}>
                                            {Number(producto.precio_pesos_iva_ajustado).toLocaleString('es-ar', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits:0
})}
                                        </Typography>
                                    </CardContent>
                                    
                                        <div style={{ display: "flex", flexDirection: "row" }}>
                                            <Button onClick={() => putCarrito(producto.id_producto, producto.cantidad - 1)} disabled={producto.cantidad <= 1} variant="contained" sx={{ mt: 8, height: 40, width: 20, backgroundColor: "#a111ad", borderRadius: "20px" }}>-</Button>
                                            <TextField sx={{ height: 20, width: 40, mt: 7, ml: 2 }}
                                                value={producto.cantidad}
                                                InputProps={{ readOnly: true }}
                                            />
                                            <Button onClick={() => putCarrito(producto.id_producto, producto.cantidad + 1)} variant="contained" size="large" sx={{ mt: 8, ml: 2, height: 45, width: 45, backgroundColor: "#a111ad", borderRadius: "50px", objectFit: "contain", color: "white" }}>+</Button>
                                            <IconButton onClick={() => deleteCarrito(producto.id_producto)} variant="contained" size="large" sx={{
                                                mt: 8, ml: 2, height: 45, width: 45, backgroundColor: "#a111ad", borderRadius: "50px", objectFit: "contain", color: "white",
                                                "&:active": {
                                                    transform: "scale(0.95)",
                                                    transition: "transform 0.2s ease",
                                                },
                                                "&:hover": {
                                                    backgroundColor: "#9e2590",
                                                },
                                            }}
                                            >
                                                <DeleteIcon></DeleteIcon>
                                            </IconButton>
                                        </div>
                                    
                                  
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginLeft: "auto" }}>
                                            
                                        </div>
                                    
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Typography>No se encontraron productos.</Typography>
                    )}
                </Grid>


                <Pagination count={Math.ceil(productos.length / itemPorPagina)} pagina={pagina} onChange={(e, value) => setPagina(value)} color="primary" sx={{
                    mt: 3, display: "flex", justifyContent: "center",
                    "& .MuiPaginationItem-root": {
                        color: "#a111ad",
                    },
                    "& .Mui-selected": {
                        backgroundColor: "#a111ad",
                        color: "white",
                    },
                    "& .MuiPaginationItem-root:hover": {
                        backgroundColor: "#d17dcf",
                    }
                }} />
            </Card>
        </div>
    );
}