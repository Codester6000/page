import Navbar from "./componentes/Navbar"

// import { CustomizedInputBase } from "./componentes/Barra"
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import { Route, Routes } from "react-router-dom";
import { AuthPage } from "./Auth";


import "./styl.css"

import Login from "./componentes/Login"
import Register from "./componentes/Register"
import Footer from "./componentes/footer"
import Inicio from "./componentes/inicio";
import Busqueda from "./componentes/Busqueda";
import Carrito from "./componentes/Carrito";
import Favorito from "./componentes/Favorito";



function App() {

  return (
    <>
      <body>
        <header>
          <Navbar></Navbar>
        </header>
        <Routes>
        <Route path="/" element={<AuthPage><Inicio /></AuthPage>}/>

        <Route path="/busqueda" element={<Busqueda/>} />
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/carrito" element={<Carrito/>}/>
        <Route path="/favorito" element={<Favorito/>}/>

        </Routes>
      </body>
        <Footer></Footer>
    </>
  )
}

export default App
