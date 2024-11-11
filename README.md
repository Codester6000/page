# Proyecto Modex backend y frontend
En este proyecto tenemos que crear un mostrador de productos, poder filtrarlos por categorias, ordernarlos por precio, porder buscarlos por nombre. Realizar un armador de pc con compatibilidades(PSU tambien)

# Backend
La base de datos se puede recrear a partir de los archivos que estan en la carpeta backend
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




Se pueden hacer GET y GET ID en /productos

existen 4 querys
nombre -> busca por nombre
categoria -> ....
precio_lt -> devuelve los productos con precio menor a
precio_gt -> precios mayores a

  #FrontEnd
Aca deberia laburar ramon, poner sus archivos en la carpeta frontEnd para poder mergear bien las tablas
