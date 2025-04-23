import React, {useState} from 'react';
import '../styles/desarrollo.css';
import { motion } from "framer-motion"
import html5 from '../images/svgs/html5.svg'
import css3 from '../images/svgs/css3.svg'
import js from '../images/svgs/javascript.svg'
import mysql from '../images/svgs/mysql.svg'
import nodejs from '../images/svgs/nodejs.svg'
import python from '../images/svgs/python.svg'
import reactSvg from '../images/svgs/react.svg'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { Box, Grid, Paper, Typography } from '@mui/material';
const DesarrolloWeb = () => {
    const [proyectos, setProyectos] = useState({1:false,2:false,3:false,4:false,5:false}) 
    const variantes ={
        'esconder':{
            opacity:0,
            y: 100
        },
        'mostrar':{
            opacity:1,
            y:0
        },
        'esconderIconos':{
            opacity:0,
            
        },
        'mostrarIconos':{
            opacity:1,
        }
    }
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true },[Autoplay()])
    return (
        <>
        <Box sx={{ flexGrow: 1, p: { xs: 2, md: 6, }, mb:'100vh' }}>
            <Grid container spacing={4} alignItems="center">
            
            {/* Imagen */}
            <Grid item xs={12} md={6}>
                <Box
                component="img"
                src="https://kinsta.com/wp-content/uploads/2021/11/about-us-page-1024x512.png"
                alt="Nuestro equipo"
                sx={{
                    width: '100%',
                    borderRadius: 2,
                    boxShadow: 3,
                }}
                />
            </Grid>
    
            {/* Contenido */}
            <Grid item xs={12} md={6}>
                <Typography variant="h4" component="h2" gutterBottom>
                Sobre Nosotros
                </Typography>
                <Typography variant="body1" paragraph>
                Somos un equipo apasionado por la innovación y el crecimiento. Nuestra misión es brindar soluciones creativas que marquen la diferencia.
                </Typography>
    
                {/* Destacados */}
                <Grid container spacing={2}>
                {[
                    { icon: '🌟', label: 'Experiencia' },
                    { icon: '🤝', label: 'Compromiso' },
                    { icon: '🚀', label: 'Innovación' },
                    { icon: '💡', label: 'Creatividad' }
                ].map((item, index) => (
                    <Grid item xs={6} key={index}>
                    <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h5" component="div">
                        {item.icon}
                        </Typography>
                        <Typography variant="subtitle1">{item.label}</Typography>
                    </Paper>
                    </Grid>
                ))}
                </Grid>
            </Grid>
    
            </Grid>
        </Box>
    </>
    );
};

export default DesarrolloWeb;