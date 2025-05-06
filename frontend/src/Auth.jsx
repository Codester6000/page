import { createContext, useContext, useState, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Menu,
  MenuItem,
  IconButton,
  Avatar,
  Tooltip,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";

// 🔐 Crear contexto
const AuthContext = createContext();

// ✅ Hook personalizado para usar el contexto desde cualquier componente
export const useAuth = () => {
  return useContext(AuthContext);
};

const url = import.meta.env.VITE_URL_BACK;

// 🔑 Proveedor de autenticación
export const AuthProvider = ({ children }) => {
  const [sesion, setSesion] = useState(() => {
    const storedSesion = localStorage.getItem("sesion");
    return storedSesion ? JSON.parse(storedSesion) : null;
  });

  useEffect(() => {
    if (sesion) {
      localStorage.setItem("sesion", JSON.stringify(sesion));
    } else {
      localStorage.removeItem("sesion");
    }
  }, [sesion]);

  const login = async (username, password, ok, error) => {
    try {
      const response = await fetch(`${url}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        error();
        return;
      }

      const sesion = await response.json();
      setSesion(sesion);
      ok();
    } catch (err) {
      console.error(err);
      error();
    }
  };

  const logout = (ok) => {
    setSesion(null);
    ok();
  };

  const value = { sesion, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 🛡️ Protección de rutas privadas
export const AuthPage = ({ children }) => {
  const { sesion } = useAuth();
  const location = useLocation();

  if (!sesion) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// 🛡️ Protección por rol (ajustada a rol numérico)
export const AuthRol = ({ rol, children }) => {
  const { sesion } = useAuth();

  if (!sesion) {
    return <Navigate to="/login" replace />;
  }

  // Convertir ambos a string para que coincidan correctamente
  if (String(sesion.rol).trim() !== String(rol).trim()) {
    return null;
  }

  return children;
};

// 👤 Estado de autenticación con menú desplegable
export const AuthStatus = () => {
  const { sesion, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  if (!sesion) {
    return (
      <>
        <Button
          variant="contained"
          startIcon={<PersonIcon />}
          sx={{ ml: 2, backgroundColor: "#a111ad", borderRadius: "20px" }}
          onClick={() => navigate("/login")}
        >
          Ingresar
        </Button>
        <Button
          variant="contained"
          sx={{
            ml: 2,
            backgroundColor: "#a111ad",
            borderRadius: "20px",
            color: "#fff",
            borderColor: "#a111ad",
          }}
          onClick={() => navigate("/register")}
        >
          Registrarse
        </Button>
      </>
    );
  }

  return (
    <>
      <Tooltip title="Opciones de cuenta">
        <IconButton onClick={handleMenuOpen} sx={{ ml: 2 }}>
          <Avatar>{sesion.username?.charAt(0).toUpperCase()}</Avatar>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            mt: 1.5,
            minWidth: 150,
          },
        }}
      >
        <MenuItem onClick={() => navigate("/perfil")}>Mi perfil</MenuItem>
        <MenuItem onClick={() => logout(() => navigate("/"))}>
          <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
          Cerrar sesión
        </MenuItem>
      </Menu>
    </>
  );
};
