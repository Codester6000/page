import {pool} from './database/connectionMySQL.js'

//TODO usar offset para recibir todos los productos
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
        console.log(total_productos)
        offset += 100

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
const putProduct = async (producto) => {
    const precio_sugerido = parseInt(parseInt((parseFloat(parseFloat(producto.iva)/100+1) * parseFloat(producto.precio)) * parseFloat(producto.cotizacion))*1.15)
    const dimensiones = `Largo : ${producto.dimensiones.largo}, ancho: ${producto.dimensiones.ancho}, alto: ${producto.dimensiones.alto}`
    try {
        const result = await pool.query('INSERT INTO tabla_elit ( id_elit, codigo_alfa, codigo_producto, nombre, marca, categoria, sub_categoria, precio_usd, iva, precio_usd_iva, garantia_meses, link, uri, imagenes, dimensiones, gamer)' 
            
            
            + 'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',[producto.id,producto.codigo_alfa,producto.codigo_producto,producto.nombre,producto.marca,producto.categoria,producto.sub_categoria,producto.precio,producto.iva, precio_sugerido,parseInt(producto.garantia),producto.link,producto.uri,producto.imagenes[0],dimensiones,1]);
        console.log(result)
    } catch (error) {
        console.error(error);
    }
}
const getProducts = async () => {
    try{
        const [result] = await pool.query("SELECT * FROM tabla_elit")
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
            putProduct(producto)
        });
    });
}

// llamamos las funciones necesarias para cargar las tablas
const productosElit = await getElit()
cargarProductosAtabla(productosElit)
