UPDATE productos p
INNER JOIN productos_categorias pc ON p.id_producto = pc.id_producto
SET p.consumo = 65
WHERE pc.id_categoria = 203 AND p.consumo is NULL;
