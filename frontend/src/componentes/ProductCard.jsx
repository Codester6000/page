import React from 'react';
import Card from '@mui/joy/Card';
import Container from '@mui/material/Container';
import Grid from '@mui/joy/Grid';
import CardCover from '@mui/joy/CardCover';
import CardContent from '@mui/joy/CardContent';
// import { Typography } from '@mui/material'; 
import Typography from '@mui/joy/Typography';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import Data from './Data.json';
import AspectRatio from '@mui/joy/AspectRatio';
import IconButton from '@mui/joy/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Button } from '@mui/material';

export default function ProductCard() {
    return (
        <Container>
            <Grid container spacing={5} style={{ marginTop: "20px" }}>
                {Data.map((resultado, index) => (
                    <Grid item xs={12} sm={4} key={index}>
                        <Card sx={{ width: 300, bgcolor: "#e0e0e0" }}>
                            <AspectRatio minHeight="120px" maxHeight="200px">
                                <img
                                    src={resultado.img}
                                    alt={resultado.nombre}
                                    loading="lazy"
                                />
                            </AspectRatio>
                            <CardContent orientation="horizontal">
                                <div >
                                    <Typography level="h4">{resultado.nombre}</Typography>
                                    <Typography  >{resultado.descripcion}</Typography>
                                    <Typography level='h3' sx={{fontWeight: 'xl' ,mt: 0.8 }}>${resultado.precio}</Typography>
                                    <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
                                        <Button variant="contained" size="large" startIcon={<AddShoppingCartIcon></AddShoppingCartIcon>} sx={{ ml: 2, my: 2, backgroundColor: "#a111ad", height: 45, borderRadius: "20px", fontSize: '0.75rem', objectFit: "contain" }}>Añadir al Carro</Button>
                                        <IconButton variant="contained" size="large" sx={{
                                            ml: 2, height: 45, width: 45, backgroundColor: "#a111ad", borderRadius: "50px", objectFit: "contain", color: "white", '&:active': {
                                                transform: 'scale(0.95)', transition: 'transform 0.2s ease'
                                            },
                                            '&:hover': {
                                                backgroundColor: "#9e2590"
                                            },
                                        }}>
                                            <FavoriteIcon />
                                        </IconButton>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}
