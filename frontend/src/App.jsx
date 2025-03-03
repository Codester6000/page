import Navbar from "./componentes/Navbar"

// import { CustomizedInputBase } from "./componentes/Barra"
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import { Route, Routes } from "react-router-dom";
import { AuthPage,AuthRol } from "./Auth";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';


import "./styl.css"

import Login from "./componentes/Login"
import Register from "./componentes/Register"
import Footer from "./componentes/footer"
import Inicio from "./componentes/inicio";
import Busqueda from "./componentes/Busqueda";
import Carrito from "./componentes/Carrito";
import Favorito from "./componentes/Favorito"
import Armadorpc from "./componentes/Armadorpc";
import NuevoProducto from "./componentes/nuevoProducto";
import Checkout from "./componentes/Checkout";
import Ventas from "./componentes/ventas";
import ThankYou from "./componentes/ThankYou";
import DesarrolloWeb from "./componentes/DesarrolloWeb";
import Portada from "./componentes/Portada";



function App() {

  return (
    <>

        <header>
          <Navbar></Navbar>
        </header>
        <Routes>
        <Route path="/productos" element={<Inicio />}/>
        <Route path="/" element={<Portada />}/>
        <Route path="/armador" element={<AuthPage><Armadorpc /></AuthPage>} />
        <Route path="/busqueda" element={<Busqueda/>} />
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/carrito" element={<AuthPage><Carrito/></AuthPage>}/>
        <Route path="/favorito" element={<AuthPage><Favorito /></AuthPage>}/>
        <Route path="/cargar-producto" element={<AuthPage><NuevoProducto /></AuthPage>}/>
        <Route path="/checkout" element={<Checkout />}/>
        <Route path="/ventas" element={<AuthPage><AuthRol rol="2"><Ventas /></AuthRol></AuthPage>}/>
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/desarrollo" element={<DesarrolloWeb />} />

        </Routes>
        {/* <div className="burWsp">
          <div className="wsp-cont">
            <a href="https://api.whatsapp.com/send/?phone=543804353826&text=Hola,+quiero+contactarme+con+ustedes!&type=phone_number&app_absent=0" className="bwsp" target="_blank"> <i><WhatsAppIcon sx={{fontSize: "35px"}}/></i> </a>
            <div className="mensWsp">¿Quiere comunicarse con nosotros?</div>
          </div>
        </div> */}
        <a href="https://api.whatsapp.com/send/?phone=543804353826&text=Hola,+quiero+contactarme+con+ustedes!&type=phone_number&app_absent=0" className="bwsp" target="_blank"> <i><WhatsAppIcon sx={{fontSize: "35px"}}/></i> </a>

        <Footer></Footer>
    </>
  )
}

export default App
