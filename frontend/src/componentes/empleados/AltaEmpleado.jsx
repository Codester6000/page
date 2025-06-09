import React from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import axios from "axios";
import { useAuth } from "../../Auth"; // Ajustá el path si está en otra carpeta

const validationSchema = Yup.object().shape({
  nombre: Yup.string().required("Nombre requerido"),
  apellido: Yup.string().required("Apellido requerido"),
  email: Yup.string().email("Email inválido").required("Email requerido"),
  direccion: Yup.string().required("Dirección requerida"),
  dni: Yup.number().typeError("Debe ser un número").required("DNI requerido"),
  telefono: Yup.string().required("Teléfono requerido"),
  fecha_ingreso: Yup.date().required("Fecha requerida"),
});

export default function AltaEmpleado() {
  const { sesion } = useAuth();
  const url = import.meta.env.VITE_URL_BACK;

  return (
    <Container
      maxWidth="md"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper elevation={10} sx={{ p: 4, borderRadius: 3, width: "100%" }}>
        <Typography variant="h6" align="center" fontWeight="bold" gutterBottom>
          ALTA DE EMPLEADO
        </Typography>
        <Typography
          variant="body1"
          align="center"
          sx={{ mb: 4, fontWeight: "bold" }}
        >
          PARA DARLE DE ALTA A UN EMPLEADO DEBE RELLENAR EL SIGUIENTE FORMULARIO
        </Typography>

        <Formik
          initialValues={{
            nombre: "",
            apellido: "",
            email: "",
            direccion: "",
            dni: "",
            telefono: "",
            fecha_ingreso: null,
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, { resetForm }) => {
            const confirm = await Swal.fire({
              title: "¿Confirmar alta?",
              text: "¿Deseás guardar este nuevo empleado?",
              icon: "question",
              showCancelButton: true,
              confirmButtonText: "Sí, guardar",
              cancelButtonText: "Cancelar",
            });

            if (!confirm.isConfirmed) return;

            try {
              const payload = {
                ...values,
                fecha_ingreso: values.fecha_ingreso.toISOString().split("T")[0],
              };

              await axios.post(`${url}/empleados`, payload, {
                headers: {
                  Authorization: `Bearer ${sesion?.token}`,
                },
              });

              Swal.fire({
                icon: "success",
                title: "Empleado registrado",
                text: "El empleado fue dado de alta correctamente.",
              });

              resetForm();
            } catch (error) {
              Swal.fire({
                icon: "error",
                title: "Error",
                text:
                  error.response?.data?.error ||
                  "Error al guardar el empleado.",
              });
            }
          }}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            setFieldValue,
          }) => (
            <Form>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nombre"
                    name="nombre"
                    variant="standard"
                    value={values.nombre}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.nombre && Boolean(errors.nombre)}
                    helperText={touched.nombre && errors.nombre}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    variant="standard"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Apellido"
                    name="apellido"
                    variant="standard"
                    value={values.apellido}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.apellido && Boolean(errors.apellido)}
                    helperText={touched.apellido && errors.apellido}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Direccion"
                    name="direccion"
                    variant="standard"
                    value={values.direccion}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.direccion && Boolean(errors.direccion)}
                    helperText={touched.direccion && errors.direccion}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Dni"
                    name="dni"
                    variant="standard"
                    value={values.dni}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.dni && Boolean(errors.dni)}
                    helperText={touched.dni && errors.dni}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Telefono"
                    name="telefono"
                    variant="standard"
                    value={values.telefono}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.telefono && Boolean(errors.telefono)}
                    helperText={touched.telefono && errors.telefono}
                  />
                </Grid>
                <Grid item xs={12}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Ingreso"
                      value={values.fecha_ingreso}
                      onChange={(value) =>
                        setFieldValue("fecha_ingreso", value)
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={
                            touched.fecha_ingreso &&
                            Boolean(errors.fecha_ingreso)
                          }
                          helperText={
                            touched.fecha_ingreso && errors.fecha_ingreso
                          }
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    type="submit"
                  >
                    Guardar Empleado
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Paper>
    </Container>
  );
}
