import Carousel from "./Carousel"
import ProductCard from "./ProductCard"
import "../styl.css"
import Categorias from "./Categorias";
import Card from "@mui/joy/Card";

function Inicio() {
    return( <div className="cont-web" >
        <div className="carusel" >
          <Carousel></Carousel>
        </div>
        <div className="cont-doble">

              <div className="barra-lateral">
                  <Card sx={{ bgcolor: "#9e2590" }}>
                      <Categorias />
                  </Card>
              </div>
              <div className="mostrar-prod">
                  <ProductCard />
              </div>

        </div>
      </div>)
}
export default Inicio;