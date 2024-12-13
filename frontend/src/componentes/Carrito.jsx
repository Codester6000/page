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
import { Button, Input, TextField } from "@mui/material";

export default function Carrito() {
    const url = 'https://api.modex.com.ar'
    const [productos, setProductos] = useState([]);
    const [pagina, setPagina] = useState(1);
    const itemPorPagina = 30;
    const [totales, setTotales] = useState(0);

    const { sesion } = useAuth();
    const [value, setValue] = useState(0);

    const increment = () => {
        setValue(value + 1);
    };

    const decrement = () => {
        setValue(value - 1);
    };

    const construirQuery = () => {
        let query = `offset=${(pagina - 1) * itemPorPagina}&limit=${itemPorPagina}`;
        return query;
    };

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
    return (
        <Container>

            <Card sx={{ width: "100%", bgcolor: "#e0e0e0", my: "20px", paddingLeft: 10 }}>
                <Typography starIcon level="h1" id="card-description" sx={{ fontWeight: 'bold' }}> Carrito de {sesion.username}</Typography>
                <Grid container spacing={3} style={{ marginTop: "10px" }}>
                    {//aca hay que conectar los los botones con sus respectivas funciones eliminar , y un put para el + - 
                    }
                    {productos.length > 0 ? (
                        productos.map((producto, index) => (
                            <Grid key={index} xs={12}>
                                <Card
                                    variant="outlined"
                                    orientation="horizontal"
                                    sx={{
                                        width: "95%",
                                        '&:hover': { boxShadow: 'md', borderColor: 'neutral.outlinedHoverBorder' }
                                    }}
                                >
                                    <AspectRatio ratio="1" sx={{ width: 150 }}>
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
                                            {producto.categorias}
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
                                    <Grid>
                                        <div style={{ display: "flex", flexDirection: "row" }}>
                                            <Button onClick={() => putCarrito(producto.id_producto, producto.cantidad - 1)} disabled={producto.cantidad <= 1} variant="contained" sx={{ mt: 8, height: 40, width: 20, backgroundColor: "#a111ad", borderRadius: "20px" }}>-</Button>
                                            <TextField sx={{ height: 20, width: 40, mt: 7, ml: 2 }}
                                                value={producto.cantidad}
                                                InputProps={{ readOnly: true }}
                                            />
                                            <Button onClick={() => putCarrito(producto.id_producto, producto.cantidad + 1)} variant="contained" size="large" sx={{ mt: 8, ml: 2, height: 45, width: 45, backgroundColor: "#a111ad", borderRadius: "50px", objectFit: "contain", color: "white" }}>+</Button>
                                        </div>
                                    </Grid>
                                    <Grid>
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginLeft: "auto" }}>
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
                                    </Grid>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Typography>No se encontraron productos.</Typography>
                    )}
                </Grid>

                <Typography level="h3" sx={{ mt: 3, fontWeight: 'bold', textAlign: 'right', color: 'orange' }}>
                    Total: {totales.toLocaleString('es-ar', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits:0
})}
                </Typography>

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
        </Container>
    );
}