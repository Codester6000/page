import Navbar from "./componentes/Navbar"

// import { CustomizedInputBase } from "./componentes/Barra"
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import { Route, Routes } from "react-router-dom";
import { AuthPage } from "./Auth";
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



function App() {

  return (
    <>

        <header>
          <Navbar></Navbar>
        </header>
        <Routes>
        <Route path="/" element={<AuthPage><Inicio /></AuthPage>}/>
        <Route path="/armador" element={<AuthPage><Armadorpc /></AuthPage>} />
        <Route path="/busqueda" element={<Busqueda/>} />
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/carrito" element={<AuthPage><Carrito/></AuthPage>}/>
        <Route path="/favorito" element={<AuthPage><Favorito /></AuthPage>}/>
        <Route path="/cargar-producto" element={<AuthPage><NuevoProducto /></AuthPage>}/>

        </Routes>
        <a href="https://api.whatsapp.com/send/?phone=543804353826&text=Hola,+quiero+contactarme+con+ustedes!&type=phone_number&app_absent=0" className="bwsp" target="_blank"> <i><WhatsAppIcon sx={{fontSize: "35px"}}/></i> </a>

        <Footer></Footer>
    </>
  )
}

export default App
