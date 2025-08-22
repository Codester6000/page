import express from "express";
import multer from "multer";
import fs from "fs";
import csv from "csv-parser";
import axios from "axios";
import { db } from "./database/connectionMySQL.js";
import { categorias_final_air } from "./recursos/categorias.js";

const routerCargaProducto = express.Router();
const upload = multer({ dest: "uploads/" });

routerCargaProducto.post(
  "/cargar-productos",
  upload.single("archivo_csv"),
  async (req, res) => {
    const filePath = req.file?.path;
    if (!filePath)
      return res.status(400).json({ error: "No se envió ningún archivo CSV." });

    let dolar_venta = 1;
    try {
      await db.query("CALL deshabilitar_air()");
      const { data } = await axios.get(
        "https://dolarapi.com/v1/dolares/oficial"
      );
      dolar_venta = Number(data?.venta) || 1;
      console.log("Dólar oficial:", dolar_venta);
    } catch (err) {
      console.error("Error obteniendo dólar oficial:", err.message);
      return res.status(500).json({ error: "Error obteniendo dólar oficial" });
    }

    const resultados = [];
    const errores = [];

    try {
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(
            csv({
              separator: ",",
              quote: '"',
              mapHeaders: ({ header }) => header.trim().replace(/^"|"$/g, ""),
            })
          )
          .on("headers", (headers) => {
            console.log("Encabezados :", headers);
          })
          .on("data", async (fila) => {
            try {
              // Extracción y validación de datos
              const deposito =
                parseInt(fila["CBA"]) > 0
                  ? "CBA"
                  : parseInt(fila["LUG"]) > 0
                  ? "LUG"
                  : "";
              const stock =
                parseInt(fila["CBA"]) > 0
                  ? parseInt(fila["CBA"])
                  : parseInt(fila["LUG"]) > 0
                  ? parseInt(fila["LUG"])
                  : 0;

              const nombre = (fila["Descripcion"] || "").trim();
              const codigo_fabricante = (
                fila["Part Number"] ||
                fila['"Part Number"'] ||
                ""
              ).trim();
              const codigo_categoria = (fila["Rubro"] || "").trim();

              const garantia_meses = 6;
              const detalle = "a";
              const largo = 0.0,
                alto = 0.0,
                ancho = 0.0,
                peso = 0.0;
              const marca = "a";
              const sub_categoria = "a";
              const proveedor = "air";
              const precio_dolares = parseFloat(fila["lista5"]) || 0;
              const iva = parseFloat(fila["IVA"]) || 0;
              const precio_dolares_iva = +(
                precio_dolares *
                (iva / 100 + 1)
              ).toFixed(2);
              const precio_pesos = +(precio_dolares * dolar_venta).toFixed(2);
              const precio_pesos_iva = +(
                precio_dolares *
                dolar_venta *
                (iva / 100 + 1)
              ).toFixed(2);
              const url_imagen = "https://i.imgur.com/0wbrCkz.png";

              // Categoría
              const categoria = categorias_final_air[codigo_categoria] || 0;

              // Validaciones
              if (!categoria || codigo_fabricante.length <= 2) {
                resultados.push({
                  nombre,
                  codigo_fabricante,
                  categoria,
                  status: "omitida",
                  motivo: !categoria
                    ? "Sin categoría válida"
                    : "Código de fabricante corto",
                });
                return;
              }

              // Precio final según categoría
              const precio_general =
                categoria === "Procesadores" || codigo_categoria === "001-0056"
                  ? precio_pesos_iva * 1.2
                  : precio_pesos_iva * 1.27;

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
                String(categoria),
                sub_categoria,
                proveedor,
                precio_dolares,
                precio_dolares_iva,
                iva,
                precio_pesos,
                precio_general,
                url_imagen,
                deposito,
              ];

              console.log("Parámetros para el SP:", parametros);

              try {
                const [result] = await db.query(
                  "CALL cargarDatosProducto(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                  parametros
                );
                console.log("SP ejecutado:", result[0]);
                resultados.push({
                  nombre,
                  codigo_fabricante,
                  categoria,
                  status: "ok",
                });
              } catch (error) {
                console.error("Error ejecutando SP:", error.message);
                errores.push({
                  nombre,
                  codigo_fabricante,
                  categoria,
                  error: error.message,
                });
              }
            } catch (err) {
              console.error("Error procesando fila:", err.message);
              errores.push({ error: err.message });
            }
          })
          .on("end", () => {
            console.log("Lectura CSV finalizada");
            resolve();
          })
          .on("error", (err) => {
            console.error("Error leyendo CSV:", err.message);
            reject(err);
          });
      });

      res.json({
        procesadas_ok: resultados.filter((r) => r.status === "ok").length,
        omitidas: resultados.filter((r) => r.status === "omitida").length,
        errores: errores.length,
        detalles: {
          ok: resultados.filter((r) => r.status === "ok"),
          omitidas: resultados.filter((r) => r.status === "omitida"),
          errores,
        },
      });
    } catch (error) {
      console.error("Error general:", error.message);
      res.status(500).json({
        error: "Error en el servidor",
        detalle: error?.message || String(error),
      });
    } finally {
      if (filePath && fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log("Archivo CSV eliminado:", filePath);
        } catch (err) {
          console.error("No se pudo eliminar el archivo:", err.message);
        }
      }
    }
  }
);

export default routerCargaProducto;
