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
        "CALL sp_getproductosalternativo(?,?,?,?,?,?,?,?,?,?)",
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
    try {
      const id = req.params.id;

      const [resultado, fields] = await db.execute(
        `CALL sp_obtener_producto_detalle(?)`,
        [id]
      );

      res.status(200).send({ datos: resultado[0] });
    } catch (error) {
      console.error("Error al obtener producto:", error);
      res.status(500).send({
        error: "Error interno del servidor al obtener el producto",
      });
    }
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
