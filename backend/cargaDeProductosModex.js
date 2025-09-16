import express from "express";
import multer from "multer";
import fs from "fs";
import ExcelJS from "exceljs";
import axios from "axios";
import { db } from "./database/connectionMySQL.js";

const routerCargaProductoModexExcel = express.Router();
const upload = multer({ dest: "uploads" });

function parseNum(val) {
  if (!val) return 0;
  const numStr = val.toString().replace(",", ".");
  const parsed = parseFloat(numStr);
  return isNaN(parsed) ? 0 : parsed;
}

// Función para normalizar texto de moneda
function normalizarMoneda(texto) {
  if (!texto) return "";
  const textoLimpio = texto.toString().toLowerCase().trim();
  if (
    textoLimpio.includes("ólar") ||
    textoLimpio.includes("dolar") ||
    textoLimpio.includes("usd")
  ) {
    return "dolares";
  }
  if (
    textoLimpio.includes("peso") ||
    textoLimpio.includes("ars") ||
    textoLimpio.includes("$")
  ) {
    return "pesos";
  }
  return "pesos"; // Por defecto asumir pesos
}

// Función para validar código de fabricante
function validarCodigoFabricante(codigo) {
  if (!codigo || codigo.trim().length <= 2) {
    return null;
  }
  return codigo.toString().trim().toUpperCase();
}

routerCargaProductoModexExcel.post(
  "/cargar-articulos",
  upload.single("archivo_excel"),
  async (req, res) => {
    const filePath = req.file?.path;
    if (!filePath) {
      return res
        .status(400)
        .json({ error: "No se envió ningún archivo Excel." });
    }

    let dolarVenta = 1;
    try {
      const response = await axios.get(
        "https://dolarapi.com/v1/dolares/oficial"
      );
      dolarVenta = parseFloat(response.data.venta) || 1;
      console.log("💵 Dólar oficial:", dolarVenta);
    } catch (err) {
      console.error("❌ Error obteniendo dólar:", err.message);
    }

    const resultados = [];
    const errores = [];
    let ignoradas = 0;

    try {
      // Leer archivo Excel
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const sheet = workbook.worksheets[0];
      console.log(
        "📑 Hoja leída:",
        sheet.name,
        "- Total filas:",
        sheet.rowCount
      );

      // Recorrer filas (empezando desde la fila 2, asumiendo headers en fila 1)
      for (let i = 2; i <= sheet.rowCount; i++) {
        try {
          const row = sheet.getRow(i);

          // Leer datos básicos de la fila
          const id = row.getCell(1).value?.toString().trim() || "";
          const codInt = row.getCell(2).value?.toString().trim() || "";
          const codBarras = row.getCell(3).value?.toString().trim() || "";
          const nombre = row.getCell(4).value?.toString().trim() || "";
          const marca = row.getCell(6).value?.toString().trim() || "Sin marca";
          const categoria =
            row.getCell(7).value?.toString().trim() || "General";
          const iva = parseNum(row.getCell(8).value);
          const moneda = row.getCell(9).value?.toString().trim() || "";
          const costo = parseNum(row.getCell(10).value);

          // Validaciones tempranas para omitir filas problemáticas
          if (!nombre || nombre.toLowerCase() === "producto") {
            ignoradas++;
            console.log(`⏭️ Fila ${i} ignorada: encabezado o nombre vacío`);
            continue;
          }

          // Determinar código de fabricante con prioridad
          let codigo_fabricante =
            validarCodigoFabricante(codInt) ||
            validarCodigoFabricante(codBarras) ||
            validarCodigoFabricante(id);

          if (!codigo_fabricante) {
            console.warn(
              `⚠️ Fila ${i}: Código de fabricante inválido, generando uno temporal`
            );
            codigo_fabricante = `MODEX-${Date.now()}-${i}`;
          }

          // Validar precio
          if (costo <= 0) {
            console.warn(
              `⚠️ Fila ${i}: Precio inválido (${costo}) para producto: ${nombre}`
            );
            resultados.push({
              fila: i,
              codigo: codigo_fabricante,
              nombre,
              status: "omitida",
              motivo: "Precio inválido o cero",
            });
            continue;
          }

          // Validar IVA
          if (iva < 0 || iva > 100) {
            console.warn(
              `⚠️ Fila ${i}: IVA inválido (${iva}%) para producto: ${nombre}, usando 21%`
            );
            iva = 21; // IVA por defecto
          }

          const esUsado = nombre.includes("(USADO)");
          // Datos fijos para productos Modex
          const deposito = "Local";
          const stock = 0; // Excel no incluye stock, se maneja por separado
          const garantia_meses = 6;
          const detalle = `Producto Modex - Marca: ${marca}`;
          const largo = 0.0;
          const alto = 0.0;
          const ancho = 0.0;
          const peso = 0.0;
          const sub_categoria = "General";
          const proveedor = "Modex";
          const url_imagen = "https://i.imgur.com/0wbrCkz.png";

          // Cálculo de precios según moneda
          let precioPesos = 0,
            precioPesosIVA = 0,
            precioDolares = 0,
            precioDolaresIVA = 0;

          const monedaNormalizada = normalizarMoneda(moneda);

          if (monedaNormalizada === "dolares") {
            precioDolares = costo;
            precioDolaresIVA = +(costo * (1 + iva / 100)).toFixed(2);
            precioPesos = +(costo * dolarVenta).toFixed(2);
            precioPesosIVA = +(precioDolaresIVA * dolarVenta).toFixed(2);
          } else {
            // Asumir pesos
            precioPesos = costo;
            precioPesosIVA = +(costo * (1 + iva / 100)).toFixed(2);
            precioDolares = +(costo / dolarVenta).toFixed(2);
            precioDolaresIVA = +(precioPesosIVA / dolarVenta).toFixed(2);
          }

          if (esUsado && precioPesosIVA <= 300000) {
            console.warn(
              `⚠️ Fila ${i}: Precio muy bajo (${precioPesosIVA}) para producto: ${nombre}`
            );
            resultados.push({
              fila: i,
              codigo: codigo_fabricante,
              nombre,
              status: "omitida",
              motivo: "Precio inválido o cero",
            });
            continue;
          }

          console.log(`Precio final: ${precioPesosIVA}`);

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

          try {
            const [result] = await db.query(
              "CALL cargarDatosProducto(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
              parametros
            );

            console.log(`✅ Fila ${i} procesada correctamente:`, {
              codigo: codigo_fabricante,
              nombre,
              categoria,
              moneda: monedaNormalizada,
              precio_final:
                monedaNormalizada === "dolares"
                  ? `$${precioDolaresIVA} USD`
                  : `$${precioPesosIVA} ARS`,
              resultado: result[0],
            });

            resultados.push({
              fila: i,
              codigo: codigo_fabricante,
              nombre,
              categoria,
              marca,
              moneda: monedaNormalizada,
              precio_dolares: precioDolaresIVA,
              precio_pesos: precioPesosIVA,
              status: "ok",
            });
          } catch (dbError) {
            console.error(`❌ Error BD en fila ${i}:`, dbError.message);
            errores.push({
              fila: i,
              codigo: codigo_fabricante,
              nombre,
              categoria,
              error: `Error BD: ${dbError.message}`,
              datos: {
                moneda: monedaNormalizada,
                costo_original: costo,
                precio_calculado:
                  monedaNormalizada === "dolares"
                    ? precioDolaresIVA
                    : precioPesosIVA,
              },
            });
          }
        } catch (rowError) {
          console.error(`❌ Error procesando fila ${i}:`, rowError.message);
          errores.push({
            fila: i,
            error: `Error procesamiento: ${rowError.message}`,
          });
        }
      }

      // Estadísticas finales
      const procesadas_ok = resultados.filter((r) => r.status === "ok").length;
      const omitidas = resultados.filter((r) => r.status === "omitida").length;
      const total_errores = errores.length;
      const total_procesadas =
        procesadas_ok + omitidas + total_errores + ignoradas;

      console.log(`📊 Resumen final:
        - Total filas en Excel: ${sheet.rowCount - 1}
        - Procesadas correctamente: ${procesadas_ok}
        - Omitidas por validación: ${omitidas}
        - Con errores: ${total_errores}
        - Ignoradas (headers/vacías): ${ignoradas}
        - Total procesadas: ${total_procesadas}`);

      res.json({
        total_filas: sheet.rowCount - 1,
        procesadas_ok: procesadas_ok,
        omitidas: omitidas,
        errores: total_errores,
        ignoradas: ignoradas,
        detalles: {
          ok: resultados.filter((r) => r.status === "ok"),
          omitidas: resultados.filter((r) => r.status === "omitida"),
          errores,
        },
        estadisticas: {
          productos_dolares: resultados.filter(
            (r) => r.status === "ok" && r.moneda === "dolares"
          ).length,
          productos_pesos: resultados.filter(
            (r) => r.status === "ok" && r.moneda === "pesos"
          ).length,
          categorias_procesadas: [
            ...new Set(
              resultados
                .filter((r) => r.status === "ok")
                .map((r) => r.categoria)
            ),
          ],
          marcas_procesadas: [
            ...new Set(
              resultados.filter((r) => r.status === "ok").map((r) => r.marca)
            ),
          ],
        },
      });
    } catch (err) {
      console.error("❌ Error general:", err.message);
      res.status(500).json({
        error: "Error en el servidor",
        detalle: err?.message || String(err),
      });
    } finally {
      if (filePath && fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log("🗑️ Archivo Excel eliminado:", filePath);
        } catch (unlinkErr) {
          console.error("No se pudo eliminar el archivo:", unlinkErr.message);
        }
      }
    }
  }
);

export default routerCargaProductoModexExcel;
