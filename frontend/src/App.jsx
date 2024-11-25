import Navbar from "./componentes/Navbar"
import InstagramIcon from '@mui/icons-material/Instagram';
// import { CustomizedInputBase } from "./componentes/Barra"
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';


import "./styl.css"
import Carousel from "./componentes/Carousel";
import ProductCard from "./componentes/ProductCard";
import MenuNavbar from "./componentes/MenuNavbar";
import Login from "./componentes/Login"
import Register from "./componentes/Register"

// IMPORTANTE HACER 
// npm install @mui/joy @emotion/react @emotion/styled
// npm install swiper     
// npm install @mui/lab   
// npm install @mui/material @mui/styled-engine-sc styled-components
// npm install @mui/icons-material

// Nota para mejora de front:
// Deberia de poner las cosas a mostrar dentro de una card content para así lograr los margenes a los costados deseados en base a la pagina de mercado libre


function App() {

  return (
    <>
      <body>
        <header>
          <Navbar></Navbar>
        </header>
        <div className="cont-web" >
          <div className="carusel" >
            <Carousel></Carousel>
          </div>
          <div className="cont-doble">
            <div className="barra-lateral"></div>
            <div className="mostrar-prod"><ProductCard></ProductCard></div>
          </div>
        </div>
        <Login></Login>
        <Register></Register>
        <footer style={{backgroundColor: "#FF7d21", height: "100px"}}>
          <div style={{color: "#fff", display: "flex", justifyContent: "center" , flexDirection: "column", alignItems: "center"}}>
            <div> Av. San Nicolás de Bari 743, F5300 La Rioja 3804353826</div>
            <div> modexserviciotecnico@gmail.com </div>
            <div> <InstagramIcon/> modex.lr</div>
          </div>
        </footer>
      </body>
      <div className="">
      </div>
    </>
  )
}

export default App
