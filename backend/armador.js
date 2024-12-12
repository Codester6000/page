import express from "express"
import { validarQueryArmador,verificarValidaciones } from "./middleware/validaciones.js";
import { db } from "./database/connectionMySQL.js";
import {query} from "express-validator"

const armadorRouter = express.Router()

armadorRouter.get("/", validarQueryArmador(),verificarValidaciones, async (req, res) => {
const {procesador_id,motherboard_id,gpu_id,memoria_id,gabinete_id,almacenamiento_id,order} = req.query
let procesador = undefined
let motherboard = undefined
let motherboardDDR = undefined
let gpu = undefined
let memoria = undefined

const handleSeleccionar = async (id_producto) =>{
    const listaRestricciones = []
    const [restricciones] = await db.execute("CALL determinar_categoria_armador(?)",[id_producto])
    restricciones[0].map((restriccion)=>{
        switch (restriccion?.nombre_categoria) {
            case 'am4':
                procesador='am4'
                motherboard='am4'
                break;
            case 'am5':
                procesador='am5'
                motherboard='am5'
                break;
            case '1200':
                procesador='1200'
                motherboard='1200'
                break;
            case '1700':
                procesador='1700'
                motherboard='1700'
                break;
            case 'DDR3':
                memoria='DDR3'
                motherboardDDR='DDR3'
                break;
            case 'DDR4':
                memoria='DDR4'
                motherboardDDR='DDR4'
                break;
            case 'DDR5':
                memoria='DDR5'
                motherboardDDR='DDR5'
                break;
            
        
            default:
                break;
        }
    })
}
if (procesador_id != undefined){
    await handleSeleccionar(procesador_id)
}
if (motherboard_id != undefined){
    await handleSeleccionar(motherboard_id)
}
if (memoria_id != undefined){
    await handleSeleccionar(memoria_id)
}
let sql = `SELECT
    pr.id_producto, 
    pr.nombre, 
    p.stock, 
    pr.peso, 
    pr.garantia_meses, 
    pr.codigo_fabricante,
    GROUP_CONCAT(DISTINCT c.nombre_categoria SEPARATOR ', ') AS categorias,
    GROUP_CONCAT(DISTINCT i.url_imagen SEPARATOR ', ') AS url_imagenes,
    CASE
    WHEN pro.nombre_proveedor = 'elit' AND pr.id_producto IN (
        SELECT pc2.id_producto
        FROM productos_categorias pc2
        INNER JOIN categorias c2 ON pc2.id_categoria = c2.id_categoria
        WHERE c2.nombre_categoria IN ('procesadores')
        GROUP BY pc2.id_producto
    ) THEN p.precio_dolar * 1.15
        WHEN pro.nombre_proveedor = 'elit' THEN p.precio_dolar * 1.20
         WHEN pro.nombre_proveedor = 'air' AND pr.id_producto IN (
        SELECT pc2.id_producto
        FROM productos_categorias pc2
        INNER JOIN categorias c2 ON pc2.id_categoria = c2.id_categoria
        WHERE c2.nombre_categoria IN ('procesadores')
        GROUP BY pc2.id_producto
    ) THEN p.precio_dolar * 1.20
        WHEN pro.nombre_proveedor = 'air' THEN p.precio_dolar * 1.25
        ELSE p.precio_dolar
    END AS precio_dolar_ajustado,
    CASE
     WHEN pro.nombre_proveedor = 'elit' AND pr.id_producto IN (
        SELECT pc2.id_producto
        FROM productos_categorias pc2
        INNER JOIN categorias c2 ON pc2.id_categoria = c2.id_categoria
        WHERE c2.nombre_categoria IN ('procesadores')
        GROUP BY pc2.id_producto
    ) THEN p.precio_dolar * 1.15
        WHEN pro.nombre_proveedor = 'elit' THEN p.precio_dolar_iva * 1.20
         WHEN pro.nombre_proveedor = 'air' AND pr.id_producto IN (
        SELECT pc2.id_producto
        FROM productos_categorias pc2
        INNER JOIN categorias c2 ON pc2.id_categoria = c2.id_categoria
        WHERE c2.nombre_categoria IN ('procesadores')
        GROUP BY pc2.id_producto
    ) THEN p.precio_dolar * 1.20
        WHEN pro.nombre_proveedor = 'air' THEN p.precio_dolar_iva * 1.25
        ELSE p.precio_dolar_iva
    END AS precio_dolar_iva_ajustado,
    p.iva, 
    CASE
     WHEN pro.nombre_proveedor = 'elit' AND pr.id_producto IN (
        SELECT pc2.id_producto
        FROM productos_categorias pc2
        INNER JOIN categorias c2 ON pc2.id_categoria = c2.id_categoria
        WHERE c2.nombre_categoria IN ('procesadores')
        GROUP BY pc2.id_producto
    ) THEN p.precio_dolar * 1.15
        WHEN pro.nombre_proveedor = 'elit' THEN p.precio_pesos * 1.2
         WHEN pro.nombre_proveedor = 'air' AND pr.id_producto IN (
        SELECT pc2.id_producto
        FROM productos_categorias pc2
        INNER JOIN categorias c2 ON pc2.id_categoria = c2.id_categoria
        WHERE c2.nombre_categoria IN ('procesadores')
        GROUP BY pc2.id_producto
    ) THEN p.precio_dolar * 1.20
        WHEN pro.nombre_proveedor = 'air' THEN p.precio_pesos * 1.25
        ELSE p.precio_pesos
    END AS precio_pesos_ajustado,
    CASE
     WHEN pro.nombre_proveedor = 'elit' AND pr.id_producto IN (
        SELECT pc2.id_producto
        FROM productos_categorias pc2
        INNER JOIN categorias c2 ON pc2.id_categoria = c2.id_categoria
        WHERE c2.nombre_categoria IN ('procesadores')
        GROUP BY pc2.id_producto
    ) THEN p.precio_dolar * 1.15
        WHEN pro.nombre_proveedor = 'elit' THEN p.precio_pesos_iva * 1.2
         WHEN pro.nombre_proveedor = 'air' AND pr.id_producto IN (
        SELECT pc2.id_producto
        FROM productos_categorias pc2
        INNER JOIN categorias c2 ON pc2.id_categoria = c2.id_categoria
        WHERE c2.nombre_categoria IN ('procesadores')
        GROUP BY pc2.id_producto
    ) THEN p.precio_dolar * 1.20
        WHEN pro.nombre_proveedor = 'air' THEN p.precio_pesos_iva * 1.25
        ELSE p.precio_pesos_iva
    END AS precio_pesos_iva_ajustado,
    pr.alto, 
    pr.ancho, 
    pr.largo, 
    pro.nombre_proveedor
FROM productos pr
INNER JOIN precios p ON pr.id_producto = p.id_producto
INNER JOIN productos_categorias pc ON pr.id_producto = pc.id_producto
INNER JOIN categorias c ON pc.id_categoria = c.id_categoria
INNER JOIN productos_imagenes pi ON pi.id_producto = pr.id_producto
INNER JOIN imagenes i ON pi.id_imagen = i.id_imagen
INNER JOIN proveedores pro ON pro.id_proveedor = p.id_proveedor
WHERE 
    p.precio_dolar = (
        SELECT MIN(precio_dolar) 
        FROM precios 
        WHERE id_producto = pr.id_producto AND stock > 0
    )
    AND pr.id_producto IN (
        SELECT pc2.id_producto
        FROM productos_categorias pc2
        INNER JOIN categorias c2 ON pc2.id_categoria = c2.id_categoria
        WHERE c2.nombre_categoria IN (?, ?, ?)
        GROUP BY pc2.id_producto
        HAVING COUNT(DISTINCT c2.nombre_categoria) = ?
    )
GROUP BY pr.id_producto, p.stock, p.precio_dolar, p.precio_dolar_iva, p.iva, p.precio_pesos, p.precio_pesos_iva, pr.alto, pr.ancho, pr.largo, pro.nombre_proveedor
ORDER BY precio_pesos_ajustado 
`
if(order != undefined){
    sql += order + ";"
}
const paramProcesadores = (procesador !=undefined) ? ["procesadores",procesador,'teest',2] : ["procesadores","",'teest',1]; 
const [procesadores] = await db.execute(sql,paramProcesadores)

let paramMotherboards = (motherboard !=undefined && motherboardDDR != undefined) ? ["motherboards",motherboard,motherboardDDR,3] : (motherboard !=undefined && motherboardDDR == undefined) ? ["motherboards",motherboard,'teest',1]: ["motherboards","",'teest',1];
if (motherboard == undefined && motherboardDDR != undefined){
    paramMotherboards = ["motherboards","teest",motherboardDDR,2]
}else if (motherboard != undefined && motherboardDDR == undefined){
    paramMotherboards = ['motherboards', motherboard,'test',2]
}else if (motherboard != undefined && motherboardDDR != undefined){
    paramMotherboards = ['motherboards', motherboard,motherboardDDR,3]
}else{
    paramMotherboards = ['motherboards', 'test','test',1]
}
console.log(paramMotherboards)
const [motherboards] = await db.execute(sql,paramMotherboards);

const paramGpus = (gpu !=undefined) ?  ["Placas de Video",gpu,,'teest',2]:["Placas de Video","",'teest',1]
const [gpus] = await db.execute(sql,paramGpus);
const paramMemorias = (memoria != undefined) ? ["memorias pc",memoria,'teest',2] : ["memorias pc","",'teest',1];
const [memorias] = await db.execute(sql,paramMemorias);

const paramFuente = ["fuentes","",'teest',1]
const [fuentes] = await db.execute(sql,paramFuente)

const paramGabinente = ["gabinetes","",'test',1];
const [gabinetes] = await db.execute(sql,paramGabinente)
const paramAlmacenamiento = ["discos internos","discos internos ssd",'teest',1];
const [almacenamientos] = await db.execute(sql,paramAlmacenamiento)
const paramCoolers = ["Coolers","test","test",1]
const [coolers] = await db.execute(sql,paramCoolers)
const paramMonitores = ["Monitores","test","test",1]
const [monitores] = await db.execute(sql,paramMonitores)
    res.status(200).send({ productos : {"procesadores": procesadores, "motherboards": motherboards, "gpus":gpus,"memorias": memorias, "fuentes": fuentes, "gabinetes": gabinetes, "almacenamiento": almacenamientos, 'coolers':coolers,'monitores':monitores }})
})

export default armadorRouter;