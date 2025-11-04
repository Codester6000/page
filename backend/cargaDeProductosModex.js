import express from "express";
import multer from "multer";
import fs from "fs";
import ExcelJS from "exceljs";
import axios from "axios";
import { db } from "./database/connectionMySQL.js";

// ============================================================================
// CONFIGURACIÓN DEL ROUTER Y MIDDLEWARE
// ============================================================================

const routerCargaProductoModexExcel = express.Router();
const upload = multer({ dest: "uploads" });

// ============================================================================
// CONSTANTES Y CONFIGURACIONES
// ============================================================================

const CONFIG = {
  PRECIO_MINIMO_GENERAL: 30000,
  PRECIO_MINIMO_USADO: 300000,
  PRECIO_MINIMO_PROCESADOR: 64999,
  IVA_POR_DEFECTO: 21,
  GARANTIA_MESES_DEFECTO: 6,
  COTIZACION_DOLAR_DEFECTO: 1,
  IMAGEN_POR_DEFECTO: "https://i.imgur.com/0wbrCkz.png",
};

const PRODUCTOS_USADOS = ["(USADO)", "(USADO SIN CAJA)"];

const VALORES_POR_DEFECTO = {
  marca: "Sin marca",
  categoria: "General",
  subCategoria: "General",
  proveedor: "Modex",
  deposito: "Local",
  stock: 0,
  dimensiones: {
    largo: 0.0,
    alto: 0.0,
    ancho: 0.0,
    peso: 0.0,
  },
};

// ============================================================================
// FUNCIONES UTILITARIAS
// ============================================================================

function convertirANumero(valor) {
  if (!valor && valor !== 0) return 0;
  const valorLimpio = valor.toString().replace(",", ".");
  const numeroParsado = parseFloat(valorLimpio);
  return isNaN(numeroParsado) ? 0 : numeroParsado;
}

function normalizarTipoMoneda(textoMoneda) {
  if (!textoMoneda) return "pesos";
  const textoLimpio = textoMoneda.toString().toLowerCase().trim();
  const esDolar =
    textoLimpio.includes("ólar") ||
    textoLimpio.includes("dolar") ||
    textoLimpio.includes("usd");
  return esDolar ? "dolares" : "pesos";
}

function validarYFormatearCodigoFabricante(codigo) {
  if (!codigo || codigo.toString().trim().length <= 2) {
    return null;
  }
  return codigo.toString().trim().toUpperCase();
}

function generarCodigoTemporal(numeroFila) {
  const timestamp = Date.now();
  return `MODEX-${timestamp}-${numeroFila}`;
}

function determinarCodigoFabricante(codInt, codBarras, id, numeroFila) {
  const codigoValido =
    validarYFormatearCodigoFabricante(codInt) ||
    validarYFormatearCodigoFabricante(codBarras) ||
    validarYFormatearCodigoFabricante(id);

  if (!codigoValido) {
    console.warn(
      `⚠️ Fila ${numeroFila}: Generando código temporal por códigos inválidos`
    );
    return generarCodigoTemporal(numeroFila);
  }

  return codigoValido;
}

function esProductoUsado(nombreProducto) {
  return PRODUCTOS_USADOS.some((indicador) =>
    nombreProducto.toUpperCase().includes(indicador)
  );
}

function esProcesador(nombreProducto) {
  return nombreProducto.toLowerCase().includes("procesador");
}

function validarPrecio(precio, esUsado, esProcesadorProducto) {
  if (precio <= 0) {
    return { esValido: false, motivo: "Precio inválido o cero" };
  }

  if (precio < CONFIG.PRECIO_MINIMO_GENERAL) {
    return {
      esValido: false,
      motivo: `Precio menor al mínimo permitido (${CONFIG.PRECIO_MINIMO_GENERAL})`,
    };
  }

  if (esProcesadorProducto && precio <= CONFIG.PRECIO_MINIMO_PROCESADOR) {
    return {
      esValido: false,
      motivo: `Procesador con precio menor al mínimo permitido (${CONFIG.PRECIO_MINIMO_PROCESADOR})`,
    };
  }

  if (esUsado && precio < CONFIG.PRECIO_MINIMO_USADO) {
    return {
      esValido: false,
      motivo: `Producto usado con precio menor al mínimo (${CONFIG.PRECIO_MINIMO_USADO})`,
    };
  }

  return { esValido: true, motivo: null };
}

function validarIVA(iva) {
  if (iva < 0 || iva > 100 || isNaN(iva)) {
    console.warn(
      `⚠️ IVA inválido (${iva}%), usando ${CONFIG.IVA_POR_DEFECTO}% por defecto`
    );
    return CONFIG.IVA_POR_DEFECTO;
  }
  return iva;
}

function calcularPrecios(
  costoOriginal,
  tipoMoneda,
  cotizacionDolar,
  ivaValidado
) {
  const factorIVA = 1 + ivaValidado / 100;

  let precios = {
    precioDolaresSinIVA: 0,
    precioDolaresConIVA: 0,
    preciopesosSinIVA: 0,
    precioPesosConIVA: 0,
  };

  if (tipoMoneda === "dolares") {
    precios.precioDolaresSinIVA = costoOriginal;
    precios.precioDolaresConIVA = Number(
      (costoOriginal * factorIVA).toFixed(2)
    );
    precios.preciopesosSinIVA = Number(
      (costoOriginal * cotizacionDolar).toFixed(2)
    );
    precios.precioPesosConIVA = Number(
      (precios.precioDolaresConIVA * cotizacionDolar).toFixed(2)
    );
  } else {
    precios.preciopesosSinIVA = costoOriginal;
    precios.precioPesosConIVA = Number((costoOriginal * factorIVA).toFixed(2));
    precios.precioDolaresSinIVA = Number(
      (costoOriginal / cotizacionDolar).toFixed(2)
    );
    precios.precioDolaresConIVA = Number(
      (precios.precioPesosConIVA / cotizacionDolar).toFixed(2)
    );
  }

  return precios;
}

async function obtenerCotizacionDolar() {
  try {
    const response = await axios.get("https://dolarapi.com/v1/dolares/oficial");
    const cotizacion =
      parseFloat(response.data.venta) || CONFIG.COTIZACION_DOLAR_DEFECTO;
    console.log("💵 Cotización dólar oficial obtenida:", cotizacion);
    return cotizacion;
  } catch (error) {
    console.error("❌ Error obteniendo cotización del dólar:", error.message);
    console.log(
      `💵 Usando cotización por defecto: ${CONFIG.COTIZACION_DOLAR_DEFECTO}`
    );
    return CONFIG.COTIZACION_DOLAR_DEFECTO;
  }
}

// ============================================================================
// PROCESAMIENTO DE DATOS DEL EXCEL - NUEVO FORMATO
// ============================================================================

/**
 * Extrae y valida los datos básicos de una fila del Excel (NUEVO FORMATO)
 * Mapeo correcto de columnas:
 * 1: Marca
 * 2: Categoría
 * 3: Id Producto
 * 4: Producto
 * 5: Codigo Interno
 * 6: Codigo Interno Prov
 * 7: Codigo Barras
 * 8: Minimo
 * 9: Critico
 * 10: Stock al 01/01/00
 * 11: Ingresos
 * 12: Egresos
 * 13: Stock al 29/10/25
 * 14: Reservas
 * 15: Disponible
 * 16: Reponer
 * 17: Por Recibir
 * 18: Moneda
 * 19: Valor (Costo)
 * 20: Total
 * 21: Ubicación
 * 22: Temporada
 * 23: Alicuota (IVA)
 * 24: Proveedor
 */
function extraerDatosBasicosFila(fila, numeroFila) {
  // Extraer valores según el nuevo formato del Excel
  const datosRaw = {
    marca:
      fila.getCell(1).value?.toString().trim() || VALORES_POR_DEFECTO.marca,
    categoria:
      fila.getCell(2).value?.toString().trim() || VALORES_POR_DEFECTO.categoria,
    id: fila.getCell(3).value?.toString().trim() || "",
    nombre: fila.getCell(4).value?.toString().trim() || "",
    codigoInterno: fila.getCell(5).value?.toString().trim() || "",
    codigoBarras: fila.getCell(7).value?.toString().trim() || "",
    tipoMoneda: fila.getCell(18).value?.toString().trim() || "",
    costo: convertirANumero(fila.getCell(19).value),
    iva: convertirANumero(fila.getCell(23).value),
  };

  // Validaciones tempranas
  if (
    !datosRaw.nombre ||
    datosRaw.nombre.toLowerCase() === "producto" ||
    datosRaw.nombre.toLowerCase().includes("id producto")
  ) {
    return { esValido: false, motivo: "Fila de encabezado o nombre vacío" };
  }

  const datosValidados = {
    ...datosRaw,
    codigoFabricante: determinarCodigoFabricante(
      datosRaw.codigoInterno,
      datosRaw.codigoBarras,
      datosRaw.id,
      numeroFila
    ),
    tipoMonedaNormalizado: normalizarTipoMoneda(datosRaw.tipoMoneda),
    ivaValidado: validarIVA(datosRaw.iva),
    esUsado: esProductoUsado(datosRaw.nombre),
    esProcesador: esProcesador(datosRaw.nombre),
  };

  return { esValido: true, datos: datosValidados };
}

async function procesarFilaExcel(fila, numeroFila, cotizacionDolar) {
  try {
    const extraccion = extraerDatosBasicosFila(fila, numeroFila);

    if (!extraccion.esValido) {
      return {
        tipo: "ignorada",
        fila: numeroFila,
        motivo: extraccion.motivo,
      };
    }

    const datosProducto = extraccion.datos;

    const precios = calcularPrecios(
      datosProducto.costo,
      datosProducto.tipoMonedaNormalizado,
      cotizacionDolar,
      datosProducto.ivaValidado
    );

    const validacionPrecio = validarPrecio(
      precios.precioPesosConIVA,
      datosProducto.esUsado,
      datosProducto.esProcesador
    );

    if (!validacionPrecio.esValido) {
      console.warn(
        `⚠️ Fila ${numeroFila}: ${validacionPrecio.motivo} - Producto: ${datosProducto.nombre}`
      );
      return {
        tipo: "omitida",
        fila: numeroFila,
        codigo: datosProducto.codigoFabricante,
        nombre: datosProducto.nombre,
        motivo: validacionPrecio.motivo,
        precioCalculado: precios.precioPesosConIVA,
      };
    }

    const datosParaBD = prepararDatosParaBaseDatos(datosProducto, precios);
    const resultadoBD = await insertarProductoEnBD(datosParaBD);

    console.log(`✅ Fila ${numeroFila} procesada correctamente:`, {
      codigo: datosProducto.codigoFabricante,
      nombre: datosProducto.nombre,
      categoria: datosProducto.categoria,
      moneda: datosProducto.tipoMonedaNormalizado,
      precioFinal:
        datosProducto.tipoMonedaNormalizado === "dolares"
          ? `$${precios.precioDolaresConIVA} USD`
          : `$${precios.precioPesosConIVA} ARS`,
    });

    return {
      tipo: "exitosa",
      fila: numeroFila,
      codigo: datosProducto.codigoFabricante,
      nombre: datosProducto.nombre,
      categoria: datosProducto.categoria,
      marca: datosProducto.marca,
      moneda: datosProducto.tipoMonedaNormalizado,
      precioDolares: precios.precioDolaresConIVA,
      precioPesos: precios.precioPesosConIVA,
      resultadoBD,
    };
  } catch (error) {
    console.error(`❌ Error procesando fila ${numeroFila}:`, error.message);
    return {
      tipo: "error",
      fila: numeroFila,
      error: `Error de procesamiento: ${error.message}`,
    };
  }
}

function prepararDatosParaBaseDatos(datosProducto, precios) {
  const detalle = `Producto Modex - Marca: ${datosProducto.marca}`;

  return [
    datosProducto.nombre,
    VALORES_POR_DEFECTO.stock,
    CONFIG.GARANTIA_MESES_DEFECTO,
    detalle,
    VALORES_POR_DEFECTO.dimensiones.largo,
    VALORES_POR_DEFECTO.dimensiones.alto,
    VALORES_POR_DEFECTO.dimensiones.ancho,
    VALORES_POR_DEFECTO.dimensiones.peso,
    datosProducto.codigoFabricante,
    datosProducto.marca,
    datosProducto.categoria,
    VALORES_POR_DEFECTO.subCategoria,
    VALORES_POR_DEFECTO.proveedor,
    precios.precioDolaresSinIVA,
    precios.precioDolaresConIVA,
    datosProducto.ivaValidado,
    precios.preciopesosSinIVA,
    precios.precioPesosConIVA,
    CONFIG.IMAGEN_POR_DEFECTO,
    VALORES_POR_DEFECTO.deposito,
  ];
}

async function insertarProductoEnBD(parametros) {
  try {
    const [resultado] = await db.query(
      "CALL cargarDatosProducto(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      parametros
    );
    return resultado[0];
  } catch (error) {
    throw new Error(`Error en base de datos: ${error.message}`);
  }
}

// ============================================================================
// ENDPOINT PRINCIPAL
// ============================================================================

routerCargaProductoModexExcel.post(
  "/cargar-articulos",
  upload.single("archivo_excel"),
  async (req, res) => {
    const rutaArchivo = req.file?.path;

    if (!rutaArchivo) {
      return res.status(400).json({
        error: "No se envió ningún archivo Excel válido.",
      });
    }

    console.log("📁 Iniciando procesamiento de archivo Excel:", rutaArchivo);

    const cotizacionDolar = await obtenerCotizacionDolar();

    const resultados = {
      exitosas: [],
      omitidas: [],
      errores: [],
      ignoradas: 0,
    };

    try {
      const libroExcel = new ExcelJS.Workbook();
      await libroExcel.xlsx.readFile(rutaArchivo);
      const hojaExcel = libroExcel.worksheets[0];

      if (!hojaExcel) {
        throw new Error("No se encontró ninguna hoja en el archivo Excel");
      }

      const totalFilas = hojaExcel.rowCount;
      console.log(
        `📑 Procesando hoja: "${hojaExcel.name}" - Total de filas: ${totalFilas}`
      );

      for (let numeroFila = 2; numeroFila <= totalFilas; numeroFila++) {
        const fila = hojaExcel.getRow(numeroFila);
        const resultadoFila = await procesarFilaExcel(
          fila,
          numeroFila,
          cotizacionDolar
        );

        switch (resultadoFila.tipo) {
          case "exitosa":
            resultados.exitosas.push(resultadoFila);
            break;
          case "omitida":
            resultados.omitidas.push(resultadoFila);
            break;
          case "error":
            resultados.errores.push(resultadoFila);
            break;
          case "ignorada":
            resultados.ignoradas++;
            console.log(
              `⏭️ Fila ${numeroFila} ignorada: ${resultadoFila.motivo}`
            );
            break;
        }
      }

      const estadisticas = calcularEstadisticasFinales(resultados, totalFilas);
      imprimirResumenProcesamiento(estadisticas);

      res.json({
        mensaje: "Procesamiento completado",
        estadisticas,
        detalles: {
          exitosas: resultados.exitosas,
          omitidas: resultados.omitidas,
          errores: resultados.errores,
        },
      });
    } catch (error) {
      console.error(
        "❌ Error general durante el procesamiento:",
        error.message
      );
      res.status(500).json({
        error: "Error interno del servidor durante el procesamiento",
        detalle: error.message,
      });
    } finally {
      await limpiarArchivoTemporal(rutaArchivo);
    }
  }
);

// ============================================================================
// FUNCIONES AUXILIARES PARA ESTADÍSTICAS Y LIMPIEZA
// ============================================================================

function calcularEstadisticasFinales(resultados, totalFilas) {
  const filasConDatos = totalFilas - 1;
  const procesadas = resultados.exitosas.length;
  const omitidas = resultados.omitidas.length;
  const errores = resultados.errores.length;
  const ignoradas = resultados.ignoradas;

  return {
    totalFilasExcel: filasConDatos,
    procesadasExitosamente: procesadas,
    omitidas: omitidas,
    errores: errores,
    ignoradas: ignoradas,
    totalProcesadas: procesadas + omitidas + errores + ignoradas,
    detallesAdicionales: {
      categoriasUnicas: [
        ...new Set(resultados.exitosas.map((r) => r.categoria)),
      ],
      marcasUnicas: [...new Set(resultados.exitosas.map((r) => r.marca))],
    },
  };
}

function imprimirResumenProcesamiento(estadisticas) {
  console.log(`
📊 ============== RESUMEN DEL PROCESAMIENTO ==============
📋 Total de filas en Excel (sin header): ${estadisticas.totalFilasExcel}
✅ Procesadas exitosamente: ${estadisticas.procesadasExitosamente}
⚠️  Omitidas por validación: ${estadisticas.omitidas}
❌ Con errores: ${estadisticas.errores}
⏭️  Ignoradas (headers/vacías): ${estadisticas.ignoradas}
📈 Total procesadas: ${estadisticas.totalProcesadas}

📦 Categorías procesadas: ${estadisticas.detallesAdicionales.categoriasUnicas.length}
🏷️  Marcas procesadas: ${estadisticas.detallesAdicionales.marcasUnicas.length}
========================================================
  `);
}

async function limpiarArchivoTemporal(rutaArchivo) {
  if (rutaArchivo && fs.existsSync(rutaArchivo)) {
    try {
      fs.unlinkSync(rutaArchivo);
      console.log("🗑️ Archivo temporal eliminado correctamente:", rutaArchivo);
    } catch (error) {
      console.error(
        "⚠️ No se pudo eliminar el archivo temporal:",
        error.message
      );
    }
  }
}

export default routerCargaProductoModexExcel;
