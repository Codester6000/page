import '../styles/portada.css';
export default function Portada(){
    return(
        <div>
            <div className="banner"></div>
            <div className="marcas">
                <div className="marca"><img src="/iconos/nvidia.png" alt="" className="margalogo" width={"100%"} /></div>
                <div className="marca"><img src="/iconos/radeon.png" alt="" className="margalogo"  width={"100%"}/></div>
                <div className="marca"><img src="/iconos/intel.png" alt="" className="margalogo" width={"60%"}/></div>
                <div className="marca"><img src="/iconos/amd.png" alt="" className="margalogo" width={"100%"}/></div>
            </div>

            <div className="nuevosIngresos">
                <div className="bloqueNI">
                    <h1>NUEVOS INGRESOS</h1>
                <div className="lineaNaranja"></div>
                </div>
                <div className="productosPortada"></div>
            </div>
            <div className="armados">
                <h2 className="armadosTitulo">ARMADOS</h2>
                <div className="productosPortada"></div>
            </div>

            <div className="nuevosIngresos">
                <div className="bloqueNI">
                    <h1>NOTEBOOKS</h1>
                <div className="lineaNaranja"></div>
                </div>
                <div className="productosPortada"></div>
            </div>
        </div>
    )
}   
