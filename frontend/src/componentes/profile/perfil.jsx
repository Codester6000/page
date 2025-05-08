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
import { useState } from "react";

const Perfil = () => {
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const [openModal, setOpenModal] = useState(false);
  const [openFavoritosModal, setOpenFavoritosModal] = useState(false); // nuevo
  const [domicilio, setDomicilio] = useState("");

  // Simulación de favoritos (puede venir de props o API)
  const favoritos = [
    { nombre: "Auriculares Gamer HyperX", precio: 65000 },
    { nombre: "Notebook Lenovo Ideapad", precio: 434900 },
    { nombre: "Mouse Logitech G305", precio: 35900 },
  ];

  return (
    <Box display="flex" flexWrap="wrap" gap={3} p={3}>
      {/* MIS FAVORITOS */}
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

      {/* MIS DOMICILIOS */}
      <Paper elevation={3} sx={{ flex: 1, minWidth: "300px", p: 2 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          📍 Mis domicilios
        </Typography>
        <Box>
          <Typography variant="body2" color="textSecondary">
            Retiro por sucursal
          </Typography>
          <Typography fontWeight="bold">Sucursal Oca: La Rioja</Typography>
          <Typography variant="body2">Av. Pte. Carlos Menem 753</Typography>
          <Typography variant="body2" color="textSecondary">
            Código Postal: 5300
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

      {/* MIS CUENTAS */}
      <Paper elevation={3} sx={{ flex: 1, minWidth: "300px", p: 2 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          🧾 Mis cuentas
        </Typography>
        <Typography>
          <b>Nombre:</b>
        </Typography>
        <Typography>
          <b>DNI:</b>
        </Typography>
      </Paper>

      {/* MODAL DE DOMICILIO */}
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
            <Typography variant="h6">Nuevo domicilio</Typography>
            <IconButton onClick={handleCloseModal}>
              <CloseIcon />
            </IconButton>
          </Box>
          <TextField
            label="Domicilio"
            fullWidth
            variant="outlined"
            value={domicilio}
            onChange={(e) => setDomicilio(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            label="Código Postal"
            fullWidth
            variant="outlined"
            sx={{ mt: 2 }}
          />
          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 3, bgcolor: "#FF7D21" }}
            onClick={() => {
              // Enviar a backend acá
              handleCloseModal();
            }}
          >
            Guardar domicilio
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
