import { useState } from 'react'


function ArmadorPc() {

//variables para construir el armador
const [datos,setDatos] = useState([])
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
const auxMothers = [

    {"nombre":'Mother MSI B450M-A PRO MAX II (AM4)'},
    {"nombre":'Mother MSI B550M PRO-VDH (AM4)'},
    {"nombre":'Motherboard (1200) GIGABYTE H510M H V2'},
    {"nombre":'Motherboard (1200) GIGABYTE H510M S2H V3'},
    {"nombre":'Motherboard (1700) GIGABYTE B760M A ELIT AX DDR5'},
    {"nombre":'Motherboard (1700) GIGABYTE B760M AORUS ELITE X AX'},
    {"nombre":'Motherboard (1700) GIGABYTE B760M DS3H DDR4'},
    {"nombre":'Motherboard (1700) GIGABYTE B760M E DDR5'},
    {"nombre":'Motherboard (1700) GIGABYTE B760M GAMING DDR4'},
    {"nombre":'Motherboard (1700) GIGABYTE B760M H DDR4'},
    {"nombre":'Motherboard (1700) GIGABYTE B760M K DDR4'},
    {"nombre":'Motherboard (1700) GIGABYTE H610M H V2 DDR4'},
    {"nombre":'Motherboard (1700) GIGABYTE H610M K V2'},
    {"nombre":'Motherboard (1700) GIGABYTE Z790 UD AX DDR5'},
    {"nombre":'Motherboard (AM4) GIGABYTE A520M DS3H V2'},
    {"nombre":'Motherboard (AM4) GIGABYTE X570SI AORUS PRO AX'},
    {"nombre":'Motherboard (AM5) GIGA A620M GAMING X'},
    {"nombre":'Motherboard (AM5) GIGA X670 GAMING X AX V2'},
    {"nombre":'Motherboard (AM5) GIGABYTE A620M DS3H'},
    {"nombre":'Motherboard (AM5) GIGABYTE A620M S2H'},
    {"nombre":'Motherboard (AM5) GIGABYTE B650M A ELITE AX DDR5'},
    {"nombre":'Motherboard (AM5) GIGABYTE B650M DS3H DDR5'},
    {"nombre":'Motherboard (AM5) GIGABYTE B650M K DDR5'},
    {"nombre":'Motherboard GIGABYTE A520M K V2 AM4 DDR4'},
    {"nombre":'Motherboard GIGABYTE B550 AORUS ELITE V2 AM4 DDR4'},
    {"nombre":'Motherboard GIGABYTE B550M DS3H Ultra Durable AM4 DDR4'},
    {"nombre":'Motherboard GIGABYTE B550M K AM4 DDR4'},
    {"nombre":'Motherboard GIGABYTE B650M H AM5 DDR5'},
    {"nombre":'Motherboard GIGABYTE B760M DS3H LGA1700 DDR5'},
    {"nombre":'Motherboard GIGABYTE H410M H V2 Ultra Durable LGA1200 DDR4'},
    {"nombre":'Motherboard GIGABYTE H510M K V2 LGA1200 DDR4'},
    {"nombre":'Motherboard GIGABYTE H610M S2H Ultra Durable LGA1700 DDR4'},
    {"nombre":'Motherboard MSI A520M-A PRO AM4 DDR4'},
    {"nombre":'Motherboard MSI B450M PRO-VDH MAX AM4 DDR4'},
    {"nombre":'Motherboard MSI B550M PRO-VDH WIFI AM4 DDR4'},
    {"nombre":'Motherboard MSI B650 GAMING PLUS WIFI AM5 DDR5'},
    {"nombre":'Motherboard MSI B650M GAMING PLUS WIFI AM5 DDR5'},
    {"nombre":'Motherboard MSI MAG X670E TOMAHAWK WIFI AM5 DDR5'},
    {"nombre":'Motherboard MSI MAG Z790 TOMAHAWK MAX WIFI LGA1700'},
    {"nombre":'Motherboard MSI PRO A620M-E AM5 DDR5'},
    {"nombre":'Motherboard MSI PRO B650M-P AM5 DDR5'},
    {"nombre":'Motherboard MSI PRO B760M-P LGA1700 DDR4'},
    {"nombre":'Motherboard MSI PRO B760M-P LGA1700 DDR5'},
    {"nombre":'Motherboard MSI PRO H510M-B LGA1200 DDR4 (Solo 10ma Gen)'},
    {"nombre":'Motherboard MSI PRO H610M-G LGA1700 DDR4'},
    {"nombre":'Motherboard MSI PRO H610M-S LGA1700 DDR4'},

 ]