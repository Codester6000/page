import React, { useEffect, useState } from 'react';
import Card from '@mui/joy/Card';
import Container from '@mui/material/Container';
import Grid from '@mui/joy/Grid';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';
import AspectRatio from '@mui/joy/AspectRatio';
import Button from '@mui/material/Button';
import IconButton from '@mui/joy/IconButton';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';

export default function ProductCard() {
    const [productos, setProductos] = useState([]);

    const getProductos = async () => {
        try {
            const response = await fetch('http://localhost:3000/productos', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Datos recibidos:', data);
                if (data.productos && Array.isArray(data.productos)) {
                    setProductos(data.productos.slice(0, 20)); // lIMITADO PORQUE ME EXPLOTA ALA PC, PROXIMAMENTE SE LIMITA DESDE EL BACK, PARA EL PAGINADO
                } else {
                    console.error('Estructura de datos incorrecta:', data);
                }
            } else {
                console.error('Error al obtener productos:', response.status);
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
        }
    };

    useEffect(() => {
        getProductos();
    }, []);

    return (
        <Container>
            <Grid container spacing={5} style={{ marginTop: '20px' }}>
                {productos.length > 0 ? (
                    productos.map((producto, index) => (
                        <Grid item xs={12} sm={4} key={index}>
                            <Card sx={{ width: 300, bgcolor: '#e0e0e0' }}>
                                <AspectRatio minHeight="120px" maxHeight="200px">
                                    <img
                                        src={producto.url_imagenes}
                                        alt={producto.nombre}
                                        loading="lazy"
                                    />
                                </AspectRatio>
                                <CardContent orientation="horizontal">
                                    <div>
                                        <Typography level="h4">{producto.nombre}</Typography>
                                        <Typography>{producto.descripcion}</Typography>
                                        <Typography level="h3" sx={{ fontWeight: 'xl', mt: 0.8 }}>${producto.precio_dolar_iva}
                                        </Typography>
                                        <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
                                            <Button variant="contained" size="large" startIcon={<AddShoppingCartIcon />} sx={{ ml: 2, my: 2, backgroundColor: '#a111ad', height: 45, borderRadius: '20px', fontSize: '0.75rem', objectFit: 'contain',}}>Añadir al Carro</Button>
                                            <IconButton
                                                variant="contained"
                                                size="large"
                                                sx={{ ml: 2, height: 45, width: 45, backgroundColor: '#a111ad', borderRadius: '50px', objectFit: 'contain', color: 'white',
                                                    '&:active': {
                                                        transform: 'scale(0.95)',
                                                        transition: 'transform 0.2s ease',
                                                    },
                                                    '&:hover': {
                                                        backgroundColor: '#9e2590',
                                                    },
                                                }}
                                            >
                                                <FavoriteIcon />
                                            </IconButton>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    <Typography>Proximanete Skeleton</Typography>
                )}
            </Grid>
        </Container>
    );
}
