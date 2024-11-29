import { useState, useEffect } from 'react'
import '../styleArmador.css'
import icono_cpu from "/iconos/armadorIconos/cpu.png"
import icono_gpu from "/iconos/armadorIconos/gpu.png"
import icono_psu from "/iconos/armadorIconos/psu.png"
import icono_ram from "/iconos/armadorIconos/ram.png"
import icono_hdd from "/iconos/armadorIconos/hdd.png"
import icono_mother from "/iconos/armadorIconos/motherboard.png"
import icono_gabinete from "/iconos/armadorIconos/gabinete.png"
import { useAuth } from '../Auth'

function ArmadorPc() {
const { sesion } = useAuth();
const [productos,setProductos] =useState(
    {
        procesadores:[],
        mothers:[],
        placas:[],
        almacenamiento:[],
        memorias:[],
        coolers:[],
        fuentes:[],
        gabinetes:[]
    }
);
const [tipo,setTipo] = useState("procesadores")
const [elecciones, setElecciones] = useState({procesador:"",mother:"",placas:"",almacenamiento:[],memorias:[],coolers:[],fuente:"",gabinete:""});
const getArmador = async () => {
    try {
        const response = await fetch(
            `http://localhost:3000/armador`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${sesion.token}`,
                },
            }
        );
        
        if (response.ok) {
            const data = await response.json();
            setProductos(data)
            console.log(productos)
        } else {
            console.error("Error al obtener productos:", response.status);
        }
    } catch (error) {
        console.error("Error en la solicitud:", error);
    }
};
useEffect(() => {
    getArmador();
}, [elecciones]);
return(
    <div className="containerArmador">
        <div className="armador">
            <div className="tipo">
                <div className="procesador"><img src={icono_cpu}  /></div>
                <div className="motherboard"><img src={icono_mother}  /></div>
                <div className="gpu"><img src={icono_gpu}  /></div>
                <div className="memoria"><img src={icono_ram}  /></div>
                <div className="almacenamiento"><img src={icono_hdd}  /></div>
                <div className="psu"><img src={icono_psu}  /></div>
                <div className="gabinete"><img src={icono_gabinete}  /></div>

            </div>
            <div className="productos">
                {productos[tipo].map((producto)=>console.log(producto))}
            </div>
        </div>
    </div>
)
}

export default ArmadorPc;