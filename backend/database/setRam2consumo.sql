UPDATE productos p
INNER JOIN productos_categorias pc ON p.id_producto = pc.id_producto
SET p.consumo = 2
WHERE pc.id_categoria = 193;