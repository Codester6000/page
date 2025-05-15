UPDATE productos_categorias pc
INNER JOIN productos pr ON pc.id_producto = pr.id_producto
SET pc.id_categoria = 367
WHERE pr.nombre LIKE '%sodim%' AND pc.id_categoria = 326;