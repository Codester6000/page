import React from 'react';
import Card from '@mui/joy/Card';
import Container from '@mui/material/Container'; // Asegúrate de importar Container correctamente.
import Grid from '@mui/joy/Grid';
import CardCover from '@mui/joy/CardCover';
import CardContent from '@mui/joy/CardContent';
import { Typography } from '@mui/material'; // Usa solo un import de Typography, en este caso, de MUI Material.
import Data from './Data.json';
import AspectRatio from '@mui/joy/AspectRatio';
import IconButton from '@mui/joy/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';

export default function ProductCard() {
    return (
        <Container>
            <Grid container spacing={5} style={{ marginTop: "20px" }}>
                {Data.map((resultado, index) => (
                    <Grid item xs={12} sm={4} key={index}>
                        <Card sx={{ width: 300 }}>
                            <AspectRatio minHeight="120px" maxHeight="200px">
                           
                                <img
                                    src={resultado.img}
                                    alt={resultado.nombre}
                                    loading="lazy"
                                />
                            </AspectRatio>
                            <CardContent orientation="horizontal">
                                <div>
                                    <Typography level="title-lg">{resultado.nombre}</Typography>
                                    <Typography level="body-xs">Descripción:</Typography>
                                    <Typography>{resultado.descripcion}</Typography>
                                    <Typography level="body-xs">Precio:</Typography>
                                    <Typography sx={{ fontSize: 'lg', fontWeight: 'lg' }}>${resultado.precio}</Typography>
                                <IconButton sx={{ ml: 'auto', alignSelf: 'center' }}>
                                    <FavoriteIcon />
                                </IconButton>
                                </div>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}
