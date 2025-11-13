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
import {
  esAdmin,
  esSuperAdmin,
  esSubAdmin,
  esEmpleado,
  esCliente,
  tieneRol,
} from "../utils/authHelpers";

//  Crear contexto
const AuthContext = createContext();

//  Hook personalizado para usar el contexto desde cualquier componente
export const useAuth = () => {
  return useContext(AuthContext);
};

const url = import.meta.env.VITE_URL_BACK;

//  Proveedor de autenticación
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
    if (ok) ok();
  };

  const value = { sesion, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

//  Protección de rutas privadas
export const AuthPage = ({ children }) => {
  const { sesion } = useAuth();
  const location = useLocation();

  if (!sesion) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

//  Protección por rol (ajustada para NO redirigir, solo ocultar contenido)
export const AuthRol = ({ rol, children, redirect = false }) => {
  const { sesion } = useAuth();

  // Si no hay sesión y redirect es true, redirige al login
  // Si no hay sesión y redirect es false, simplemente no muestra nada
  if (!sesion) {
    return redirect ? <Navigate to="/login" replace /> : null;
  }

  const rolesPermitidos = Array.isArray(rol) ? rol : [rol];

  const tienePermiso = rolesPermitidos.some(
    (r) => String(sesion.rol).trim() === String(r).trim()
  );

  if (!tienePermiso) {
    return null;
  }

  return children;
};

export const useIsAdmin = () => {
  const { sesion } = useAuth();
  return esAdmin(sesion);
};

export const useIsSuperAdmin = () => {
  const { sesion } = useAuth();
  return esSuperAdmin(sesion);
};

export const useIsSubAdmin = () => {
  const { sesion } = useAuth();
  return esSubAdmin(sesion);
};

export const useIsEmpleado = () => {
  const { sesion } = useAuth();
  return esEmpleado(sesion);
};

export const useIsCliente = () => {
  const { sesion } = useAuth();
  return esCliente(sesion);
};

export const useTieneRol = (roles) => {
  const { sesion } = useAuth();
  return tieneRol(sesion, roles);
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
