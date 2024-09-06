import { useState } from 'react'


function ArmadorPc() {

//variables para construir el armador
const [procesadores,setProcesadores] = useState([])
const [mothers,setMothers] = useState([])
const [almacenamiento,setAlmacenamiento] = useState([])
const [memorias,setMemorias] = useState([])
const [placas,setPlacas] = useState([])
const [coolers,setCoolers] = useState([])
const [fuentes,setFuentes] = useState([])
const [gabinetes,setGabinetes] = useState([])
const [monitores,setMonitores] = useState([])
const [perifericos,setPerifericos] = useState([])

const maquetaElecciones = {
'procesadores': '',
'mothers': '',
'almacenamiento': '',
'memorias': '',
'placas': '',
'coolers': '',
'fuentes': '',
'gabinetes': '',
'monitores': '',
'perifericos': ''
}
const [elecciones,setElecciones] = useState(maquetaElecciones)

const [tipoComponente,setTipoComponente] = useState('procesadores')

// El nombre de los procesadores incluye el tipo de socket
const filtrarMothers = (tipoProcesador)=>{
    const nuevaListaMothers = mothers.filter((mother)=>{
        return mother.nombre.includes(tipoProcesador)
}) 
setMothers(nuevaListaMothers)
}
// el nombre de las placas madres incluye tanto el socket como que DDR es 
const filtrarProcesadores = (tipoMother) =>{
    const nuevaListaProcesadores = procesadores.filter((procesador)=>{
        return procesador.nombre.includes(tipoMother)
    })
    setProcesadores(nuevaListaProcesadores)
}

const filtrarMemorias = (tipoMother) => {

    const nuevaListaMemorias = memorias.filter((memoria) => {
        return memoria.nombre.includes(tipoMother)
    })
}

  return (
    <>
    <div className="menu">
        <div className="componentes"></div>
        <div className="info">
            (400 watts)      Total: $0000
        </div>
        <div className="rendimiento">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Assumenda voluptatum sed, eaque iure veritatis nemo deleniti minima quisquam accusamus eos ex! Ab ipsa, ratione nihil aliquid officia libero laborum temporibus!
            {/* aca tendria que verse reflejado el rendimiento que nos dara esta pc */}
        </div>
    </div>
    <div className="listadoComponentes">
        {elecciones.procesadores == '' ? a : b}
    </div>


    
    </>
  )
}

export default ArmadorPc