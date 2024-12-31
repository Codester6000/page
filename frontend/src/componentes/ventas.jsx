import  React,{ useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import '../ventas.css'
import dinero from '../assets/dineroVentas.svg'
import carrito from '../assets/carritoVentas.svg'
import persona from '../assets/personaVentas.svg'
import { useAuth } from "../Auth";
const Ventas = () =>{
    const { sesion } = useAuth();
    const url = 'http://192.168.1.8:3000'
    const columnas = [
        { field: 'id', headerName: 'ID Pedido', width: 100 },
        { field: 'username', headerName: 'Cliente', width: 150 },
        { field: 'fecha_finalizada', headerName: 'Fecha', width: 170, type: 'dateTime',valueGetter: (value) => value && new Date(value),},
        {field: 'estado',headerName: 'Estado',width: 120,cellClassName:'estado'},
        {field: 'productos',headerName: 'Productos',width: 350},
        {field: 'total_a_pagar',headerName: 'Total',width: 350,}
    ]
    const paginationModel = { page: 0, pageSize: 5 };

    const [rows,setRows] = useState([])
    const [stats, setStats] = useState({})
    const getVentas = async ()=>{
        const response = await fetch(`${url}/carrito/ventas`,{
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sesion.token}`,
            },
        })
        if (response.ok){
            let filas = []
            const resultado = await response.json()
            resultado.map((venta)=>{
                filas.push(venta)
            })
            setRows(filas)
        }
        const statsResponse =  await fetch(`${url}/carrito/stats`,{
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sesion.token}`,
            },
        })

        if(statsResponse.ok){
            const resultadoStats = await statsResponse.json()
            setStats(resultadoStats[0])
        }
    }

    useEffect(()=>{
        getVentas()
    },[])

    return (
        <div className="ventasContainer">
            <h1>Panel de Ventas</h1>
            <div className="cardsVentas">
                <div className="cardventa">
                    <p>Total vendido</p>
                    <h3>{stats.total_vendido}</h3>
                    <img src={dinero} alt="" className="iconoCardVenta" />
                </div>
                <div className="cardventa">
                    <p>Pedidos</p>
                    <h3>{stats.pedidos}</h3>
                    <img src={carrito} alt="" className="iconoCardVenta" />
                </div>
                <div className="cardventa">
                    <p>Clientes</p>
                    <h3>{stats.clientes}</h3>
                    <img src={persona} alt="" className="iconoCardVenta" />
                </div>
            </div>

            <div className="tablaVentas">
                <DataGrid
                    columns={columnas}
                    rows={rows}
                    getRowHeight={() => 'auto'}
                    initialState={{ pagination: { paginationModel } }}
                    pageSizeOptions={[5, 10]}
                    checkboxSelection
                    sx={{ border: 0 ,
                        textAlign:'center'
                        ,
                        '& .estado':{
                            color:'green',
                            textAlign:'center',
                        }
                    }}
                />
            </div>
        </div>
    )
}



export default Ventas;