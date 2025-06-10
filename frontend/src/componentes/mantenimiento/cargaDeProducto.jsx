// Componente para el formulario de carga de productos en mantenimiento
import {
  Button,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
  MenuItem,
} from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import axios from "axios";
import { useState, useEffect } from "react";
import { useAuth } from "../../Auth";




const validacionSchema = Yup.object({
  nombre_producto: Yup.string().required("Requerido"),
  responsable_de_retiro: Yup.string().required("Requerido"),
  telefono: Yup.string().required("Requerido"),
  direccion_propietario: Yup.string().required("Requerido"),
  mail: Yup.string().email("Email inválido").required("Requerido"),
  empleado_asignado: Yup.number().required("Seleccione un empleado"),
  descripcion_producto: Yup.string(),
  observaciones: Yup.string(),
});


const FormularioMantenimiento = () => {
  const {sesion} = useAuth();
  const url = import.meta.env.VITE_URL_BACK;


//Funcion para traerme los empleados de la base de datos

const [empleados, setEmpleados] = useState([]);
useEffect(() => {
  const fetchEmpleados = async () => {
    try {
      const res = await axios.get(`${url}/empleados`);
      setEmpleados(res.data.empleados || []);
    } catch (error) {
      console.log("Error al obtener empleados:", error);
    }
  };


  fetchEmpleados();

},[url]);

  return (
    <Container maxWidth="md" sx={{ mt: 6,mb:10 }}>
      <Paper elevation={10} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight="bold" align="center" gutterBottom>
          Ingreso de Mantenimiento
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 4 }}>
          Complete el formulario para registrar un nuevo producto en mantenimiento
        </Typography>

        <Formik
          initialValues={{
            nombre_producto: "",
            responsable_de_retiro: "",
            telefono: "",
            direccion_propietario: "",
            mail: "",
            empleado_asignado: "",
            descripcion_producto: "",
            observaciones: "",
          }}
          validationSchema={validacionSchema}
          onSubmit={async (values, { resetForm }) => {
            try {

              const res = await axios.post(`${url}/mantenimiento`, values, {
                headers: {
                  Authorization: `Bearer ${sesion?.token}`,
                },
              });
              console.log("")

              Swal.fire({
                title: "Éxito",
                text: res.data.message,
                icon: "success",
              });

              resetForm();
            } catch (error) {
              Swal.fire({
                title: "Error",
                text: error.response?.data?.error || "Error al guardar",
                icon: "error",
              });
            }
          }}
        >
          {({ values, handleChange, touched, errors }) => (
            <Form>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombre del Producto"
                    name="nombre_producto"
                    value={values.nombre_producto}
                    onChange={handleChange}
                    error={touched.nombre_producto && Boolean(errors.nombre_producto)}
                    helperText={touched.nombre_producto && errors.nombre_producto}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Responsable de retiro"
                    name="responsable_de_retiro"
                    value={values.responsable_de_retiro}
                    onChange={handleChange}
                    error={touched.responsable_de_retiro && Boolean(errors.responsable_de_retiro)}
                    helperText={touched.responsable_de_retiro && errors.responsable_de_retiro}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    name="telefono"
                    value={values.telefono}
                    onChange={handleChange}
                    error={touched.telefono && Boolean(errors.telefono)}
                    helperText={touched.telefono && errors.telefono}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Dirección del Propietario"
                    name="direccion_propietario"
                    value={values.direccion_propietario}
                    onChange={handleChange}
                    error={touched.direccion_propietario && Boolean(errors.direccion_propietario)}
                    helperText={touched.direccion_propietario && errors.direccion_propietario}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="mail"
                    type="email"
                    value={values.mail}
                    onChange={handleChange}
                    error={touched.mail && Boolean(errors.mail)}
                    helperText={touched.mail && errors.mail}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                <TextField
                    select
                    fullWidth
                    label="Empleado Asignado"
                    name="empleado_asignado"
                    value={values.empleado_asignado || 0}
                    onChange={handleChange}
                    error={touched.empleado_asignado && Boolean(errors.empleado_asignado)}
                    helperText={touched.empleado_asignado && errors.empleado_asignado}
                  >
                    <MenuItem value={0} disabled>
                      Seleccione un empleado
                    </MenuItem>
                    {empleados.map((emp) => (
                      <MenuItem key={emp.id_empleado} value={emp.id_empleado}>
                        {emp.id_empleado} - {emp.nombre}
                      </MenuItem>
                    ))}
                  </TextField>

                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descripción del Producto"
                    name="descripcion_producto"
                    value={values.descripcion_producto}
                    onChange={handleChange}
                    multiline
                    rows={2}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observaciones"
                    name="observaciones"
                    value={values.observaciones}
                    onChange={handleChange}
                    multiline
                    rows={3}
                  />
                </Grid>

                <Grid item xs={12} textAlign="center">
                  <Button type="submit" variant="contained" size="large">
                    Guardar Mantenimiento
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Paper>
    </Container>
  );
};

export default FormularioMantenimiento;
