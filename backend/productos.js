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

const ESTADOS_PROCESAMIENTO = {
  EXITOSO: "SUCCESS",
  SIN_IMAGEN: "SIN_IMAGEN",
  IMAGEN_INVALIDA: "IMAGEN_INVALIDA",
  ERROR_BD: "ERROR_BD",
  ERROR_GENERAL: "ERROR_GENERAL",
};
async function guardarImagenEnBaseDatos(urlImagen, idProducto) {
  try {
    const [resultado] = await db.query("CALL reemplazar_imagen_producto(?,?)", [
      idProducto,
      urlImagen,
    ]);

    const row = resultado[0];
    return {
      estado: row?.estado || ESTADOS_PROCESAMIENTO.EXITOSO,
      mensaje: row?.mensaje || "Imagen cargada exitosamente",
      idImagen: row?.id_imagen,
    };
  } catch (error) {
    throw new Error(`Error guardando imagen: ${error.message}`);
  }
}

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
    const id_producto = req.params.id;
    const body = req.body;

    try {
      const [producto] = await db.query(
        "SELECT id_producto, nombre FROM productos WHERE id_producto = ?",
        [id_producto]
      );

      if (!producto || producto.length === 0) {
        return res.status(404).json({
          mensaje: "Producto no encontrado.",
          success: false,
        });
      }

      let updateFields = [];
      let updateValues = [];

      const fieldMapping = {
        nombre: "nombre",
        detalle: "detalle",
        garantia_meses: "garantia_meses",
        codigo_fabricante: "codigo_fabricante",
      };

      for (const [key, dbColumn] of Object.entries(fieldMapping)) {
        if (body[key] !== undefined && body[key] !== "") {
          updateFields.push(`${dbColumn} = ?`);
          updateValues.push(body[key]);
        }
      }

      if (updateFields.length > 0) {
        updateValues.push(id_producto);
        const sqlProductos = `UPDATE productos SET ${updateFields.join(
          ", "
        )} WHERE id_producto = ?;`;

        await db.execute(sqlProductos, updateValues);
        console.log(`Producto ${id_producto} actualizado en tabla productos`);
      }

      if (
        body.precio_pesos_iva_ajustado !== undefined &&
        body.precio_pesos_iva_ajustado !== ""
      ) {
        const id_proveedor = body.id_proveedor || 1;
        const sqlPrecios = `UPDATE precios SET precio_pesos_iva = ? WHERE id_producto = ? AND id_proveedor = ?;`;

        await db.execute(sqlPrecios, [
          body.precio_pesos_iva_ajustado,
          id_producto,
          id_proveedor,
        ]);
        console.log(`Precio actualizado para producto ${id_producto}`);
      }

      if (body.url_imagen && body.url_imagen.trim() !== "") {
        const urlImagen = body.url_imagen.trim();

        if (!urlImagen.startsWith("http")) {
          return res.status(400).json({
            mensaje: "La URL de la imagen debe comenzar con http:// o https://",
            success: false,
          });
        }

        try {
          console.log(
            `Procesando imagen para producto ${id_producto}: ${urlImagen.substring(
              0,
              80
            )}...`
          );

          const resultado = await guardarImagenEnBaseDatos(
            urlImagen,
            id_producto
          );

          if (resultado.estado !== ESTADOS_PROCESAMIENTO.EXITOSO) {
            console.log(
              `⚠️ Warning: No se pudo agregar la imagen: ${resultado.mensaje}`
            );
          } else {
            console.log(
              `Imagen agregada exitosamente - ID imagen: ${resultado.idImagen}`
            );
          }
        } catch (imageError) {
          console.error("Error al procesar imagen:", imageError);
        }
      }

      res.status(200).json({
        mensaje: "Producto actualizado con éxito.",
        success: true,
        data: {
          id_producto: id_producto,
          nombre: producto[0].nombre,
        },
      });
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      return res.status(500).json({
        mensaje: "Error interno del servidor al actualizar el producto.",
        success: false,
        error: error.message,
      });
    }
  }
);
export default productosRouter;
