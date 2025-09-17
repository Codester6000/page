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
  PRECIO_MINIMO_GENERAL: 30000, // Precio mínimo en pesos para cualquier producto
  PRECIO_MINIMO_USADO: 300000, // Precio mínimo específico para productos usados
  PRECIO_MINIMO_PROCESADOR: 64999, // Precio mínimo para productos que contengan "procesador"
  IVA_POR_DEFECTO: 21, // IVA por defecto en porcentaje
  GARANTIA_MESES_DEFECTO: 6, // Garantía por defecto en meses
  COTIZACION_DOLAR_DEFECTO: 1, // Cotización por defecto si falla la API
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

/**
 * Convierte un valor a número, manejando comas como separador decimal
 * @param {any} valor - Valor a convertir
 * @returns {number} - Número parseado o 0 si no es válido
 */
function convertirANumero(valor) {
  if (!valor && valor !== 0) return 0;

  const valorLimpio = valor.toString().replace(",", ".");
  const numeroParsado = parseFloat(valorLimpio);

  return isNaN(numeroParsado) ? 0 : numeroParsado;
}

/**
 * Normaliza el texto de moneda a un formato estándar
 * @param {string} textoMoneda - Texto que representa la moneda
 * @returns {string} - "dolares" o "pesos"
 */
function normalizarTipoMoneda(textoMoneda) {
  if (!textoMoneda) return "pesos";

  const textoLimpio = textoMoneda.toString().toLowerCase().trim();

  const esDolar =
    textoLimpio.includes("ólar") ||
    textoLimpio.includes("dolar") ||
    textoLimpio.includes("usd");

  return esDolar ? "dolares" : "pesos";
}

/**
 * Valida y formatea el código de fabricante
 * @param {string} codigo - Código a validar
 * @returns {string|null} - Código formateado o null si es inválido
 */
function validarYFormatearCodigoFabricante(codigo) {
  if (!codigo || codigo.toString().trim().length <= 2) {
    return null;
  }

  return codigo.toString().trim().toUpperCase();
}

/**
 * Genera un código de fabricante temporal único
 * @param {number} numeroFila - Número de fila para hacer único el código
 * @returns {string} - Código temporal generado
 */
function generarCodigoTemporal(numeroFila) {
  const timestamp = Date.now();
  return `MODEX-${timestamp}-${numeroFila}`;
}

/**
 * Determina el código de fabricante con prioridad: codInt > codBarras > id
 * @param {string} codInt - Código interno
 * @param {string} codBarras - Código de barras
 * @param {string} id - ID del producto
 * @param {number} numeroFila - Número de fila para código temporal
 * @returns {string} - Código de fabricante válido
 */
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

/**
 * Verifica si un producto es usado basándose en su nombre
 * @param {string} nombreProducto - Nombre del producto
 * @returns {boolean} - true si es un producto usado
 */
function esProductoUsado(nombreProducto) {
  return PRODUCTOS_USADOS.some((indicador) =>
    nombreProducto.toUpperCase().includes(indicador)
  );
}

/**
 * Verifica si un producto es un procesador basándose en su nombre
 * @param {string} nombreProducto - Nombre del producto
 * @returns {boolean} - true si es un procesador
 */
function esProcesador(nombreProducto) {
  return nombreProducto.toLowerCase().includes("procesador");
}

/**
 * Valida si un precio es válido según las reglas de negocio
 * @param {number} precio - Precio a validar
 * @param {boolean} esUsado - Si el producto es usado
 * @param {boolean} esProcesadorProducto - Si el producto es un procesador
 * @returns {Object} - Objeto con esValido y motivo
 */
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

  // Validación específica para procesadores
  if (esProcesadorProducto && precio <= CONFIG.PRECIO_MINIMO_PROCESADOR) {
    return {
      esValido: false,
      motivo: `Procesador con precio menor al mínimo permitido (${CONFIG.PRECIO_MINIMO_PROCESADOR})`,
    };
  }

  // Validación específica para productos usados
  if (esUsado && precio < CONFIG.PRECIO_MINIMO_USADO) {
    return {
      esValido: false,
      motivo: `Producto usado con precio menor al mínimo (${CONFIG.PRECIO_MINIMO_USADO})`,
    };
  }

  return { esValido: true, motivo: null };
}

/**
 * Valida el porcentaje de IVA
 * @param {number} iva - Porcentaje de IVA
 * @returns {number} - IVA validado
 */
function validarIVA(iva) {
  if (iva < 0 || iva > 100 || isNaN(iva)) {
    console.warn(
      `⚠️ IVA inválido (${iva}%), usando ${CONFIG.IVA_POR_DEFECTO}% por defecto`
    );
    return CONFIG.IVA_POR_DEFECTO;
  }
  return iva;
}

/**
 * Calcula precios en ambas monedas
 * @param {number} costoOriginal - Costo original del producto
 * @param {string} tipoMoneda - "dolares" o "pesos"
 * @param {number} cotizacionDolar - Cotización del dólar
 * @param {number} ivaValidado - Porcentaje de IVA validado
 * @returns {Object} - Objeto con todos los precios calculados
 */
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

/**
 * Obtiene la cotización del dólar desde la API
 * @returns {Promise<number>} - Cotización del dólar o valor por defecto
 */
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
// PROCESAMIENTO DE DATOS DEL EXCEL
// ============================================================================

/**
 * Extrae y valida los datos básicos de una fila del Excel
 * @param {Object} fila - Fila del Excel
 * @param {number} numeroFila - Número de la fila
 * @returns {Object} - Datos extraídos y validados
 */
function extraerDatosBasicosFila(fila, numeroFila) {
  const datosRaw = {
    id: fila.getCell(1).value?.toString().trim() || "",
    codigoInterno: fila.getCell(2).value?.toString().trim() || "",
    codigoBarras: fila.getCell(3).value?.toString().trim() || "",
    nombre: fila.getCell(4).value?.toString().trim() || "",
    marca:
      fila.getCell(6).value?.toString().trim() || VALORES_POR_DEFECTO.marca,
    categoria:
      fila.getCell(7).value?.toString().trim() || VALORES_POR_DEFECTO.categoria,
    iva: convertirANumero(fila.getCell(8).value),
    tipoMoneda: fila.getCell(9).value?.toString().trim() || "",
    costo: convertirANumero(fila.getCell(10).value),
  };

  // Validaciones tempranas
  if (!datosRaw.nombre || datosRaw.nombre.toLowerCase() === "producto") {
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

/**
 * Procesa una fila completa del Excel
 * @param {Object} fila - Fila del Excel
 * @param {number} numeroFila - Número de la fila
 * @param {number} cotizacionDolar - Cotización actual del dólar
 * @returns {Object} - Resultado del procesamiento
 */
async function procesarFilaExcel(fila, numeroFila, cotizacionDolar) {
  try {
    // Extraer datos básicos
    const extraccion = extraerDatosBasicosFila(fila, numeroFila);

    if (!extraccion.esValido) {
      return {
        tipo: "ignorada",
        fila: numeroFila,
        motivo: extraccion.motivo,
      };
    }

    const datosProducto = extraccion.datos;

    // Calcular precios
    const precios = calcularPrecios(
      datosProducto.costo,
      datosProducto.tipoMonedaNormalizado,
      cotizacionDolar,
      datosProducto.ivaValidado
    );

    // Validar precio final
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

    // Preparar datos para la base de datos
    const datosParaBD = prepararDatosParaBaseDatos(datosProducto, precios);

    // Insertar en base de datos
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

/**
 * Prepara los datos del producto para insertar en la base de datos
 * @param {Object} datosProducto - Datos del producto validados
 * @param {Object} precios - Precios calculados
 * @returns {Array} - Array de parámetros para el stored procedure
 */
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

/**
 * Inserta el producto en la base de datos
 * @param {Array} parametros - Parámetros para el stored procedure
 * @returns {Object} - Resultado de la inserción
 */
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

    // Obtener cotización del dólar
    const cotizacionDolar = await obtenerCotizacionDolar();

    // Contadores y arrays para resultados
    const resultados = {
      exitosas: [],
      omitidas: [],
      errores: [],
      ignoradas: 0,
    };

    try {
      // Leer archivo Excel
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

      // Procesar cada fila (comenzando desde la fila 2, asumiendo headers en fila 1)
      for (let numeroFila = 2; numeroFila <= totalFilas; numeroFila++) {
        const fila = hojaExcel.getRow(numeroFila);
        const resultadoFila = await procesarFilaExcel(
          fila,
          numeroFila,
          cotizacionDolar
        );

        // Clasificar resultado
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

      // Calcular estadísticas finales
      const estadisticas = calcularEstadisticasFinales(resultados, totalFilas);

      // Log del resumen
      imprimirResumenProcesamiento(estadisticas);

      // Respuesta exitosa
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
      // Limpiar archivo temporal
      await limpiarArchivoTemporal(rutaArchivo);
    }
  }
);

// ============================================================================
// FUNCIONES AUXILIARES PARA ESTADÍSTICAS Y LIMPIEZA
// ============================================================================

/**
 * Calcula las estadísticas finales del procesamiento
 * @param {Object} resultados - Resultados clasificados
 * @param {number} totalFilas - Total de filas en el Excel
 * @returns {Object} - Estadísticas completas
 */
function calcularEstadisticasFinales(resultados, totalFilas) {
  const filasConDatos = totalFilas - 1; // Excluir header
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
      productosDolares: resultados.exitosas.filter(
        (r) => r.moneda === "dolares"
      ).length,
      productosPesos: resultados.exitosas.filter((r) => r.moneda === "pesos")
        .length,
      categoriasUnicas: [
        ...new Set(resultados.exitosas.map((r) => r.categoria)),
      ],
      marcasUnicas: [...new Set(resultados.exitosas.map((r) => r.marca))],
    },
  };
}

/**
 * Imprime un resumen detallado del procesamiento en consola
 * @param {Object} estadisticas - Estadísticas del procesamiento
 */
function imprimirResumenProcesamiento(estadisticas) {
  console.log(`
📊 ============== RESUMEN DEL PROCESAMIENTO ==============
📋 Total de filas en Excel (sin header): ${estadisticas.totalFilasExcel}
✅ Procesadas exitosamente: ${estadisticas.procesadasExitosamente}
⚠️  Omitidas por validación: ${estadisticas.omitidas}
❌ Con errores: ${estadisticas.errores}
⏭️  Ignoradas (headers/vacías): ${estadisticas.ignoradas}
📈 Total procesadas: ${estadisticas.totalProcesadas}

💰 Productos por moneda:
   - En dólares: ${estadisticas.detallesAdicionales.productosDolares}
   - En pesos: ${estadisticas.detallesAdicionales.productosPesos}

📦 Categorías procesadas: ${estadisticas.detallesAdicionales.categoriasUnicas.length}
🏷️  Marcas procesadas: ${estadisticas.detallesAdicionales.marcasUnicas.length}
========================================================
  `);
}

/**
 * Elimina el archivo temporal subido
 * @param {string} rutaArchivo - Ruta del archivo a eliminar
 */
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
