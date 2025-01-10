import { createContext, useContext, useState,useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
const AuthContext = createContext();
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import {Button } from "@mui/material";
// Hook con sesion
export const useAuth = () => {
  return useContext(AuthContext);
};
const url = 'https://api.modex.com.ar'
// Componente principal
export const AuthProvider = ({ children }) => {
  const [sesion, setSesion] = useState(()=>{
    const storedSesion = localStorage.getItem('sesion');
    return storedSesion ? JSON.parse(storedSesion) : null;
  });

  useEffect(()=>{
    if (sesion) {
      localStorage.setItem('sesion',JSON.stringify(sesion))
    }else{
      localStorage.removeItem('sesion')
    }
  },[sesion]);

  const login = async (username, password, ok, error) => {
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
    //console.log(sesion);
    setSesion(sesion);
    ok();
  };

  const logout = (ok) => {
    setSesion(null);
    ok();
  };

  const value = { sesion, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Autorizar pagina
export const AuthPage = ({ children }) => {
  const { sesion } = useAuth();
  const location = useLocation();

  if (!sesion) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Autorizar rol
export const AuthRol = ({ rol, children }) => {
  const { sesion } = useAuth();
  if (!sesion || sesion.rol != rol) {
    return null;
  }

  return children;
};


export const AuthStatus = () => {
  const { sesion, logout } = useAuth();
  const navigate = useNavigate();

  if (!sesion) {
    return <Button variant="contained" size="large" startIcon={<PersonIcon/>} sx={{ml: 2, backgroundColor: "#a111ad", borderRadius: "20px", objectFit: "contain"}} onClick={()=>navigate("/login")}>Ingresar</Button>
  }

  return (
    <>
      {/* <p>Conectado como {sesion.username}</p> */}
      {/* <button onClick={() => logout(() => navigate("/"))}>Salir</button> */}
      <Button variant="contained" startIcon={<LogoutIcon></LogoutIcon>} sx={{ml: 2, backgroundColor: "#a111ad", height: 45 , borderRadius: "25px", objectFit: "contain"}} onClick={() => logout(() => navigate("/"))} >{sesion.username}</Button>
    </>
  );
};