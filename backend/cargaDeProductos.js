import express from "express";
import multer from "multer";
import fs from "fs";
import Papa from "papaparse";
import axios from "axios";
import { db } from "./database/connectionMySQL.js";
import { categorias_final_air } from "./recursos/categorias.js";

const routerCargaProducto = express.Router();
const upload = multer({ dest: "uploads/" });

const RUBROS_PROCESADORES = ["001-0056"];

// Detectar separador según la primera línea
function detectarSeparador(linea) {
  const countComas = (linea.match(/,/g) || []).length;
  const countTabs = (linea.match(/\t/g) || []).length;
  const countPuntoComa = (linea.match(/;/g) || []).length;

  if (countTabs >= countComas && countTabs >= countPuntoComa) return "\t";
  if (countPuntoComa >= countComas) return ";";
  return ",";
}

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
      console.log("💵 Dólar oficial:", dolar_venta);
    } catch (err) {
      console.error("Error obteniendo dólar oficial:", err.message);
      return res.status(500).json({ error: "Error obteniendo dólar oficial" });
    }

    const resultados = [];
    const errores = [];

    try {
      // Leer archivo completo
      const contenido = fs.readFileSync(filePath, "utf8");

      // Detectar separador
      const primeraLinea = contenido.split("\n")[0];
      const separador = detectarSeparador(primeraLinea);
      console.log("📑 Separador detectado:", JSON.stringify(separador));

      // Parsear con PapaParse
      const { data: filas } = Papa.parse(contenido, {
        header: true,
        delimiter: separador,
        skipEmptyLines: true,
      });

      console.log(`📦 Total filas leídas: ${filas.length}`);

      // Procesar cada fila
      for (const fila of filas) {
        try {
          const nombre = (fila["Descripcion"] || "").trim();
          let codigo_fabricante = (
            fila["Part Number"] ||
            fila['"Part Number"'] ||
            ""
          )
            .trim()
            .toUpperCase();

          if (!codigo_fabricante) {
            codigo_fabricante = (fila["Codigo"] || "SIN-CODIGO").trim();
          }

          const codigo_categoria = (fila["Rubro"] || "").trim();

          // Mapear categoría
          let categoria = categorias_final_air[codigo_categoria];
          if (!categoria || categoria.trim() === "") {
            categoria = "Sin categoría";
            console.warn(
              `⚠️ Categoría no encontrada para código: ${codigo_categoria}, producto: ${nombre}`
            );
          }

          // Validación de código de fabricante
          if (codigo_fabricante.length <= 2) {
            console.warn(
              `⚠️ Código muy corto: ${codigo_fabricante} para producto: ${nombre}`
            );
            resultados.push({
              nombre,
              codigo_fabricante,
              categoria,
              status: "omitida",
              motivo: "Código de fabricante muy corto",
            });
            continue;
          }

          // Validación adicional: nombre del producto no vacío
          if (!nombre || nombre.trim() === "") {
            console.warn(
              `⚠️ Producto sin nombre, código: ${codigo_fabricante}`
            );
            resultados.push({
              nombre: "SIN NOMBRE",
              codigo_fabricante,
              categoria,
              status: "omitida",
              motivo: "Producto sin nombre",
            });
            continue;
          }

          // Stock total
          const stockTotal = ["ROS", "MZA", "CBA", "LUG"]
            .map((d) => parseInt(fila[d]) || 0)
            .reduce((a, b) => a + b, 0);

          // Depósito principal
          let deposito = "";
          for (const d of ["CBA", "LUG", "ROS", "MZA"]) {
            if (parseInt(fila[d]) > 0) {
              deposito = d;
              break;
            }
          }

          // Si no hay stock en ningún depósito, usar un depósito por defecto
          if (!deposito) {
            deposito = "CBA";
            console.warn(
              `⚠️ Sin stock en depósitos para producto: ${nombre}, usando depósito por defecto: CBA`
            );
          }

          // Precios con validación
          const precio_dolares = parseFloat(fila["lista5"]) || 0;
          const iva = parseFloat(fila["IVA"]) || 0;

          if (precio_dolares <= 0) {
            console.warn(
              `⚠️ Precio inválido para producto: ${nombre}, precio: ${precio_dolares}`
            );
            resultados.push({
              nombre,
              codigo_fabricante,
              categoria,
              status: "omitida",
              motivo: "Precio inválido o cero",
            });
            continue;
          }

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

          const esProcesador = RUBROS_PROCESADORES.includes(codigo_categoria);
          const precio_general = +(
            precio_pesos_iva * (esProcesador ? 1.2 : 1.27)
          ).toFixed(2);

          const detalle = (fila["Tipo"] || "").trim() || "N/A";

          const parametros = [
            nombre,
            stockTotal,
            6, // garantia_meses
            detalle, // detalle
            0.0, // largo
            0.0, // alto
            0.0, // ancho
            0.0, // peso
            codigo_fabricante,
            "a", // marca
            String(categoria),
            "Sin subcategoría", // sub_categoria
            "air", // proveedor
            precio_dolares,
            precio_dolares_iva,
            iva,
            precio_pesos,
            precio_general,
            "https://i.imgur.com/0wbrCkz.png",
            deposito,
          ];

          try {
            const [result] = await db.query(
              "CALL cargarDatosProducto(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
              parametros
            );

            console.log("✅ SP ejecutado correctamente:", {
              producto: nombre,
              categoria: categoria,
              codigo: codigo_fabricante,
              resultado: result[0],
            });

            resultados.push({
              nombre,
              codigo_fabricante,
              categoria,
              categoria_codigo: codigo_categoria,
              stock: stockTotal,
              precio_dolares,
              status: "ok",
            });
          } catch (error) {
            console.error("❌ Error ejecutando SP:", {
              error: error.message,
              producto: nombre,
              categoria: categoria,
              codigo: codigo_fabricante,
            });

            //manejo de errores si llega a fallar
            errores.push({
              nombre,
              codigo_fabricante,
              categoria,
              error: error.message,
            });
          }
        } catch (err) {
          console.error("⚠️ Error procesando fila:", err.message);
          errores.push({
            fila_data: {
              descripcion: fila["Descripcion"],
              codigo: fila["Part Number"] || fila["Codigo"],
              rubro: fila["Rubro"],
            },
            error: err.message,
          });
        }
      }

      // Respuesta final
      const procesadas_ok = resultados.filter((r) => r.status === "ok").length;
      const omitidas = resultados.filter((r) => r.status === "omitida").length;
      const con_errores = errores.length;
      const total_procesadas = procesadas_ok + omitidas + con_errores;

      console.log(`📊 Resumen de procesamiento:
        - Total filas: ${filas.length}
        - Procesadas OK: ${procesadas_ok}
        - Omitidas: ${omitidas}
        - Con errores: ${con_errores}
        - Total procesadas: ${total_procesadas}`);

      res.json({
        total_filas: filas.length,
        procesadas_ok: procesadas_ok,
        omitidas: omitidas,
        errores: con_errores,
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
          console.log("🗑️ Archivo CSV eliminado:", filePath);
        } catch (err) {
          console.error("No se pudo eliminar el archivo:", err.message);
        }
      }
    }
  }
);

export default routerCargaProducto;
