import express from "express";
import { db } from "./database/connectionMySQL.js";
import {
  validarQuerysProducto,
  validarBodyProducto,
  verificarValidaciones,
  validarId,
} from "./middleware/validaciones.js";

import passport from "passport";
import { validarJwt, validarRol } from "./auth.js";
export const productosRouter = express.Router();

productosRouter.get(
  "/",
  validarQuerysProducto(),
  verificarValidaciones,
  async (req, res) => {
    try {
      const {
        categoria,
        sub_categoria,
        usado,
        oferta,
        precio_gt,
        precio_lt,
        nombre,
        order = "ASC",
        offset = 0,
        limit = 20,
      } = req.query;

      const [productos] = await db.execute(
        "CALL SP_GETPRODUCTOS(?,?,?,?,?,?,?,?,?,?)",
        [
          categoria || null,
          sub_categoria || null,
          usado !== undefined ? Number(usado) : null,
          oferta !== undefined ? Number(oferta) : null,
          precio_gt || null,
          precio_lt || null,
          nombre || null,
          order || null,
          Number(offset),
          Number(limit),
        ]
      );
      const rows = productos[0] || [];
      const total = productos[1][0].total;

      res.json({ productos: rows, cantidadProductos: total });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al obtener productos" });
    }
  }
);
productosRouter.get("/categorias", async (req, res) => {
  try {
    const [categorias] = await pool.query("SELECT * FROM categorias");
    res.json({ categorias });
  } catch (err) {
    console.error("Error en GET /categorias:", err);
    res.status(500).json({ error: "Error al obtener categorías" });
  }
});
productosRouter.post(
  "/detalle/:id",
  validarJwt,
  validarRol(2),
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = req.params.id;
    const detalle = req.body.detalle;
    const sql = "UPDATE productos SET detalle = ? WHERE (id_producto = ?);";
    const [resultado, fields] = await db.execute(sql, [detalle, id]);
    res.status(201).send("detalle cargado");
  }
);

productosRouter.get(
  "/:id",
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = req.params.id;
    const [resultado, fields] = await db.execute(
      `SELECT pr.id_producto,
        pr.nombre,
        p.stock,
        p.deposito,
        pr.peso,
        pr.detalle,
        pr.garantia_meses,
        pr.codigo_fabricante,
        (SELECT JSON_ARRAYAGG(nombre_categoria)
        FROM (
            SELECT DISTINCT c.nombre_categoria
            FROM productos_categorias pc2
            INNER JOIN categorias c ON pc2.id_categoria = c.id_categoria
            WHERE pc2.id_producto = pr.id_producto
        ) AS distinct_categories) AS categorias,
        (SELECT JSON_ARRAYAGG(url_imagen)
        FROM (
            SELECT DISTINCT i.url_imagen
            FROM productos_imagenes pi
            INNER JOIN imagenes i ON pi.id_imagen = i.id_imagen
            WHERE pi.id_producto = pr.id_producto
        ) AS distinct_images
       ) AS url_imagenes,
        p.precio_dolar,
		p.precio_dolar_iva,
		p.iva, 
		p.precio_pesos,
        pro.nombre_proveedor,
        p.precio_pesos_iva,
    CASE
        WHEN pro.nombre_proveedor = 'air' AND pr.id_producto IN (
        SELECT pc2.id_producto
        FROM productos_categorias pc2
        INNER JOIN categorias c2 ON pc2.id_categoria = c2.id_categoria
        WHERE c2.nombre_categoria IN ('procesadores')
        GROUP BY pc2.id_producto
    ) THEN p.precio_pesos_iva * 1.12
        WHEN pro.nombre_proveedor = 'air' THEN p.precio_pesos_iva * 1.12
        ELSE p.precio_pesos_iva
    END AS precio_pesos_iva_ajustado,
pr.alto,pr.ancho,pr.largo,pro.nombre_proveedor
FROM productos pr 
INNER JOIN precios p 
ON pr.id_producto = p.id_producto 
INNER JOIN productos_categorias pc 
ON pr.id_producto = pc.id_producto 
INNER JOIN categorias c ON pc.id_categoria = c.id_categoria
INNER JOIN productos_imagenes pi ON pi.id_producto = pr.id_producto
INNER JOIN imagenes i ON pi.id_imagen = i.id_imagen
INNER JOIN proveedores pro ON pro.id_proveedor = p.id_proveedor
WHERE 
    p.precio_dolar = (
        SELECT MIN(precio_dolar) 
        FROM precios 
        WHERE id_producto = pr.id_producto
        ) AND pr.id_producto = ? AND p.deshabilitado = 0
        group by pr.id_producto ,p.stock,p.oferta,p.precio_dolar, p.deposito,p.precio_dolar_iva,p.iva,p.precio_pesos, p.precio_pesos_iva,pr.alto,pr.ancho,pr.largo,pro.nombre_proveedor;`,
      [id]
    );

    res.status(200).send({ datos: resultado });
  }
);

productosRouter.post(
  "/",
  validarJwt,
  validarRol(2),
  validarBodyProducto(),
  verificarValidaciones,
  async (req, res) => {
    const {
      nombre,
      stock,
      garantia_meses,
      detalle,
      largo,
      alto,
      ancho,
      peso,
      codigo_fabricante,
      marca,
      categoria,
      sub_categoria,
      proveedor,
      precio_dolar,
      precio_dolar_iva,
      iva,
      precio_pesos,
      precio_pesos_iva,
      url_imagen,
    } = req.body;

    try {
      const resultado = await db.execute(
        `CALL cargarDatosProducto(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nombre,
          stock,
          garantia_meses,
          detalle,
          largo,
          alto,
          ancho,
          peso,
          codigo_fabricante,
          marca,
          categoria,
          sub_categoria,
          proveedor,
          precio_dolar,
          precio_dolar_iva,
          iva,
          precio_pesos,
          precio_pesos_iva,
          url_imagen,
        ]
      );

      res
        .status(201)
        .json({ mensaje: "Producto cargado exitosamente", resultado });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al cargar el producto" });
    }
  }
);

productosRouter.delete(
  "/:id",
  validarJwt,
  validarRol(2),
  validarId,
  async (req, res) => {
    const id = req.params.id;
    try {
      const sql = "DELETE FROM productos WHERE id_producto = ?;";
      const [resultado] = db.execute(sql, [id]);
      if (resultado.affectedRows == 0) {
        return res.status(400).send({ mensaje: "Prodcuto no encontrado" });
      }
      return res.status(200).send({ mensaje: "Producto eliminado con exito" });
    } catch (error) {
      return res.status(500).send({ error: error });
    }
  }
);
productosRouter.put(
  "/:id",
  validarJwt,
  validarRol(2),
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = req.params.id;
    ("precio_pesos_iva");
    const { nuevo_precio, producto_id, proveedor_id } = req.query;
    try {
      const sql =
        "UPDATE precios SET precio_pesos_iva = ? WHERE (id_producto = ? AND id_proveedor = ?);";
      const resultado = db.execute(sql, [
        nuevo_precio,
        producto_id,
        proveedor_id,
      ]);
      if (resultado.affectedRows == 0) {
        res
          .status(400)
          .send({ mensaje: "Id producto o id proveedor invalido" });
      }
      res.status(200).send({ mensaje: "Precio actualizado" });
    } catch (error) {
      res.status(500).send({ error: error });
    }
  }
);
export default productosRouter;
