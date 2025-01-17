import React, { useEffect, useState } from "react";

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
import editSvg from '../assets/edit.svg'
import carritoSVG from '../assets/carrito.svg'
import corazonSVG from '../assets/corazon.svg'
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import { useAuth,AuthRol } from "../Auth";
import { Alert, AlertTitle, Box, MenuItem, Skeleton, Snackbar, TextField } from "@mui/material";
import {useLocation, useNavigate} from "react-router-dom"

import ShoppingCart from "@mui/icons-material/ShoppingCart";
import FormControl from '@mui/material/FormControl';
import '../producto.css'
import {motion} from 'framer-motion'
import SkeletonProd from "./SkeletonProd";


export default function ProductCard() {
    const url = 'https://api.modex.com.ar'
    const [productos, setProductos] = useState([]);
    const [pagina, setPagina] = useState(1);
    const itemPorPagina = 32;
    const [totales, setTotales] = useState(0);
    const [nombre, setNombre] = useState("");
    const [categoria, setCategoria] = useState("");
    const [precioMax, setPrecioMax] = useState("");
    const [precioMin, setPrecioMin] = useState("");
    const [favoritos, setFavoritos] = useState([])
    const { sesion,logout } = useAuth();
    const [alerta, setAlerta] = useState(false)
    const [alertaFav, setAlertaFav] = useState(false)
    const [carrito, setCarrito] = useState([]);
    const [favorito, setFavorito] = useState([]);
    const [productoSeleccionado,setProductoSeleccionado] = useState("");



    const construirQuery = () => {
        let query = `offset=${(pagina - 1) * itemPorPagina}&limit=${itemPorPagina}`;
        if (precioMin) query += `&precio_gt=${precioMin}`;
        if (precioMax) query += `&precio_lt=${precioMax}`;
        if (categoria) query += `&categoria=${categoria}`;
        if (nombre) query += `&nombre=${nombre}`;
        return query;
    };

    const handleAgregarImagen = async (producto_id) =>{
        const url_imagen = window.prompt("Ingresa la url de la nueva imagen")
        if (url_imagen.length > 5){
            try{
                const response = await fetch(
                    `${url}/productos/imagen/${producto_id}`,{
                        method:"POST",
                        headers:{
                            "Content-Type":"application/json",
                        Authorization: `Bearer ${sesion.token}`,
                        },
                        body:JSON.stringify({"url":url_imagen})
                    }
                )
            }catch(error){
                console.error(error)
            }
        }
    }

    const handleAgregarDetalle = async (producto_id) =>{
        const detalle = window.prompt("Ingresa el detalle nuevo")
        if (detalle.length > 5){
            try{
                const response = await fetch(
                    `${url}/productos/detalle/${producto_id}`,{
                        method:"POST",
                        headers:{
                            "Content-Type":"application/json",
                        Authorization: `Bearer ${sesion.token}`,
                        },
                        body:JSON.stringify({"detalle":detalle})
                    }
                )
            }catch(error){
                console.error(error)
            }
        }
    }
    const agregarCarrito = async (producto_id) => {
        if (carrito.includes(producto_id)) {
            console.log("El producto ya está en el carrito");
            return;
        }

        try {
            const response = await fetch(
                `${url}/carrito`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${sesion.token}`,
                    },
                    body: JSON.stringify({ "id_producto": producto_id,"cantidad":1 })
                }
            );
            if (response.ok) {
                const mensaje = await response.json()
                console.log(mensaje)
                setCarrito([...carrito, producto_id])
            } else {
                console.log(response)
                console.log(producto_id)
            }
        } catch (error) {
            navigate("/login")
            console.log("aaaa")
            console.log(error)
        }
    };

  const agregarFavorito = async (producto_id) => {
    if (favorito.includes(producto_id)) {
        console.log("El producto ya está en favorito");
        return;
    }
    
        try {
            const response = await fetch(
                `${url}/favorito`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${sesion.token}`,
                    },
                    body: JSON.stringify({ "id_producto": producto_id,"cantidad":1 })
                }
            );
            if (response.ok) {
                const mensaje = await response.json()
                console.log(mensaje)
                setFavorito([...favorito, producto_id])
            } else {
                console.log(response)
                console.log(producto_id)
            }
        } catch (error) {
            navigate("/login")
            console.log("aaaa")
            console.log(error)
        }
    };

    const estaEnFavoritos = (producto_id) => favorito.includes(producto_id);

    const getProductos = async () => {
        try {
            const query = construirQuery();
            const response = await fetch(
                `${url}/productos?${query}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setTotales(data.cantidadProductos);
                if (data.productos && Array.isArray(data.productos)) {
                    setProductos(data.productos);
                } else {
                    console.error("Estructura de datos incorrecta:", data);
                }
            } else {
                
                localStorage.removeItem('sesion')
                logout()
                console.error("Error al obtener productos:", response.status);
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
        }
    };

    const getProductoById = async (id_producto_seleccionado) =>{
        try {
            const response = await fetch(
                `${url}/productos/${id_producto_seleccionado}`,
                {
                    method:"GET",
                    headers:{
                        "Content-Type": "application/json",
                        
                    },
                }
            )

            if (response.ok){
                const resultado = await response.json()
                setProductoSeleccionado(resultado.datos[0])

            }
        } catch (error) {
            console.error(error)
        }

    }

    useEffect(() => {
        getProductos();
    }, [pagina]);
    return (
        <Container sx={{}}>
            {/* <SkeletonProd></SkeletonProd> */}
            <Card sx={{ bgcolor: "#FFfff", padding: 5, marginX: -10, marginY: 5 }}>
                <Grid className='filtros'>

                    <Typography level="h3">Filtrar por: </Typography>
                    <br />
                    <TextField label="Buscar por Nombre" name="nombre" variant="outlined" size="small" value={nombre} onChange={(e) => setNombre(e.target.value)} style={{ marginRight: "10px"}} className='inputFiltro' /> 
                    <TextField select label="Buscar por Categoria" name="categoria" variant="outlined" size="small" value={categoria} onChange={(e) => setCategoria(e.target.value)} style={{ marginRight: "10px", minWidth:"200px"  }} className='inputFiltro' >
                        <MenuItem value="Computadoras">Computadoras</MenuItem>
                        <MenuItem value="All In One">All In One</MenuItem>
                        <MenuItem value="Hardware">Hardware</MenuItem>
                        <MenuItem value="Coolers">Coolers</MenuItem>
                        <MenuItem value="Seguridad">Seguridad</MenuItem>
                        <MenuItem value="Camaras Wifi">Camaras Wifi</MenuItem>
                        <MenuItem value="Imagen">Imagen</MenuItem>
                        <MenuItem value="Accesorios">Accesorios</MenuItem>
                        <MenuItem value="Conectividad">Conectividad</MenuItem>
                        <MenuItem value="Extensores">Extensores</MenuItem>
                        <MenuItem value="Fuentes">Fuentes</MenuItem>
                        <MenuItem value="Audio">Audio</MenuItem>
                        <MenuItem value="Auriculares">Auriculares</MenuItem>
                        <MenuItem value="Base Notebook">Base Notebook</MenuItem>
                        <MenuItem value="Insumos">Insumos</MenuItem>
                        <MenuItem value="Botellas de Tinta">Botellas de Tinta</MenuItem>
                        <MenuItem value="Gabinetes">Gabinetes</MenuItem>
                        <MenuItem value="Camaras IP">Camaras IP</MenuItem>
                        <MenuItem value="Candado">Candado</MenuItem>
                        <MenuItem value="Cartuchos de Tinta">Cartuchos de Tinta</MenuItem>
                        <MenuItem value="Cintas">Cintas</MenuItem>
                        <MenuItem value="Software">Software</MenuItem>
                        <MenuItem value="Garantia">Garantia</MenuItem>
                        <MenuItem value="Almacenamiento">Almacenamiento</MenuItem>
                        <MenuItem value="Discos Internos SSD">Discos Internos SSD</MenuItem>
                        <MenuItem value="Placas de Video">Placas de Video</MenuItem>
                        <MenuItem value="Perifericos">Perifericos</MenuItem>
                        <MenuItem value="Camaras Web">Camaras Web</MenuItem>
                        <MenuItem value="Discos Externos">Discos Externos</MenuItem>
                        <MenuItem value="Discos Externos SSD">Discos Externos SSD</MenuItem>
                        <MenuItem value="Discos Internos">Discos Internos</MenuItem>
                        <MenuItem value="Docking">Docking</MenuItem>
                        <MenuItem value="Proyectores">Proyectores</MenuItem>
                        <MenuItem value="Estuches">Estuches</MenuItem>
                        <MenuItem value="Fundas">Fundas</MenuItem>
                        <MenuItem value="PC de Escritorio">PC de Escritorio</MenuItem>
                        <MenuItem value="Notebooks Corporativo">Notebooks Corporativo</MenuItem>
                        <MenuItem value="Networking">Networking</MenuItem>
                        <MenuItem value="Hubs">Hubs</MenuItem>
                        <MenuItem value="Impresoras">Impresoras</MenuItem>
                        <MenuItem value="Impresoras Inkjet">Impresoras Inkjet</MenuItem>
                        <MenuItem value="Impresoras de Sistema Continuo">Impresoras de Sistema Continuo</MenuItem>
                        <MenuItem value="Impresoras Multifunción">Impresoras Multifunción</MenuItem>
                        <MenuItem value="Impresoras de Tickets">Impresoras de Tickets</MenuItem>
                        <MenuItem value="Impresoras Laser">Impresoras Laser</MenuItem>
                        <MenuItem value="Impresoras Matricial">Impresoras Matricial</MenuItem>
                        <MenuItem value="Joysticks">Joysticks</MenuItem>
                        <MenuItem value="Notebooks Consumo">Notebooks Consumo</MenuItem>
                        <MenuItem value="Accesorios Videojuegos">Accesorios Videojuegos</MenuItem>
                        <MenuItem value="Maletines">Maletines</MenuItem>
                        <MenuItem value="Memorias">Memorias</MenuItem>
                        <MenuItem value="Memorias Notebook">Memorias Notebook</MenuItem>
                        <MenuItem value="Memorias PC">Memorias PC</MenuItem>
                        <MenuItem value="Microfonos">Microfonos</MenuItem>
                        <MenuItem value="Mochilas">Mochilas</MenuItem>
                        <MenuItem value="Monitores">Monitores</MenuItem>
                        <MenuItem value="Motherboards">Motherboards</MenuItem>
                        <MenuItem value="Mouses">Mouses</MenuItem>
                        <MenuItem value="Mouse Pad">Mouse Pad</MenuItem>
                        <MenuItem value="Nvrs">Nvrs</MenuItem>
                        <MenuItem value="Parlantes">Parlantes</MenuItem>
                        <MenuItem value="Pen Drive">Pen Drive</MenuItem>
                        <MenuItem value="Procesadores">Procesadores</MenuItem>
                        <MenuItem value="Toners">Toners</MenuItem>
                        <MenuItem value="Papeleria">Papeleria</MenuItem>
                        <MenuItem value="Rollos">Rollos</MenuItem>
                        <MenuItem value="Routers">Routers</MenuItem>
                        <MenuItem value="Switches">Switches</MenuItem>
                        <MenuItem value="Muebles">Muebles</MenuItem>
                        <MenuItem value="Sillas">Sillas</MenuItem>
                        <MenuItem value="Memorias Flash">Memorias Flash</MenuItem>
                        <MenuItem value="Teclados">Teclados</MenuItem>
                        <MenuItem value="Volantes">Volantes</MenuItem>
                        <MenuItem value="Electrodomesticos y tv">Electrodomesticos y tv</MenuItem>
                        <MenuItem value="Limpieza y mantenimiento">Limpieza y mantenimiento</MenuItem>
                        <MenuItem value="Repuestos">Repuestos</MenuItem>
                        <MenuItem value="Punto de venta">Punto de venta</MenuItem>
                        <MenuItem value="Domotica - smart house">Domotica - smart house</MenuItem>
                        <MenuItem value="Disqueteras y lectores zip">Disqueteras y lectores zip</MenuItem>
                        <MenuItem value="Fiscal epson">Fiscal epson</MenuItem>
                        <MenuItem value="Imp. de aguja epson">Imp. de aguja epson</MenuItem>
                        <MenuItem value="Estabilizadores">Estabilizadores</MenuItem>
                        <MenuItem value="Maquinas, herram. y repuestos">Maquinas, herram. y repuestos</MenuItem>
                        <MenuItem value="Fax">Fax</MenuItem>
                        <MenuItem value="Bolsos fundas y maletines">Bolsos fundas y maletines</MenuItem>
                        <MenuItem value="Grabadoras cd / dvd">Grabadoras cd / dvd</MenuItem>
                        <MenuItem value="Discos rigidos hdd sata server">Discos rigidos hdd sata server</MenuItem>
                        <MenuItem value="Pilas y cargadores">Pilas y cargadores</MenuItem>
                        <MenuItem value="Backup">Backup</MenuItem>
                        <MenuItem value="Lector de codigos">Lector de codigos</MenuItem>
                        <MenuItem value="Imp laser negro">Imp laser negro</MenuItem>
                        <MenuItem value="Mother + micro">Mother + micro</MenuItem>
                        <MenuItem value="Imp mf c/sist. cont.">Imp mf c/sist. cont.</MenuItem>
                        <MenuItem value="Imp mf laser negro">Imp mf laser negro</MenuItem>
                        <MenuItem value="Rack">Rack</MenuItem>
                        <MenuItem value="Pasta termica">Pasta termica</MenuItem>
                        <MenuItem value="Streaming">Streaming</MenuItem>
                        <MenuItem value="Escaner">Escaner</MenuItem>
                        <MenuItem value="Servidores">Servidores</MenuItem>
                        <MenuItem value="Sillas de oficina">Sillas de oficina</MenuItem>
                        <MenuItem value="Iluminacion led">Iluminacion led</MenuItem>
                        <MenuItem value="Ups">Ups</MenuItem>
                        <MenuItem value="1700">1700</MenuItem>
                        <MenuItem value="am4">am4</MenuItem>
                        <MenuItem value="1200">1200</MenuItem>
                        <MenuItem value="am5">am5</MenuItem>
                        <MenuItem value="DDR4">DDR4</MenuItem>
                        <MenuItem value="DDR5">DDR5</MenuItem>
                        <MenuItem value="General">General</MenuItem>
                        <MenuItem value="Notebook">Notebook</MenuItem>
                        <MenuItem value="Impresora">Impresora</MenuItem>
                        <MenuItem value="Monitor">Monitor</MenuItem>
                        <MenuItem value="Consola">Consola</MenuItem>
                    </TextField>
                    <TextField label="Minimo Precio" name="precioMin" variant="outlined" size="small" value={precioMin} onChange={(e) => setPrecioMin(e.target.value)} style={{ marginRight: "10px" }} className='inputFiltro'/>
                    <TextField label="Maximo Precio" name="precioMax" variant="outlined" size="small" value={precioMax} onChange={(e) => setPrecioMax(e.target.value)} style={{ marginRight: "10px" }} className='inputFiltro'/>
                    <Button variant="contained" sx={{ backgroundColor: "#a111ad" }} onClick={() => { setPagina(1); getProductos(); }}>
                        Aplicar Filtros
                    </Button>
                </Grid>
                <Grid container spacing={5} style={{ marginTop: "20px" }} >
                    {productos.length > 0 ? (
                        productos.map((producto, index) => (
                            <Grid xs={12} sm={6} md={4} lg={3} key={producto.id_producto} className='productosLista' onClick={()=>{getProductoById(producto.id_producto)}} >
                                <Card sx={{ width: 280, bgcolor: "#e0e0e0", height: 350 }}  >
                                    <div className="badge">{(producto.nombre_proveedor == 'air') ? <img src="/badges/24HS.png" alt="" /> : (producto.nombre_proveedor == 'elit') ? <img src="/badges/5_DIAS.png" alt="" /> : <img src="/badges/LOCAL.png" alt="" />} </div>
                                    <AuthRol rol="2">
                                        <div className="editar">
                                            <img src={editSvg} alt="" onClick={()=>handleAgregarImagen(producto.id_producto)}/>

                                        </div>
                                    </AuthRol>
                                    <AspectRatio minHeight="120px" maxHeight="200px">
                                        <img
                                            src={producto.url_imagenes[producto.url_imagenes.length -1]}
                                            alt={producto.nombre}
                                            loading="lazy"
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                    </AspectRatio>
                                    <CardContent orientation="horizontal" sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                        <div>
                                            <Typography level="h4" sx={{ display: "-webkit-box", overflow: "hidden", WebkitBoxOrient: "vertical", WebkitLineClamp: 2, height:'65px',textOverflow: "ellipsis", fontWeight: "bold", }}>{producto.nombre}</Typography>
                                            <Typography level="h3" sx={{ fontWeight: "xl", mt: 0.8 }}>{Number(producto.precio_pesos_iva_ajustado).toLocaleString('es-ar', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits:0
})}</Typography>
                                            <div style={{ display: "flex", alignItems: "center", marginLeft: "auto" }}>
                                                <Button variant="contained" size="large" onClick={() => {agregarCarrito(producto.id_producto); setAlerta(true)}} startIcon={<AddShoppingCartIcon />} sx={{ ml: 2, my: 2, backgroundColor: "#a111ad", height: 45, borderRadius: "20px", fontSize: "0.75rem", objectFit: "contain", }}>Añadir al Carro</Button>
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
                                                    onClick={() => {agregarFavorito(producto.id_producto); setAlertaFav(true)}}
                                                >
                                                    {estaEnFavoritos(producto.id_producto) ? (
                                                        <FavoriteIcon sx={{ color: "orange" }} />
                                                    ) : (
                                                        <FavoriteIcon />
                                                    )}
                                                </IconButton>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                
                        <SkeletonProd></SkeletonProd>
                        // <Typography>Despues pongo un mensaje de error o skeleton</Typography>

                    )}

                  
                </Grid>
                <div className="productoSeleccionado" >
                    {productoSeleccionado != "" && <div className="prSeleccionadoCard" >
                        <div className="prImagen">
                            <img src={productoSeleccionado.url_imagenes[productoSeleccionado.url_imagenes.length -1]} alt="" />
                        </div>
                       <div className="prInfo">
                           <button className="cerrar" onClick={()=>setProductoSeleccionado("")}>X</button>
                           <h2 className="nombreProducto">
                               {productoSeleccionado.nombre}
                           </h2>
                           <p className="prPrecio">
                           {Number(productoSeleccionado.precio_pesos_iva_ajustado).toLocaleString('es-ar', {
                               style: 'currency',
                               currency: 'ARS',
                               maximumFractionDigits:0
                           })}
                           </p>
                           <p className="prDescripcion">
                           {productoSeleccionado.detalle}
                           <AuthRol rol="2">
                                        <div className="editarDetalle">
                                            <img src={editSvg} alt="" onClick={()=>handleAgregarDetalle(productoSeleccionado.id_producto)}/>
                                        </div>
                            </AuthRol>
                           </p>
                           
                           <button className="prAddCarrito" onClick={() => {agregarCarrito(productoSeleccionado.id_producto); setAlerta(true)}}>
                            <img src={carritoSVG} alt="" />
                            <p>agregar al carrito</p>
                           </button>
                           <button className="prAddFav" onClick={() => {agregarFavorito(productoSeleccionado.id_producto); setAlertaFav(true)}}>
                           <img src={corazonSVG} alt="" />
                           <p>agregar a favoritos</p>
                           </button>
                       </div>

                    </div> }
                </div>
                <Snackbar
                        open={alerta}
                        autoHideDuration={2000}
                        onClose={() => setAlerta(false)}
                        variant="solid"
                    >
                    <Alert size="large" severity="success" icon={<AddShoppingCartIcon sx={{fontSize: "2rem", color:"white"}}/>}
                    sx={{
                        backgroundColor: "#a111ad", color: "white", fontSize: "1rem", padding: "12px", display: "flex", alignItems: "center", borderRadius: 3
                    }}>
                        El producto fué Añadido al Carrito
                    </Alert>
                </Snackbar>
                <Snackbar
                        open={alertaFav}
                        autoHideDuration={2000}
                        onClose={() => setAlertaFav(false)}
                        variant="solid"
                    >
                    <Alert size="large" severity="success" icon={<FavoriteIcon sx={{fontSize: "2rem", color:"white"}}/>} 
                    sx={{
                        backgroundColor: "#a111ad", color: "white", fontSize: "1rem", padding: "12px", display: "flex", alignItems: "center", borderRadius: 3
                    }}>
                        El producto fué Añadido a Favorito
                    </Alert>
                </Snackbar>
                <Pagination count={Math.ceil(totales / itemPorPagina)} pagina={pagina} onChange={(e, value) => setPagina(value)} color="primary" sx={{
                    mt: 3, display: "flex", justifyContent: "center",
                    "& .MuiPaginationItem-root": {
                        color: "#a111ad",
                    },
                    "& .Mui-selected": {
                        backgroundColor: "#a111ad",
                        color: "white",
                    },
                    "& .MuiPaginationItem-root:hover": {
                        backgroundColor: "#d17dcf",
                    }
                }} />
            </Card>
        </Container>
    );
}