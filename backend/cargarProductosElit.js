import { db, conectarDB } from './database/connectionMySQL.js'
conectarDB()
console.log('aaaaa')
const getElit = async () => {

    const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
    
        const raw = JSON.stringify({
          user_id: 23363,
          token: "3f13t8v309t"
        });
    
        const requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: raw,
          redirect: 'follow'
        };

    let listaProductos = []
    let offset = 0

    
    //como offset no puede ser 0 en los url lo tenemos que llamar de difereten manera la primera vez que con la segunda
    const response = await fetch("https://clientes.elit.com.ar/v1/api/productos?limit=100", requestOptions)
    if (response.status == 200){
        const resultado = await response.json()
        listaProductos.push(resultado.resultado)
        const total_productos = resultado.paginador.total
        offset += 100
        // hacemos peticiones hasta consumir todos los productos de elit
        while (offset < total_productos){
            const response = await fetch(`https://clientes.elit.com.ar/v1/api/productos?limit=100&offset=${offset}`, requestOptions)
            if (response.status == 200){
                console.log('a')
                    const result = await response.json()
                    listaProductos.push(result.resultado)
                    offset += 100

                }
            else{
                console.log('Error al traer los datos')
                console.error(response.status)
                }
            }
    }

    return listaProductos
    }


//TODO Normalizar la tabla 
const cargarDatos = async (producto) => {
    const params = [
        producto.nombre || null,
        producto.stock_total || 0,
        Number(producto.garantia) || 0,
        producto.descripcion || "   ",
        producto.dimensiones?.largo || 0.0,
        producto.dimensiones?.alto || 0.0,
        producto.dimensiones?.ancho || 0.0,
        producto.peso || 0.0,
        producto.codigo_alfa || null,
        producto.marca || null,
        producto.categoria || null,
        producto.sub_categoria || null,
        "elit",  // siempre será "elit"
        producto.precio || null,
        producto.pvp_usd || null,
        producto.iva || null,
        producto.pvp_ars || null,
        producto.pvp_ars || null,  // Puede que tengas un error aquí, si esto es redundante
        producto.imagenes && producto.imagenes[0] ? producto.imagenes[0] : "  "
    ];

    // Ejecutamos la consulta SQL
    if (producto.iva != null){
        const [result] = await db.execute("CALL schemamodex.cargarDatosProducto(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", params);
        console.log(result);
    }

}
const getProducts = async () => {
    try{
        const [result] = await db.execute("SELECT * FROM tabla_elit")
        console.table(result)
    }catch(error){
        console.error(error); 
    }
};

// doble for por que la lista esta compuesta de N respuestas que traen 100 productos cada una
// TODO debe haber una forma de hacerlo con un solo for
const cargarProductosAtabla = (listaProductos)=>{
    listaProductos.forEach(paginaProducto => {
        paginaProducto.forEach(producto => {

        cargarDatos(producto)
        });
    });
}



// llamamos las funciones necesarias para cargar las tablas
const productosElit = await getElit()
cargarProductosAtabla(productosElit)
