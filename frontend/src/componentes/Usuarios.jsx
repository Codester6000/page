import { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  MenuItem,
  Grid,
  Typography,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Key as KeyIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";

const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create, edit, password
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    id_rol: "",
    nombre: "",
    apellido: "",
    fechaNacimiento: "",
    direccion: "",
    telefono: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // URL base de la API - ajusta según tu configuración
  const url = import.meta.env.VITE_URL_BACK;

  // Obtener token del localStorage
  const getToken = () => localStorage.getItem("token");

  // Headers con autenticación
  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  });

  // Cargar usuarios y roles al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      await Promise.all([cargarUsuarios(), cargarRoles()]);
      setError(null);
    } catch (err) {
      setError("Error al cargar los datos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar lista de usuarios
  const cargarUsuarios = async () => {
    try {
      const response = await fetch(`${url}/usuarios/gestion`, {
        headers: getHeaders(),
      });

      if (!response.ok) throw new Error("Error al cargar usuarios");

      const data = await response.json();
      const usuariosGestion = data.usuarios || [];

      // Cargar también el admin general
      const responseAdmin = await fetch(`${url}/usuarios/admin-general`, {
        headers: getHeaders(),
      });

      if (responseAdmin.ok) {
        const dataAdmin = await responseAdmin.json();
        if (dataAdmin.admin) {
          setUsuarios([dataAdmin.admin, ...usuariosGestion]);
        } else {
          setUsuarios(usuariosGestion);
        }
      } else {
        setUsuarios(usuariosGestion);
      }
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      throw err;
    }
  };

  // Cargar roles disponibles
  const cargarRoles = async () => {
    try {
      const response = await fetch(`${url}/usuarios/roles-disponibles`, {
        headers: getHeaders(),
      });

      if (!response.ok) throw new Error("Error al cargar roles");

      const data = await response.json();
      setRoles(data.roles || []);
    } catch (err) {
      console.error("Error al cargar roles:", err);
      throw err;
    }
  };

  // Abrir modal para crear usuario
  const abrirModalCrear = () => {
    setModalMode("create");
    setFormData({
      username: "",
      password: "",
      email: "",
      id_rol: "",
      nombre: "",
      apellido: "",
      fechaNacimiento: "",
      direccion: "",
      telefono: "",
    });
    setFormErrors({});
    setOpenModal(true);
  };

  // Abrir modal para editar usuario
  const abrirModalEditar = (usuario) => {
    setModalMode("edit");
    setUsuarioSeleccionado(usuario);
    setFormData({
      username: usuario.username,
      email: usuario.email,
      id_rol: usuario.id_rol,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      fechaNacimiento: usuario.fechaNacimiento.split("T")[0],
      direccion: usuario.direccion || "",
      telefono: usuario.telefono || "",
    });
    setFormErrors({});
    setOpenModal(true);
  };

  // Abrir modal para cambiar contraseña
  const abrirModalPassword = (usuario) => {
    setModalMode("password");
    setUsuarioSeleccionado(usuario);
    setFormData({ password: "" });
    setFormErrors({});
    setOpenModal(true);
  };

  // Cerrar modal
  const cerrarModal = () => {
    setOpenModal(false);
    setUsuarioSeleccionado(null);
    setFormData({});
    setFormErrors({});
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validar formulario
  const validarFormulario = () => {
    const errores = {};

    if (modalMode !== "password") {
      if (!formData.username?.trim())
        errores.username = "El username es requerido";
      if (!formData.email?.trim()) errores.email = "El email es requerido";
      if (!formData.id_rol) errores.id_rol = "El rol es requerido";
      if (!formData.nombre?.trim()) errores.nombre = "El nombre es requerido";
      if (!formData.apellido?.trim())
        errores.apellido = "El apellido es requerido";
      if (!formData.fechaNacimiento)
        errores.fechaNacimiento = "La fecha de nacimiento es requerida";
    }

    if (modalMode === "create" || modalMode === "password") {
      if (!formData.password?.trim())
        errores.password = "La contraseña es requerida";
      else if (formData.password.length < 6)
        errores.password = "La contraseña debe tener al menos 6 caracteres";
    }

    setFormErrors(errores);
    return Object.keys(errores).length === 0;
  };

  // Crear usuario
  const crearUsuario = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    try {
      const response = await fetch(`${url}/usuarios/gestion`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errores) {
          const errores = {};
          data.errores.forEach((err) => {
            errores[err.path] = err.msg;
          });
          setFormErrors(errores);
        } else {
          Swal.fire("Error", data.error || "Error al crear usuario", "error");
        }
        return;
      }

      Swal.fire("¡Éxito!", "Usuario creado exitosamente", "success");
      cerrarModal();
      cargarUsuarios();
    } catch (err) {
      console.error("Error al crear usuario:", err);
      Swal.fire("Error", "Error al crear usuario", "error");
    }
  };

  // Actualizar usuario
  const actualizarUsuario = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    try {
      const response = await fetch(
        `${url}/usuarios/gestion/${usuarioSeleccionado.id_usuario}`,
        {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.errores) {
          const errores = {};
          data.errores.forEach((err) => {
            errores[err.path] = err.msg;
          });
          setFormErrors(errores);
        } else {
          Swal.fire(
            "Error",
            data.error || "Error al actualizar usuario",
            "error"
          );
        }
        return;
      }

      Swal.fire("¡Éxito!", "Usuario actualizado exitosamente", "success");
      cerrarModal();
      cargarUsuarios();
    } catch (err) {
      console.error("Error al actualizar usuario:", err);
      Swal.fire("Error", "Error al actualizar usuario", "error");
    }
  };

  // Cambiar contraseña
  const cambiarPassword = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    try {
      const response = await fetch(
        `${url}/usuarios/gestion/${usuarioSeleccionado.id_usuario}/password`,
        {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify({ password: formData.password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.errores) {
          const errores = {};
          data.errores.forEach((err) => {
            errores[err.path] = err.msg;
          });
          setFormErrors(errores);
        } else {
          Swal.fire(
            "Error",
            data.error || "Error al cambiar contraseña",
            "error"
          );
        }
        return;
      }

      Swal.fire("¡Éxito!", "Contraseña actualizada exitosamente", "success");
      cerrarModal();
    } catch (err) {
      console.error("Error al cambiar contraseña:", err);
      Swal.fire("Error", "Error al cambiar contraseña", "error");
    }
  };

  // Eliminar usuario
  const eliminarUsuario = async (usuario) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: `Se eliminará al usuario ${usuario.username}. Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(
        `${url}/usuarios/gestion/${usuario.id_usuario}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Swal.fire("Error", data.error || "Error al eliminar usuario", "error");
        return;
      }

      Swal.fire("¡Eliminado!", "Usuario eliminado exitosamente", "success");
      cargarUsuarios();
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      Swal.fire("Error", "Error al eliminar usuario", "error");
    }
  };

  // Obtener nombre del rol
  const getNombreRol = (id_rol) => {
    const rol = roles.find((r) => r.id_rol === id_rol);
    return rol ? rol.nombre_rol : "Desconocido";
  };

  // Obtener color del chip según el rol
  const getRolColor = (id_rol) => {
    switch (id_rol) {
      case 1:
        return "primary";
      case 4:
        return "secondary";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={cargarDatos}>
          Reintentar
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          Gestión de Usuarios
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={abrirModalCrear}
        >
          Nuevo Usuario
        </Button>
      </Box>

      {/* Tabla */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.100" }}>
              <TableCell>
                <strong>ID</strong>
              </TableCell>
              <TableCell>
                <strong>Username</strong>
              </TableCell>
              <TableCell>
                <strong>Nombre Completo</strong>
              </TableCell>
              <TableCell>
                <strong>Email</strong>
              </TableCell>
              <TableCell>
                <strong>Rol</strong>
              </TableCell>
              <TableCell>
                <strong>Teléfono</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Acciones</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                  <Typography color="text.secondary">
                    No hay usuarios registrados
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              usuarios.map((usuario) => (
                <TableRow
                  key={usuario.id_usuario}
                  hover
                  sx={{ "&:last-child td": { border: 0 } }}
                >
                  <TableCell>{usuario.id_usuario}</TableCell>
                  <TableCell>{usuario.username}</TableCell>
                  <TableCell>
                    {usuario.nombre} {usuario.apellido}
                  </TableCell>
                  <TableCell>{usuario.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={getNombreRol(usuario.id_rol)}
                      color={getRolColor(usuario.id_rol)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{usuario.telefono || "-"}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => abrirModalEditar(usuario)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Cambiar Contraseña">
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() => abrirModalPassword(usuario)}
                      >
                        <KeyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => eliminarUsuario(usuario)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal */}
      <Dialog open={openModal} onClose={cerrarModal} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">
              {modalMode === "create" && "Crear Nuevo Usuario"}
              {modalMode === "edit" && "Editar Usuario"}
              {modalMode === "password" && "Cambiar Contraseña"}
            </Typography>
            <IconButton onClick={cerrarModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <form
          onSubmit={
            modalMode === "create"
              ? crearUsuario
              : modalMode === "edit"
              ? actualizarUsuario
              : cambiarPassword
          }
        >
          <DialogContent dividers>
            {modalMode === "password" ? (
              <TextField
                fullWidth
                type="password"
                label="Nueva Contraseña"
                name="password"
                value={formData.password || ""}
                onChange={handleChange}
                error={!!formErrors.password}
                helperText={formErrors.password || "Mínimo 6 caracteres"}
                required
              />
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={formData.username || ""}
                    onChange={handleChange}
                    error={!!formErrors.username}
                    helperText={formErrors.username}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="email"
                    label="Email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                    required
                  />
                </Grid>

                {modalMode === "create" && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="password"
                      label="Contraseña"
                      name="password"
                      value={formData.password || ""}
                      onChange={handleChange}
                      error={!!formErrors.password}
                      helperText={formErrors.password || "Mínimo 6 caracteres"}
                      required
                    />
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombre"
                    name="nombre"
                    value={formData.nombre || ""}
                    onChange={handleChange}
                    error={!!formErrors.nombre}
                    helperText={formErrors.nombre}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Apellido"
                    name="apellido"
                    value={formData.apellido || ""}
                    onChange={handleChange}
                    error={!!formErrors.apellido}
                    helperText={formErrors.apellido}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Rol"
                    name="id_rol"
                    value={formData.id_rol || ""}
                    onChange={handleChange}
                    error={!!formErrors.id_rol}
                    helperText={formErrors.id_rol}
                    required
                  >
                    {roles.map((rol) => (
                      <MenuItem key={rol.id_rol} value={rol.id_rol}>
                        {rol.nombre_rol}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Fecha de Nacimiento"
                    name="fechaNacimiento"
                    value={formData.fechaNacimiento || ""}
                    onChange={handleChange}
                    error={!!formErrors.fechaNacimiento}
                    helperText={formErrors.fechaNacimiento}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Dirección"
                    name="direccion"
                    value={formData.direccion || ""}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    name="telefono"
                    value={formData.telefono || ""}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={cerrarModal} color="inherit">
              Cancelar
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {modalMode === "create" && "Crear Usuario"}
              {modalMode === "edit" && "Guardar Cambios"}
              {modalMode === "password" && "Cambiar Contraseña"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default GestionUsuarios;
