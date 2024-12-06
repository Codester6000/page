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


import Card from "@mui/joy/Card";
import Container from "@mui/material/Container";
import Grid from "@mui/joy/Grid";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import AspectRatio from "@mui/joy/AspectRatio";
import Button from "@mui/material/Button";
import IconButton from "@mui/joy/IconButton";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import FavoriteIcon from "@mui/icons-material/Favorite";
import Pagination from "@mui/material/Pagination";
import { TextField } from "@mui/material";


function ArmadorPc() {
const { sesion } = useAuth();
const [productos,setProductos] =useState({
    productos:{
        "procesadores":[],
        "mothers":[],
        "placas":[],
        "almacenamiento":[],
        "memorias":[],
        "coolers":[],
        "fuentes":[],
        "gabinetes":[]
    }});

// Crear un índice
const crearIndice = (productos) => {
    const indice = {};
    for (const categoria in productos) {
      productos[categoria].forEach((producto) => {
        indice[producto.id_producto] = { ...producto, categoria };
      });
    }
    return indice;
  };
  
  // Crear el índice una vez
  const indiceProductos = crearIndice(productos.productos);
  
  // Búsqueda rápida
  const buscarPorId = (id) => indiceProductos[id] || null;
const [tipo,setTipo] = useState("procesadores")
const [elecciones, setElecciones] = useState({procesador:"",mother:"",placa:"",memorias:[],almacenamiento:[],coolers:[],fuente:"",gabinete:""});
const getArmador = async () => {
    let query = `?`;
        if (elecciones.procesador !="") {
            query += `&procesador_id=${elecciones.procesador}`;
        }
        if (elecciones.mother !="") {
            query += `&motherboard_id=${elecciones.mother}`;
        }
        if (elecciones.memorias.length>0) {
            query += `&memoria_id=${elecciones.memorias[0]}`;
        }

    try {
        const response = await fetch(
            `http://localhost:3000/armador${query}`,
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
        } else {
            console.error("Error al obtener productos:", response.status);
        }
    } catch (error) {
    }
};
useEffect(() => {
    getArmador();
    
    
}, [elecciones]);

const handleSeleccionar = (id_producto) =>{
    switch (tipo) {
        case 'procesadores':
            setElecciones({...elecciones,procesador:id_producto})
            setTipo('motherboards')
            break;
        case 'motherboards':
            setElecciones({...elecciones,mother:id_producto})
            setTipo('gpus')
            break;
        case 'gpus':
            setElecciones({...elecciones,placa:id_producto})
            setTipo('memorias')
            break;
        case 'memorias':
            setElecciones({...elecciones,memorias:[...elecciones.memorias,id_producto]})
            break;
        case 'almacenamiento':
            setElecciones({...elecciones,almacenamiento:[...elecciones.almacenamiento,id_producto]})
            break;
        case 'fuentes':
            setElecciones({...elecciones,fuente:id_producto})
            setTipo('gabinetes')
            break;
        case 'gabinetes':
            setElecciones({...elecciones,gabinete:id_producto})
            break;
    
        default:
            break;
    }


}
return(
    <Container>

    <div className="containerArmador">
        <div className="armador">
            <div className="ladoIzquierdoArmador">
                <div className="tipo">
                    <div className="procesador" onClick={()=>setTipo("procesadores")}><img src={icono_cpu}  /></div>
                    <div className="motherboard" onClick={()=>setTipo("motherboards")}><img src={icono_mother}  /></div>
                    <div className="gpu" onClick={()=>setTipo("gpus")}><img src={icono_gpu}  /></div>
                    <div className="memoria" onClick={()=>setTipo("memorias")}><img src={icono_ram}  /></div>
                    <div className="almacenamiento" onClick={()=>setTipo("almacenamiento")}><img src={icono_hdd}  /></div>
                    <div className="psu" onClick={()=>setTipo("fuentes")}><img src={icono_psu}  /></div>
                    <div className="gabinete" onClick={()=>setTipo("gabinetes")}><img src={icono_gabinete}  /></div>
                </div>
                <div className="elecciones">
                    {console.log("aaaa")}
                    { Object.entries(elecciones).map(([categoria,valor])=>{
                        if(valor == 0){
                            return null
                        }
                        if(typeof(valor) == "object"){
                            return valor.map((productoArreglo,index) =>{
                                const producArreglo = buscarPorId(productoArreglo)
                                console.log(producArreglo)
                                return (
                                    <div className="productoCarritoArmador" key={`${productoArreglo}+${index}`}> {producArreglo.nombre} </div>
                                )
                            })
                        }else {

                            
                            const produc = buscarPorId(valor)
                            return (
                                <div className="productoCarritoArmador" key={categoria}> {produc.nombre} </div>
                            )

                        }
                    })}
                </div>
            </div>
            <div className="productos">
                <Grid container spacing={5} style={{ marginTop: "20px" }}>
            {
                            productos.productos[`${tipo}`].map((producto, index) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={producto.id_producto}>
                                    <Card sx={{ width: 280, bgcolor: "#e0e0e0", height: 350 }} >
                                        <AspectRatio minHeight="120px" maxHeight="200px">
                                            <img
                                                src={producto.url_imagenes}
                                                alt={producto.nombre}
                                                loading="lazy"
                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                />
                                        </AspectRatio>
                                        <CardContent orientation="horizontal" sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                            <div>
                                                <Typography level="h4" sx={{ display: "-webkit-box", overflow: "hidden", WebkitBoxOrient: "vertical", WebkitLineClamp: 2, textOverflow: "ellipsis", fontWeight: "bold",}}>{producto.nombre}</Typography>
                                                <Typography>{producto.descripcion}</Typography>
                                                <Typography level="h3" sx={{ fontWeight: "xl", mt: 0.8 }}>${producto.precio_pesos_iva}</Typography>
                                                <div style={{ display: "flex", alignItems: "center", marginLeft: "auto" }}>
                                                    <Button variant="contained" onClick={()=>handleSeleccionar(producto.id_producto)} size="large" sx={{ ml: 3.5, my: 2, backgroundColor: "#a111ad", height: 45, borderRadius: "20px", fontSize: "0.75rem", objectFit: "contain", }}>Seleccionar</Button>
                                                    <IconButton variant="contained" size="large" sx={{
                                                        ml: 2, height: 45, width: 45, backgroundColor: "#a111ad", borderRadius: "50px", objectFit: "contain", color: "white",
                                                        "&:active": {
                                                            transform: "scale(0.95)",
                                                            transition: "transform 0.2s ease",
                                                        },
                                                        "&:hover": {
                                                            backgroundColor: "#9e2590",
                                                        },
                                                    }}
                                                    >
                                                        <FavoriteIcon />
                                                    </IconButton>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    </Grid>
                            ))
                        }  
                        </Grid>
            </div>
        </div>
    </div>
                        </Container>
)
}

export default ArmadorPc;