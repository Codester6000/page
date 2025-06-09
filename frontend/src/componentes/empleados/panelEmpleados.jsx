import {
    Container,
    Paper,
    Typography,
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TablePagination,
    IconButton,
    TextField,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Chip,
  } from "@mui/material";
  import { Edit, ToggleOn, ToggleOff } from "@mui/icons-material";
  import { useEffect, useState } from "react";
  import Swal from "sweetalert2";
  import axios from "axios";
  import { useAuth } from "../../Auth";
  
  export default function PanelEmpleados() {
    const { sesion } = useAuth();
    const url = import.meta.env.VITE_URL_BACK;
  
    const [empleados, setEmpleados] = useState([]);
    const [filtro, setFiltro] = useState("");
    const [pagina, setPagina] = useState(0);
    const [filasPorPagina, setFilasPorPagina] = useState(5);
    const [editar, setEditar] = useState(null);
  
    useEffect(() => {
      obtenerEmpleados();
    }, []);
  
    const obtenerEmpleados = async () => {
      try {
        const res = await axios.get(`${url}/empleados`, {
          headers: {
            Authorization: `Bearer ${sesion?.token}`,
          },
        });
        setEmpleados(res.data.empleados || []);
      } catch (err) {
        console.error(err);
      }
    };
  
    const handleCambioEstado = async (empleado) => {
        const nuevoEstado = empleado.estado === "Activo" ? "Inactivo" : "Activo";
        try {
          const res = await axios.patch(
            `${url}/empleados/estado/${empleado.id_empleado}`,
            { estado: nuevoEstado },
            {
              headers: {
                Authorization: `Bearer ${sesion?.token}`,
              },
            }
          );
      
          const actualizado = res.data.empleado;
      
          // Actualizar el estado local sin refetch
          setEmpleados((prev) =>
            prev.map((e) =>
              e.id_empleado === actualizado.id_empleado ? actualizado : e
            )
          );
        } catch (err) {
          console.error(err);
          Swal.fire("Error", "No se pudo cambiar el estado", "error");
        }
      };
      
  
    const empleadosFiltrados = empleados.filter((e) =>
      e.nombre.toLowerCase().includes(filtro.toLowerCase())
    );
  
    const handleGuardarCambios = async () => {
        const campos = [
          "nombre",
          "apellido",
          "email",
          "direccion",
          "dni",
          "telefono",
        ];
      
        const datos = {};
        campos.forEach((campo) => {
          if (editar[campo] !== undefined && editar[campo] !== "") {
            datos[campo] = editar[campo];
          }
        });
      
        try {
          const res = await axios.put(`${url}/empleados/${editar.id_empleado}`, datos, {
            headers: {
              Authorization: `Bearer ${sesion?.token}`,
            },
          });
      
          setEmpleados((prev) =>
            prev.map((e) => (e.id_empleado === editar.id_empleado ? { ...e, ...datos } : e))
          );
          setEditar(null);
      
          Swal.fire("Éxito", "Empleado actualizado correctamente", "success");
        } catch (error) {
          console.error(error);
          Swal.fire("Error", error.response?.data?.error || "No se pudo actualizar", "error");
        }
      };
      
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Panel de Empleados
          </Typography>
  
          <TextField
            label="Buscar por nombre"
            variant="outlined"
            fullWidth
            sx={{ my: 2 }}
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
  
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>DNI</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {empleadosFiltrados
                  .slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina)
                  .map((emp) => (
                    <TableRow key={emp.id_empleado}>
                      <TableCell>{emp.nombre} {emp.apellido}</TableCell>
                      <TableCell>{emp.email}</TableCell>
                      <TableCell>{emp.dni}</TableCell>
                      <TableCell>
                        <Chip
                          label={emp.estado}
                          color={emp.estado === "Activo" ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => setEditar(emp)}>
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleCambioEstado(emp)}>
                          {emp.estado === "Activo" ? <ToggleOff /> : <ToggleOn />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
  
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={empleadosFiltrados.length}
            rowsPerPage={filasPorPagina}
            page={pagina}
            onPageChange={(e, nuevaPagina) => setPagina(nuevaPagina)}
            onRowsPerPageChange={(e) => {
              setFilasPorPagina(parseInt(e.target.value, 10));
              setPagina(0);
            }}
          />
        </Paper>
  
        <Dialog open={Boolean(editar)} onClose={() => setEditar(null)} maxWidth="sm" fullWidth>
          <DialogTitle>Editar Empleado</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {[
                { label: "Nombre", name: "nombre" },
                { label: "Apellido", name: "apellido" },
                { label: "Email", name: "email" },
                { label: "Dirección", name: "direccion" },
                { label: "DNI", name: "dni" },
                { label: "Teléfono", name: "telefono" },
              ].map((campo) => (
                <Grid item xs={12} md={6} key={campo.name}>
                  <TextField
                    fullWidth
                    label={campo.label}
                    name={campo.name}
                    value={editar?.[campo.name] || ""}
                    onChange={(e) =>
                      setEditar({ ...editar, [campo.name]: e.target.value })
                    }
                  />
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditar(null)}>Cancelar</Button>
            <Button onClick={handleGuardarCambios} variant="contained">
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
  }
  