import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Grid,
  Container,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const faqs = [
  {
    pregunta: "¿Cómo realizo una compra?",
    respuesta:
      "Para comprar, selecciona los productos y sigue los pasos en el checkout.",
  },
  {
    pregunta: "¿Cuáles son los métodos de pago?",
    respuesta:
      "Aceptamos tarjetas de crédito, débito, transferencia bancaria y MercadoPago.",
  },
  {
    pregunta: "¿Hacen envíos a todo el país?",
    respuesta:
      "Sí, realizamos envíos a todo el territorio nacional con seguimiento.",
  },
  {
    pregunta: "¿Cuál es el tiempo estimado de entrega?",
    respuesta:
      "El tiempo estimado es de 3 a 7 días hábiles según tu ubicación.",
  },
  {
    pregunta: "¿Como funciona la garantia de los productos nuevos?",
    respuesta:
      "Los productos nuevos tienen una garantia de tiempo estimado por el fabricante.",
  },
];

export default function PreguntasFrecuentes() {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Preguntas Frecuentes
      </Typography>

      <Grid container spacing={3}>
        {faqs.map((faq, index) => (
          <Grid item xs={12} sm={6} md={6} key={index}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {faq.pregunta}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{faq.respuesta}</Typography>
              </AccordionDetails>
            </Accordion>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
