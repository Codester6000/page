import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Modal,
  TextField,
  IconButton,
} from "@mui/material";
import EditLocationAltIcon from "@mui/icons-material/EditLocationAlt";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CloseIcon from "@mui/icons-material/Close";
import { useState, useEffect } from "react";
import { useAuth } from "../../Auth";
import Swal from "sweetalert2";

const Perfil = () => {
  const { sesion } = useAuth();
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const [openModal, setOpenModal] = useState(false);
  const [openFavoritosModal, setOpenFavoritosModal] = useState(false);
  const [domicilio, setDomicilio] = useState("");
  const [datosUsuario, setDatosUsuario] = useState({
    nombre: "",
    apellido: "",
    direccion: "",
    telefono: "",
  });

  const favoritos = [
    { nombre: "Auriculares Gamer HyperX", precio: 65000 },
    { nombre: "Notebook Lenovo Ideapad", precio: 434900 },
    { nombre: "Mouse Logitech G305", precio: 35900 },
  ];

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_URL_BACK}/usuarios/perfil`,
          {
            headers: {
              Authorization: `Bearer ${sesion?.token}`,
            },
          }
        );
        const data = await response.json();
        setDatosUsuario(data);
      } catch (error) {
        console.error("Error al obtener perfil:", error);
      }
    };
    if (sesion?.token) fetchPerfil();
  }, [sesion]);

  const handleGuardarDatos = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL_BACK}/usuarios/agregar-info`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sesion?.token}`,
          },
          body: JSON.stringify(datosUsuario),
        }
      );

      if (response.ok) {
        Swal.fire(
          "Actualizado",
          "Tus datos fueron actualizados correctamente",
          "success"
        );
        setOpenModal(false);
      } else {
        Swal.fire("Error", "No se pudieron actualizar tus datos", "error");
      }
    } catch (error) {
      Swal.fire("Error de red", "No se pudo conectar con el servidor", "error");
    }
  };

  return (
    <Box display="flex" flexWrap="wrap" gap={3} p={3}>
      <Paper elevation={3} sx={{ flex: 1, minWidth: "300px", p: 2 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          <FavoriteIcon sx={{ mr: 1, color: "red" }} />
          Mis Favoritos
        </Typography>
        <Box mb={2}>
          <Typography variant="body1">Nombre del producto 1</Typography>
          <Typography variant="caption" color="gray">
            $134.900
          </Typography>
        </Box>
        <Divider />
        <Box mt={2}>
          <Typography variant="body1">Nombre del producto 2</Typography>
          <Typography variant="caption" color="gray">
            $65.000
          </Typography>
        </Box>
        <Button
          variant="outlined"
          fullWidth
          sx={{ mt: 3 }}
          onClick={() => setOpenFavoritosModal(true)}
        >
          Ver todos
        </Button>
      </Paper>

      <Paper elevation={3} sx={{ flex: 1, minWidth: "300px", p: 2 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          📍 Mis domicilios
        </Typography>
        <Box>
          <Typography variant="body2" color="textSecondary">
            Dirección: {datosUsuario.direccion || "No especificado"}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Teléfono: {datosUsuario.telefono || "No especificado"}
          </Typography>
        </Box>
        <Button
          onClick={handleOpenModal}
          startIcon={<EditLocationAltIcon />}
          sx={{ mt: 2 }}
        >
          Cambiar o agregar domicilio
        </Button>
      </Paper>

      <Paper elevation={3} sx={{ flex: 1, minWidth: "300px", p: 2 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Mis Datos Personales
        </Typography>
        <Typography>
          <b>Nombre:</b> {datosUsuario.nombre || "-"}
        </Typography>
        <Typography>
          <b>Apellido:</b> {datosUsuario.apellido || "-"}
        </Typography>
        <Typography>
          <b>Dirección:</b> {datosUsuario.direccion || "-"}
        </Typography>
        <Typography>
          <b>Teléfono:</b> {datosUsuario.telefono || "-"}
        </Typography>
        <Button
          onClick={handleOpenModal}
          startIcon={<EditLocationAltIcon />}
          sx={{ mt: 2 }}
        >
          Editar datos personales
        </Button>
      </Paper>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "white",
            boxShadow: 24,
            borderRadius: 2,
            p: 3,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Editar Información</Typography>
            <IconButton onClick={handleCloseModal}>
              <CloseIcon />
            </IconButton>
          </Box>
          <TextField
            label="Nombre"
            fullWidth
            sx={{ mt: 2 }}
            value={datosUsuario.nombre}
            onChange={(e) =>
              setDatosUsuario({ ...datosUsuario, nombre: e.target.value })
            }
          />
          <TextField
            label="Apellido"
            fullWidth
            sx={{ mt: 2 }}
            value={datosUsuario.apellido}
            onChange={(e) =>
              setDatosUsuario({ ...datosUsuario, apellido: e.target.value })
            }
          />
          <TextField
            label="Dirección"
            fullWidth
            sx={{ mt: 2 }}
            value={datosUsuario.direccion}
            onChange={(e) =>
              setDatosUsuario({ ...datosUsuario, direccion: e.target.value })
            }
          />
          <TextField
            label="Teléfono"
            fullWidth
            sx={{ mt: 2 }}
            value={datosUsuario.telefono}
            onChange={(e) =>
              setDatosUsuario({ ...datosUsuario, telefono: e.target.value })
            }
          />
          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 3, bgcolor: "#FF7D21" }}
            onClick={handleGuardarDatos}
          >
            Guardar cambios
          </Button>
        </Box>
      </Modal>

      <Modal
        open={openFavoritosModal}
        onClose={() => setOpenFavoritosModal(false)}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "white",
            boxShadow: 24,
            borderRadius: 2,
            p: 3,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Mis Favoritos</Typography>
            <IconButton onClick={() => setOpenFavoritosModal(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {favoritos.length > 0 ? (
            favoritos.map((fav, index) => (
              <Box key={index} sx={{ mt: 2 }}>
                <Typography fontWeight="bold">{fav.nombre}</Typography>
                <Typography color="gray">
                  {fav.precio.toLocaleString("es-ar", {
                    style: "currency",
                    currency: "ARS",
                    maximumFractionDigits: 0,
                  })}
                </Typography>
                <Divider sx={{ my: 1 }} />
              </Box>
            ))
          ) : (
            <Typography sx={{ mt: 2 }}>
              No hay productos en favoritos.
            </Typography>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default Perfil;
