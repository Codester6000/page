import MyCarousel from "./api"
import "./style.css"

function App() {

  return (
    <>
      <body>
        <header>
          <div><img src="modex.png" alt="modex" className="logo" /></div>
          <div style={{display:"flex", alignItems: "center"}}><input style={{flex: "1"}} type="text" placeholder="   Buscar Productos   "  className="buscar" /><button style={{marginLeft: "8px"}} className="lupa">🔍︎</button></div>
          {/* <div className="botones_3"> */}
          <button className="perfil" style={{ background: "#a111ad"}} ><img className="iconperfil" src="perfil.png" alt="user" style={{filter: "invert(100%)"}}  /> Ingresar</button>
          <button className="fav" style={{ background: "#a111ad"}} ><img className="iconfav"  src="fav.png" alt="corazon" style={{filter: "invert(100%)"}} /></button>
          <button className="carro" style={{ background: "#a111ad"}} ><img  className="iconcarro" src="carrito.png" alt="carrito" style={{filter: "invert(100%)"}} /></button>

        </header>
        <MyCarousel/>
        {/* <div className="contenedor"><MyCarousel/></div> */}
        <footer>
          <div></div>
          <div>
            <div className="cosas" ><img src="ubi.png" alt="ubicacion" className="ubi" /> Junin 688<img className="wsp" src="wsp.png" alt="whatsapp" />3834972132</div>
            <div> <img className="email" src="email.webp" alt="email" /> ventas@modex.com.ar </div>
            <div> <img src="instagram.png" alt="insta" className="insta" /> <img className="face" src="face.png" alt="face" /> modex.tecno</div>
          </div>
          <div></div>
        </footer>
      </body>
      <div className="">
      </div>
    </>
  )
}

export default App
