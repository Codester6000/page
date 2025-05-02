import React from "react";
import { Box, Grid, Typography, Paper, Divider } from "@mui/material";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import HandshakeIcon from "@mui/icons-material/Handshake";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import CodeIcon from "@mui/icons-material/Code";
import MemoryIcon from "@mui/icons-material/Memory";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import PublicIcon from "@mui/icons-material/Public";
import { motion } from "framer-motion";

const valores = [
  {
    icono: <WorkspacePremiumIcon color="primary" sx={{ fontSize: 40 }} />,
    titulo: "Experiencia",
  },
  {
    icono: <HandshakeIcon color="secondary" sx={{ fontSize: 40 }} />,
    titulo: "Compromiso",
  },
  {
    icono: <RocketLaunchIcon sx={{ fontSize: 40, color: "#f50057" }} />,
    titulo: "Innovación",
  },
  {
    icono: <EmojiObjectsIcon sx={{ fontSize: 40, color: "#ff9800" }} />,
    titulo: "Creatividad",
  },
];

const secciones = [
  {
    icono: <CodeIcon color="info" sx={{ fontSize: 40 }} />,
    titulo: "Consultoría de Software",
    texto:
      "Desarrollamos soluciones personalizadas que se ajustan a tus necesidades. Desde sistemas de gestión hasta apps modernas y eficientes.",
  },
  {
    icono: <MemoryIcon sx={{ fontSize: 40, color: "#8e24aa" }} />,
    titulo: "Venta de Componentes",
    texto:
      "Ofrecemos hardware de última generación con stock real y asesoramiento técnico especializado para que armes la PC ideal.",
  },
  {
    icono: <BusinessCenterIcon sx={{ fontSize: 40, color: "#4caf50" }} />,
    titulo: "Atención Profesional",
    texto:
      "Nuestro equipo está comprometido a brindar una atención cercana y profesional. Somos técnicos, diseñadores y desarrolladores apasionados.",
  },
  {
    icono: <PublicIcon sx={{ fontSize: 40, color: "#00bcd4" }} />,
    titulo: "Origen Local",
    texto:
      "Somos una empresa riojana. Apoyamos el talento local y buscamos posicionar a La Rioja como polo de tecnología e innovación.",
  },
];

const DesarrolloWeb = () => {
  return (
    <Box sx={{ flexGrow: 1, px: { xs: 2, md: 6 }, py: 8 }}>
      <Grid container spacing={4} alignItems="center">
        {/* Imagen y presentación */}
        <Grid item xs={12} md={6}>
          <motion.img
            src="https://kinsta.com/wp-content/uploads/2021/11/about-us-page-1024x512.png"
            alt="Nuestro equipo"
            style={{ width: "100%", borderRadius: 16 }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Sobre Nosotros
          </Typography>
          <Typography variant="body1" paragraph>
            Somos una empresa de La Rioja, Argentina, con dos pilares
            principales:
            <strong> consultoría de software a medida</strong> y una
            <strong> tienda de componentes para PC</strong>.
          </Typography>
          <Grid container spacing={2} mt={2}>
            {valores.map((valor, index) => (
              <Grid item xs={6} key={index}>
                <Paper
                  elevation={3}
                  sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}
                >
                  {valor.icono}
                  <Typography>{valor.titulo}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      <Divider sx={{ my: 6 }} />

      {/* Secciones adicionales */}
      <Grid container spacing={4} mt={4}>
        {secciones.map((seccion, i) => (
          <Grid item xs={12} md={6} key={i}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
            >
              <Paper elevation={4} sx={{ p: 4, height: "100%" }}>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  {seccion.icono}
                  <Typography variant="h6" fontWeight="bold">
                    {seccion.titulo}
                  </Typography>
                </Box>
                <Typography variant="body2">{seccion.texto}</Typography>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Typography
        variant="h6"
        align="center"
        mt={6}
        fontStyle="italic"
        color="text.secondary"
      >
        Conectamos tecnología, pasión y cercanía para crear valor real.
      </Typography>
    </Box>
  );
};

export default DesarrolloWeb;
