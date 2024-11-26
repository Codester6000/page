import React, { useEffect, useState } from "react";

import Card from "@mui/joy/Card";
import Container from "@mui/material/Container";
import Grid from "@mui/joy/Grid";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import AspectRatio from "@mui/joy/AspectRatio";
import Button from "@mui/material/Button";
import IconButton from "@mui/joy/IconButton";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import FavoriteIcon from "@mui/icons-material/Favorite";
import Pagination from "@mui/material/Pagination";
import { Chip, TextField } from "@mui/material";

import { useAuth } from "../Auth";

export default function ProductCard() {
    const [productos, setProductos] = useState([]);
    const [pagina, setPagina] = useState(1);
    const itemPorPagina = 30;
    const [totales, setTotales] = useState(0);
    const [nombre, setNombre] = useState("");
    const [categoria, setCategoria] = useState("");
    const [precioMax, setPrecioMax] = useState("");
    const [precioMin, setPrecioMin] = useState("");
    const { sesion } = useAuth();


    const construirQuery = () => {
        let query = `offset=${(pagina - 1) * itemPorPagina}&limit=${itemPorPagina}`;
        if (precioMin) query += `&precio_lt=${precioMin}`;
        if (precioMax) query += `&precio_gt=${precioMax}`;
        if (categoria) query += `&categoria=${categoria}`;
        if (nombre) query += `&nombre=${nombre}`;
        return query;
    };

    const getProductos = async () => {
        try {
            const query = construirQuery();
            const response = await fetch(
                `http://localhost:3000/productos?${query}`,
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
                if (data.productos && Array.isArray(data.productos)) {
                    setProductos(data.productos);
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

    useEffect(() => {
        getProductos();
    }, [pagina]);
    return (
        <Container>
            <Card sx={{ width: "100%", bgcolor: "#e0e0e0", my: "40px" }}>

                {/* <Typography level="h3">Filtrar por: </Typography>
            <br />
            <TextField label="Buscar por Nombre" name="nombre" variant="outlined" size="small" value={nombre} onChange={(e) => setNombre(e.target.value)} style={{ marginRight: "10px" }} />
            <TextField label="Buscar por Categoria" name="categoria" variant="outlined" size="small" value={categoria} onChange={(e) => setCategoria(e.target.value)}  style={{ marginRight: "10px" }} />
            <TextField label="Minimo Precio" name="precioMin" variant="outlined" size="small" value={precioMax} onChange={(e) => setPrecioMax(e.target.value)}  style={{ marginRight: "10px" }} />
            <TextField label="Maximo Precio" name="precioMax" variant="outlined" size="small" value={precioMin} onChange={(e) => setPrecioMin(e.target.value)}  style={{ marginRight: "10px" }} />
            <Button variant="contained" sx={{backgroundColor: "#a111ad"}} onClick={() => {setPagina(1); getProductos();}}>
                    Aplicar Filtros
                </Button> */}
                <Grid container spacing={2} style={{ marginTop: "10px" }}>
                    {productos.length > 0 ? (
                        productos.map((producto, index) => (
                            <Grid item key={index} xs={12}>
                                <Card
                                    variant="outlined"
                                    orientation="horizontal"
                                    sx={{
                                        width: "90%",
                                        '&:hover': { boxShadow: 'md', borderColor: 'neutral.outlinedHoverBorder' }
                                    }}
                                >
                                    <AspectRatio ratio="1" sx={{ width: 150 }}>
                                        <img
                                            src={producto.url_imagenes}
                                            alt={producto.nombre}
                                            loading="lazy"
                                        />
                                    </AspectRatio>
                                    <CardContent>
                                        <Typography level="h2" id="card-description" sx={{ fontWeight: 'bold' }}>
                                            {producto.nombre}
                                        </Typography>
                                        <Typography level="body-sm" aria-describedby="card-description" sx={{ mb: 1 }}>
                                            {producto.descripcion}
                                        </Typography>
                                        <Typography level="h2" sx={{ fontWeight: "bold", mt: 0.8 }}>
                                            ${producto.precio_pesos_iva}
                                        </Typography>
                                    </CardContent>
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
        </Container>
    );
}