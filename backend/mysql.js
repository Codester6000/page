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
    
        // Fetch productos
        const response = await fetch("https://clientes.elit.com.ar/v1/api/productos?limit=10", requestOptions)
        const result = await response.json()
        const listaProductos = await result.resultado
        listaProductos.forEach(producto => {
            putProduct(producto)
        });
    }



const putProduct = async (producto) => {
    const precio_sugerido = parseInt(parseInt((parseFloat(parseFloat(producto.iva)/100+1) * parseFloat(producto.precio)) * parseFloat(producto.cotizacion))*1.15)
    try {
        const result = await pool.query('INSERT INTO tabla_elit ( id_elit, codigo_alfa, codigo_producto, nombre, marca, categoria, sub_categoria, precio_usd, iva, precio_usd_iva, garantia_meses, link, uri, imagenes, dimensiones, gamer)' 
            
            
            + 'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',[producto.id,producto.codigo_alfa,producto.codigo_producto,producto.nombre,producto.marca,producto.categoria,producto.sub_categoria,producto.precio,producto.iva, precio_sugerido,parseInt(producto.garantia),producto.link,producto.uri,'http/images','alto:2,largo:2,peso:0,5kg',1]);
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

getElit()