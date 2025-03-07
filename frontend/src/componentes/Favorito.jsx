import React, { useEffect, useState } from "react";

import Card from "@mui/joy/Card";
import Container from "@mui/material/Container";
import Grid from "@mui/joy/Grid";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import AspectRatio from "@mui/joy/AspectRatio";
import IconButton from "@mui/joy/IconButton";
import Pagination from "@mui/material/Pagination";
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from "../Auth";

export default function Favorito() {
    const url = 'https://api.modex.com.ar'
    const [productos, setProductos] = useState([]);
    const [pagina, setPagina] = useState(1);
    const itemPorPagina = 30;
    const [totales, setTotales] = useState(0);
    const [isMobile, setIsMobile] = useState(true);
    

    const { sesion } = useAuth();

    const construirQuery = () => {
        let query = `offset=${(pagina - 1) * itemPorPagina}&limit=${itemPorPagina}`;
        return query;
    };

    const getFavorito = async () => {
        try {
            const response = await fetch(
                `${url}/favorito`,
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
                // console.log(data)
                setTotales(data.cantidadProductos);
                if (data.favoritos && Array.isArray(data.favoritos)) {
                    setProductos(data.favoritos);
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
    const deleteFavorito = async (id_producto) => {
        try {
            const response = await fetch(
                `${url}/favorito`,
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
                getFavorito()
            }
            else {
                console.error("Error al obtener productos:", response.status);
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
        }
    };

    useEffect(() => {
        getFavorito();
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

            <Card sx={{ width:isMobile ? "100dvw" : "80dvw", bgcolor: "#e0e0e0", my: "20px", paddingLeft:isMobile ? 3 : 9}}>
                <Typography level="h1" id="card-description" sx={{ fontWeight: 'bold' }}> Favoritos de {sesion.username}</Typography>
                <Grid container spacing={3} style={{ marginTop: "10px" }}>
                    {productos.length > 0 ? (
                        productos.map((producto, index) => (
                            <Grid item key={index} xs={12}>
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
                                    <CardContent>
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
                                            ${parseFloat(producto.precio_pesos_iva_ajustado).toFixed(0)}
                                        </Typography>
                                    </CardContent>
                                    <Grid>
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginLeft: "auto" }}>
                                            <IconButton variant="contained" size="large" sx={{mt: 8, ml: 2, height: 45, width: 45, backgroundColor: "#a111ad", borderRadius: "50px", objectFit: "contain", color: "white",
                                                "&:active": {
                                                    transform: "scale(0.95)",
                                                    transition: "transform 0.2s ease",
                                                },
                                                "&:hover": {
                                                    backgroundColor: "#9e2590",
                                                },
                                            }}
                                            onClick={() => deleteFavorito(producto.id_producto)}
                                            >
                                                <DeleteIcon></DeleteIcon>
                                            </IconButton>
                                        </div>
                                    </Grid>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Typography>No se encontraron productos.</Typography>
                    )}
                </Grid>

                <Pagination count={Math.ceil(totales / itemPorPagina)} pagina={pagina} onChange={(e, value) => setPagina(value)} color="primary" sx={{
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