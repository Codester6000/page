import express from "express";
import multer from "multer";
import ExcelJS from "exceljs";
import axios from "axios";
import fs from "fs";
import { db } from "./database/connectionMySQL.js";
import { categorias_final_air } from "./recursos/categorias.js";
import {
  normalize,
  cellToString,
  parseNum,
  pickCodigoFabricante,
  wanted,
} from "./middleware/verificarCargaProducto.js";

const routerCargaProducto = express.Router();
const upload = multer({ dest: "uploads/" });

const categorias_por_nombre = Object.entries(categorias_final_air).reduce(
  (acc, [key, value]) => {
    acc[value] = key;
    return acc;
  },
  {}
);

routerCargaProducto.post(
  "/cargar-productos",
  upload.single("archivo_excel"),
  async (req, res) => {
    const filePath = req.file?.path;
    if (!filePath)
      return res
        .status(400)
        .json({ error: "No se envió ningún archivo Excel." });

    let dolar_venta = null;

    try {
      await db.query("CALL deshabilitar_air()");

      const { data } = await axios.get(
        "https://dolarapi.com/v1/dolares/oficial"
      );
      dolar_venta = Number(data?.venta) || null;

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const worksheet = workbook.worksheets[0];

      if (!worksheet)
        throw new Error("No se encontró la primera hoja del Excel.");

      // Mapear encabezados
      let headerRowIdx = 1;
      let columnMap = {};
      for (let i = 1; i <= Math.min(10, worksheet.rowCount); i++) {
        const row = worksheet.getRow(i);
        const tempMap = {};
        row.eachCell((cell, colIndex) => {
          const key = normalize(cellToString(cell.value));
          if (key) tempMap[key] = colIndex;
        });
        if (
          tempMap["id"] != null &&
          tempMap["producto"] != null &&
          tempMap["categoria"] != null &&
          tempMap["costo"] != null
        ) {
          headerRowIdx = i;
          columnMap = tempMap;
          break;
        }
      }
      if (Object.keys(columnMap).length === 0) {
        throw new Error(
          "No se encontraron encabezados válidos en las primeras filas."
        );
      }

      const resolveCol = (aliases) => {
        for (const a of aliases) {
          const key = normalize(a);
          if (columnMap[key] != null) return columnMap[key];
        }
        return null;
      };

      const cols = {};
      for (const key in wanted) cols[key] = resolveCol(wanted[key]);
      if (!cols.producto || !cols.categoria || !cols.costo)
        throw new Error(
          `Encabezados requeridos no encontrados. Detectados: ${JSON.stringify(
            columnMap
          )}`
        );

      const getVal = (row, colIndex) =>
        colIndex == null ? null : row.getCell(colIndex)?.value ?? null;

      const resultados = [];
      const errores = [];

      for (let i = headerRowIdx + 1; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);
        try {
          const nombre = cellToString(getVal(row, cols.producto)).trim();

          const nombre_categoria_xlsx = cellToString(
            getVal(row, cols.categoria)
          ).trim();

          const codigo_categoria =
            categorias_por_nombre[nombre_categoria_xlsx] || 0;

          if (!nombre || !codigo_categoria) {
            resultados.push({
              fila: i,
              status: "omitida",
              motivo: "Sin nombre o categoría válida",
            });
            continue;
          }

          // Stock y depósito
          let stock = 0;
          let deposito = "Local";
          const cba = parseNum(getVal(row, columnMap["cba"]));
          const lug = parseNum(getVal(row, columnMap["lug"]));
          if (cba > 0) {
            stock = cba;
            deposito = "CBA";
          } else if (lug > 0) {
            stock = lug;
            deposito = "LUG";
          } else {
            stock = Number.isFinite(parseNum(getVal(row, cols.p)))
              ? parseNum(getVal(row, cols.p))
              : 0;
          }

          const marca = cellToString(getVal(row, cols.marca))?.trim() || "a";
          const iva = Number.isFinite(parseNum(getVal(row, cols.iva)))
            ? parseNum(getVal(row, cols.iva))
            : 0;
          const monedaStr =
            cellToString(getVal(row, cols.moneda))?.trim() || "";
          const costo = parseNum(getVal(row, cols.costo));
          const codInt = cellToString(getVal(row, cols.codInt)).trim();
          const codBarras = cellToString(getVal(row, cols.codBarras)).trim();
          const idHoja = cellToString(getVal(row, cols.id)).trim();
          const codigo_fabricante = pickCodigoFabricante([
            codInt,
            codBarras,
            idHoja,
          ]);

          let precio_dolares = null;
          let precio_pesos = null;
          const isUSD = ["usd", "dolares", "$usd", "u$s"].includes(
            normalize(monedaStr)
          );
          if (isUSD) {
            precio_dolares = costo;
            precio_pesos =
              precio_dolares != null && dolar_venta
                ? precio_dolares * dolar_venta
                : null;
          } else {
            precio_pesos = costo;
            precio_dolares =
              precio_pesos != null && dolar_venta
                ? precio_pesos / dolar_venta
                : null;
          }

          const precio_dolares_iva =
            precio_dolares != null
              ? +(precio_dolares * (1 + iva / 100)).toFixed(2)
              : null;
          const precio_pesos_iva =
            precio_pesos != null
              ? +(precio_pesos * (1 + iva / 100)).toFixed(2)
              : null;

          const toFixedOrNull = (n) => (n == null ? null : +(+n).toFixed(2));

          const params = [
            nombre,
            Number.isFinite(stock) ? stock : 0,
            6,
            "a",
            0.0,
            0.0,
            0.0,
            0.0,
            codigo_fabricante || null,
            marca || "a",
            nombre_categoria_xlsx,
            "a",
            "air",
            toFixedOrNull(precio_dolares),
            toFixedOrNull(precio_dolares_iva),
            toFixedOrNull(iva),
            toFixedOrNull(precio_pesos),
            toFixedOrNull(precio_pesos_iva),
            "https://i.imgur.com/0wbrCkz.png",
            deposito,
          ];

          console.log("Params a SP:", params);

          await db.query(
            "CALL cargarDatosProducto(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            params
          );

          resultados.push({
            fila: i,
            status: "ok",
            nombre,
            categoria: nombre_categoria_xlsx,
            codigo_fabricante,
          });
        } catch (err) {
          errores.push({ fila: i, error: err?.message || String(err) });
        }
      }

      res.json({
        total_filas_excel: Math.max(worksheet.rowCount - headerRowIdx, 0),
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
      res.status(500).json({
        error: "Error en el servidor",
        detalle: error?.message || String(error),
      });
    } finally {
      if (filePath && fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch {}
      }
    }
  }
);

export default routerCargaProducto;
