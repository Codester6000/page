
import Carousel from "./Carousel"
import ProductCard from "./ProductCard"
import "../styl.css"


function Inicio() {
  

    return( <div className="cont-web" >
        <div className="carusel" >
          <Carousel></Carousel>
        </div>
        <div className="cont-doble">

            <div className="barra-lateral">

            </div>
            <div className="mostrar-prod">
                <ProductCard />
            </div>

        </div>
      </div>)
}
export default Inicio;