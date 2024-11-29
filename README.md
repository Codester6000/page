# Proyecto Modex backend y frontend
En este proyecto tenemos que crear un mostrador de productos, poder filtrarlos por categorias, ordernarlos por precio, porder buscarlos por nombre. Realizar un armador de pc con compatibilidades(PSU tambien)

# Backend
La base de datos se puede recrear a partir de los archivos que estan en la carpeta backend
## Instrucciones 
- Abrir archivo modelo de la carpeta database en mysql workbench, Databases  -> Forward Engineering, siguiente hasta completar   
- cd backend   
> npm i
   
> node cargarProductosElit.js

cerramos el proceso        
-en workbench ejecutamos los store procedure InsertarCategoriasYrelaciones   
Listo ya podemos usar la API   

## rutas para la api   
Se pueden hacer GET y GET por id , POST en /productos

existen 4 querys
nombre -> busca por nombre
categoria -> ....
precio_lt -> devuelve los productos con precio menor a
precio_gt -> precios mayores a

GET a /armador

POST y GET a /usarios
POST a /auth/login

## Store procedures 
> reemplazar "<>" por valores

`CALL "schemamodex"."cargar_categorias"(<{IN categoria varchar(45)}>, <{IN sub_categoria varchar(45)}>, <{IN id_producto INT}>);`
    
*si no existen las categorias pasadas se crean en la tabla categoria, y luego hace la relacion en la tabla productos_categorias.*


`CALL "schemamodex"."cargar_dimensiones"(<{IN largo decimal(6,2)}>, <{IN alto decimal(6,2)}>, <{IN ancho decimal(6,2)}>, <{IN id_producto INT}>);`

*se explica solo.*
`CALL "schemamodex"."cargar_imagen"(<{IN url_imagen varchar(90)}>, <{IN id_producto int}>);`

`CALL "schemamodex"."cargar_precios"(<{IN precio_dolar decimal(8,2)}>, <{IN precio_dolar_iva decimal(8,2)}>, <{IN iva decimal(4,2)}>, <{IN precio_pesos decimal(14,2)}>, <{IN precio_pesos_iva decimal(14,2)}>, <{IN id_proveedor INT}>, <{IN id_producto INT}>);`

`CALL "schemamodex"."cargar_proveedores"(<{IN nombre_proveedor varchar(45)}>, <{IN id_producto INT}>);`

`CALL "schemamodex"."actualizar_precio"(<{IN precio_dolar decimal(8,2)}>, <{IN precio_dolar_iva decimal(8,2)}>, <{IN iva decimal(4,2)}>, <{IN precio_pesos decimal(14,2)}>, <{IN precio_pesos_iva decimal(14,2)}>, <{IN id_proveedor INT}>, <{IN id_producto INT}>);`


`"CALL "schemamodex"."cargarDatosProducto"(<{IN nombre text}>, <{IN stock INT}>, <{IN garantia_meses INT}>,
<{IN detalle longtext}>, <{IN largo decimal(6,2)}>, <{IN alto decimal(6,2)}>, <{IN ancho decimal(6,2)}>,
<{IN peso decimal(6,2)}>, <{IN codigo_fabricante VARCHAR(45)}>, <{IN marca VARCHAR(45)}>, <{IN categoria VARCHAR(45)}>,
<{IN sub_categoria VARCHAR(45)}>, <{IN proveedor varchar(45)}>, <{IN precio_dolar decimal(8,2)}>, <{IN precio_dolar_iva decimal(8,2)}>, 
<{IN iva decimal(4,2)}>, <{IN precio_pesos decimal(14,2)}>, <{IN precio_pesos_iva decimal(14,2)}>, <{IN url_imagen varchar(80)}>);"`
*funcion rancia de llamar pero automatiza la carga de un producto, se le pasa toda esa informacion y si no existe el producto (codigo de fabricante) en la tabla productos, llama a a las store procedures necesarias para crear el producto; si ya existe solo actualiza el precio
>TODO : || STOCK ( hay que separarlo de la tabla productos y separarlo, la forma mas rapida es directamente llevarlo a la tabla precios, la forma "correcta" separarlo por su tabla" ||      
> || POST PUT DEL  ||  
>|| ARMADOR COMPONENTES ||  
> || SCRIPT PARA CSV -> cargarDatosProducto() ||


  #FrontEnd
Aca deberia laburar ramon, poner sus archivos en la carpeta frontEnd para poder mergear bien las tablas

 Hola, acá Ramón.
 Para el Front usamos las Libreria Mui `https://mui.com` y Swiper `https://swiperjs.com` para facilitar
 el trabajo con los componentes visibles como por ejemplo:
- Carusel: usando Swiper su creación y configuración fue mas rapida y eficiente.
- Cards: Mui nos facilita un diseño de card que luego de modificarlo a lo que necesitabamos
nos permitio un exelente integro en el proyecto.

#EXPERIMENTANDO CON INICIO DE SESIÓN AUTOMÁTICA DE USUARIO# - Martín
 Estas librerias tambien nos ayudan a lograr que la pagina responda correctamente ante diferentes pantallas
aunque no son una solucion magica, aun tienen alguinos errores a la hora de hacer o quitar zoom,
dimensiones especificas de pantallas, entre otros errores menores que algunos ya fueron solucionados
y/o estan en proceso de solucion mediante css.
