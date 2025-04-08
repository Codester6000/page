SELECT p.nombre, p.id_producto 
FROM productos p 
INNER JOIN productos_imagenes pi ON p.id_producto = pi.id_producto
INNER JOIN precios pr ON pr.id_producto = p.id_producto
WHERE 
    pr.precio_dolar = (
        SELECT MIN(precio_dolar) 
        FROM precios 
        WHERE id_producto = pr.id_producto
        )AND pr.deshabilitado = 0 AND pr.stock != 0 AND pr.id_proveedor != 4
GROUP BY p.id_producto, p.nombre
HAVING COUNT(pi.id_producto) = 1;