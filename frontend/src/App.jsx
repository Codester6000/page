
import "./stylo.css"

function App() {

  return (
    <>
      <body>
        <header>
          <img src="modex.png" alt="modex" className="logo" />
          <input type="text" placeholder="   Buscar Productos   "  className="buscar" /><button className="lupa">🔍︎</button>
          <button className="perfil" style={{ background: "#a111ad"}} ><img className="iconperfil" src="perfil.png" alt="user" style={{filter: "invert(100%)"}}  /> Ingresar</button>
          <button className="fav" style={{ background: "#a111ad"}} ><img className="iconfav"  src="fav.png" alt="corazon" style={{filter: "invert(100%)"}} /></button>
          <button className="carro" style={{ background: "#a111ad"}} ><img  className="iconcarro" src="carrito.png" alt="carrito" style={{filter: "invert(100%)"}} /></button>

        </header>
        
        <footer>
          <div></div>
          <div>
            <div className="cosas" ><img src="ubi.png" alt="ubicacion" className="ubi" /> Av. San Nicolás de Bari 743, F5300 La Rioja<img className="wsp" src="wsp.png" alt="whatsapp" />3804353826</div>
            <div> <img className="email" src="email.webp" alt="email" /> modexserviciotecnico@gmail.com </div>
            <div> <img src="instagram.png" alt="insta" className="insta" /> <img className="face" src="face.png" alt="face" /> modex.lr</div>
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
