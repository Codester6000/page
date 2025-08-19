import express from "express";
import multer from "multer";
import fs from "fs";
import csv from "csv-parser";
import axios from "axios";
import { db } from "./database/connectionMySQL.js";

const routerCargaProductoModex = express.Router();
const upload = multer({ dest: "uploads/" });

function parseNum(val) {
  if (!val) return 0;
  return parseFloat(val.toString().replace(",", "."));
}

routerCargaProductoModex.post(
  "/cargar-articulos",
  upload.single("archivo_csv"),
  async (req, res) => {
    const filePath = req.file?.path;
    if (!filePath)
      return res.status(400).json({ error: "No se envió ningún archivo CSV." });

    let dolarVenta = 1;
    try {
      const response = await axios.get(
        "https://dolarapi.com/v1/dolares/oficial"
      );
      dolarVenta = parseFloat(response.data.venta) || 1;
      console.log("Dolar oficial:", dolarVenta);
    } catch (err) {
      console.error("Error obteniendo dolar:", err.message);
    }

    const resultados = [];
    const errores = [];
    const filas = [];

    try {
      // 1) Leer CSV y guardar filas en array
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(
            csv({
              separator: ",",
              quote: '"',
              mapHeaders: ({ header }) =>
                header
                  .trim()
                  .toLowerCase()
                  .replace(/\s+/g, "_")
                  .replace(/^"|"$/g, ""),
            })
          )
          .on("headers", (headers) => {
            console.log("📑 Encabezados detectados:", headers);
          })
          .on("data", (fila) => {
            filas.push(fila);
          })
          .on("end", () => {
            console.log("✅ Lectura de CSV finalizada. Filas:", filas.length);
            resolve();
          })
          .on("error", (err) => {
            reject(err);
          });
      });

      // 2) Procesar filas con await secuencialmente
      for (const fila of filas) {
        try {
          const nombre = fila["descripcion"] || "";
          const codigo_fabricante = fila["codigo"] || "";
          const marca = fila["part_number"] || "";
          const iva = parseNum(fila["iva"]);
          const precioPesos = parseNum(fila["lista5"]);
          const deposito = "Deposito1";
          const stock = 0;
          const garantia_meses = 6;
          const detalle = "";
          const largo = 0;
          const alto = 0;
          const ancho = 0;
          const peso = 0;
          const sub_categoria = "subcat";
          const proveedor = "ProveedorX";
          const categoria = "General";
          const precioPesosIVA = precioPesos * (1 + iva / 100);
          const precioDolares = precioPesos / dolarVenta;
          const precioDolaresIVA = precioPesosIVA / dolarVenta;
          const url_imagen = "https://i.imgur.com/0wbrCkz.png";

          if (!nombre && !codigo_fabricante && !marca) continue; // no pasa la condicion
          console.log("aca no llega");

          const parametros = [
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
            precioDolares,
            precioDolaresIVA,
            iva,
            precioPesos,
            precioPesosIVA,
            url_imagen,
            deposito,
          ];

          console.log("Insertando:", parametros);

          await db.query(
            "CALL cargarDatosProducto(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            parametros
          );

          resultados.push({
            codigo: codigo_fabricante,
            nombre,
            status: "ok",
          });
        } catch (err) {
          errores.push({ fila, error: err.message });
          console.error("Error en base de datos:", err.message);
        }
      }

      res.json({
        procesadas_ok: resultados.length,
        errores: errores.length,
        detalles: { ok: resultados, errores },
      });
    } catch (err) {
      console.error("Error general:", err.message);
      res.status(500).json({
        error: "Error en el servidor",
        detalle: err?.message || String(err),
      });
    } finally {
      if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  }
);

export default routerCargaProductoModex;
