import Navbar from "./componentes/Navbar";
import "swiper/swiper-bundle.css";
import { Route, Routes } from "react-router-dom";
import { AuthPage, AuthRol } from "./Auth";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import "./styl.css";
import Login from "./componentes/Login";
import Register from "./componentes/Register";
import Footer from "./componentes/footer";
import Inicio from "./componentes/inicio";
import Busqueda from "./componentes/Busqueda";
import Carrito from "./componentes/Carrito";
import Favorito from "./componentes/Favorito";
import Armadorpc from "./componentes/Armadorpc";
import NuevoProducto from "./componentes/nuevoProducto";
import Checkout from "./componentes/Checkout";
import Ventas from "./componentes/ventas";
import ThankYou from "./componentes/ThankYou";
import IngresoMantenimiento from "./componentes/mantenimiento/ingresoMantenimiento";
import DesarrolloWeb from "./componentes/DesarrolloWeb";
import Portada from "./componentes/Portada";
import Producto from "./componentes/Producto";
import { useEffect } from "react";
import { useAuth } from "./Auth";
import { useNavigate } from "react-router-dom";
import Perfil from "./componentes/profile/perfil";
import PreguntasFrecuentes from "./componentes/faqs/PreguntasFrecuentes";
import Metricas from "./componentes/metricas/Metricas";
import HotSale from "./componentes/hotsale/HotSale";
import ProductosUsados from "./componentes/usado/ProductosUsados";
import ProductosNuevos from "./componentes/nuevo/ProductosNuevos";
import AltaEmpleado from "./componentes/empleados/AltaEmpleado";
import PanelEmpleados from "./componentes/empleados/panelEmpleados";
import CargarProducto from "./componentes/mantenimiento/cargaDeProducto"; 


function App() {
  const { sesion, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (sesion?.token) {
      const tokenData = JSON.parse(atob(sesion.token.split(".")[1]));
      const expirationTime = tokenData.exp * 1000;

      if (Date.now() >= expirationTime) {
        logout(() => navigate("/"));
      }
    }
  }, [sesion]);

  return (
    <>
      <header>
        <Navbar />
      </header>
      <Routes>
        {/* Empleados */}
        <Route path="/empleados/alta" element={<AuthPage><AuthRol rol="2"><AltaEmpleado /></AuthRol></AuthPage>} />
        <Route path="/empleados/panel" element={<AuthPage><AuthRol rol="2"><PanelEmpleados /></AuthRol></AuthPage>} />

        {/* Productos */}
        <Route path="/productos" element={<Inicio />} />
        <Route path="/producto/:id" element={<Producto />} />
        <Route path="/productos/hotsale" element={<HotSale />} />
        <Route path="/productos/usados" element={<ProductosUsados />} />
        <Route path="/productos/nuevos" element={<ProductosNuevos />} />

        {/* Mantenimiento */}
        <Route path="/mantenimiento" element={<IngresoMantenimiento />} />
        <Route path="/mantenimiento/ingreso" element={<AuthPage><AuthRol rol="2">< CargarProducto /></AuthRol></AuthPage>} />

        <Route path="/" element={<Portada />} />
        <Route path="/armador" element={<Armadorpc />} />
        <Route path="/faqs" element={<PreguntasFrecuentes />} />
        <Route path="/metricas" element={<AuthPage><Metricas /></AuthPage>} />
        <Route path="/busqueda" element={<Busqueda />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/perfil" element={<AuthPage><Perfil /></AuthPage>} />
        <Route path="/carrito" element={<AuthPage><Carrito /></AuthPage>} />
        <Route path="/favorito" element={<AuthPage><Favorito /></AuthPage>} />
        <Route path="/cargar-producto" element={<AuthPage><NuevoProducto /></AuthPage>} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/ventas" element={<AuthPage><AuthRol rol="2"><Ventas /></AuthRol></AuthPage>} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/desarrollo" element={<DesarrolloWeb />} />
      </Routes>
      <a
        href="https://api.whatsapp.com/send/?phone=543804353826&text=Hola,+quiero+contactarme+con+ustedes!&type=phone_number&app_absent=0"
        className="bwsp"
        target="_blank"
      >
        <i>
          <WhatsAppIcon sx={{ fontSize: "35px" }} />
        </i>
      </a>
      <Footer />
    </>
  );
}

export default App;
