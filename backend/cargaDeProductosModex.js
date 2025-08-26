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
  return parseFloat(val.toString().replace(",", "."));
}

routerCargaProductoModexExcel.post(
  "/cargar-articulos",
  upload.single("archivo_excel"),
  async (req, res) => {
    const filePath = req.file?.path;
    if (!filePath)
      return res
        .status(400)
        .json({ error: "No se envió ningún archivo Excel." });

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
      console.log("📑 Hoja leída:", sheet.name);

      // Recorrer filas
      for (let i = 2; i <= sheet.rowCount; i++) {
        const row = sheet.getRow(i);
        const nombre = row.getCell(4).value?.toString().trim() || "";

        if (!nombre || nombre.toLowerCase() === "producto") {
          ignoradas++;
          console.log(`⏭️ Fila ${i} ignorada (encabezado o vacía)`);
          continue;
        }

        try {
          const codigo_fabricante =
            row.getCell(2).value?.toString().trim() || // Cod.Int.
            row.getCell(1).value?.toString().trim() ||
            ""; // fallback ID
          const marca = row.getCell(6).value?.toString().trim() || "";
          const categoria =
            row.getCell(7).value?.toString().trim() || "General";
          const iva = parseNum(row.getCell(8).value); // Alicuota IVA
          const moneda = row.getCell(9).value?.toString().trim() || "";
          const costo = parseNum(row.getCell(10).value);

          const deposito = "Local";
          const stock = 0;
          const garantia_meses = 6;
          const detalle = "";
          const largo = 0;
          const alto = 0;
          const ancho = 0;
          const peso = 0;
          const sub_categoria = "General";
          const proveedor = "Modex";
          const url_imagen = "https://i.imgur.com/0wbrCkz.png";

          let precioPesos = 0,
            precioPesosIVA = 0,
            precioDolares = 0,
            precioDolaresIVA = 0;

          if (moneda.includes("ólar")) {
            precioDolares = costo;
            precioDolaresIVA = costo * (1 + iva / 100);
            precioPesos = costo * dolarVenta;
            precioPesosIVA = precioDolaresIVA * dolarVenta;
          } else {
            precioPesos = costo;
            precioPesosIVA = costo * (1 + iva / 100);
            precioDolares = costo / dolarVenta;
            precioDolaresIVA = precioPesosIVA / dolarVenta;
          }

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

          console.log("➡️ Insertando fila:", parametros);

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
          errores.push({ fila: i, error: err.message });
          console.error(`❌ Error en fila ${i}:`, err.message);
        }
      }

      res.json({
        procesadas_ok: resultados.length,
        errores: errores.length,
        ignoradas,
        detalles: { ok: resultados, errores },
      });
    } catch (err) {
      console.error("❌ Error general:", err.message);
      res.status(500).json({
        error: "Error en el servidor",
        detalle: err?.message || String(err),
      });
    } finally {
      if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  }
);

export default routerCargaProductoModexExcel;
