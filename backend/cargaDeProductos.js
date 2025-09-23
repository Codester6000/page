import express from "express";
import multer from "multer";
import fs from "fs";
import Papa from "papaparse";
import axios from "axios";
import { db } from "./database/connectionMySQL.js";
import { categorias_final_air } from "./recursos/categorias.js";

// ============================================================================
// CONFIGURACIÓN DEL ROUTER Y MIDDLEWARE
// ============================================================================

const routerCargaProducto = express.Router();
const upload = multer({ dest: "uploads/" });

// ============================================================================
// CONSTANTES Y CONFIGURACIONES
// ============================================================================

const CONFIG = {
  PRECIO_MINIMO_GENERAL: 30000, // Precio mínimo en pesos para cualquier producto
  PRECIO_MINIMO_PROCESADOR: 64999, // Precio mínimo específico para procesadores
  PRECIO_MINIMO_NO_ALMACENAMIENTO: 64999, // Precio mínimo para productos que no son almacenamiento
  GARANTIA_MESES_DEFECTO: 6, // Garantía por defecto en meses
  COTIZACION_DOLAR_DEFECTO: 1, // Cotización por defecto si falla la API
  IMAGEN_POR_DEFECTO: "https://i.imgur.com/0wbrCkz.png",
  CODIGO_MINIMO_LONGITUD: 2, // Longitud mínima del código de fabricante
  MARGEN_PROCESADOR: 1.2, // Margen para procesadores (20%)
  MARGEN_GENERAL: 1.27, // Margen general (27%)
};

// Códigos de rubros para diferentes categorías de productos
const RUBROS_PRODUCTOS = {
  procesadores: ["001-0056", "001-0330"],
  almacenamiento: ["001-0134", "002-0137"],
  computadoras: ["001-0014", "002-0015"],
  fanes: ["001-0002", "001-03320"],
  estabilizadores: ["001-0160"],
  fuenteAlimentacion: ["001-0556"],
  gabinete: ["001-0190"],
  impresoras: [
    "001-0607",
    "001-0604",
    "001-0605",
    "001-0606",
    "001-0600",
    "001-0602",
    "001-0603",
    "001-900",
  ],
  memorias: ["002-0280"],
  microprocesadores: ["001-0330"],
  miniPc: ["002-1616", "001-1616"],
  monitores: ["001-0320", "002-0320"],
  motherboard: ["001-0331"],
  notebooks: ["001-0360", "002-0361"],
  placaVga: ["002-0553"],
  sillas: ["001-0015"],
  // Aquí puedes agregar más rubros permitidos
};

// Lista de todos los rubros permitidos (combinación de todas las categorías)
const RUBROS_PERMITIDOS = [
  ...RUBROS_PRODUCTOS.procesadores,
  ...RUBROS_PRODUCTOS.almacenamiento,
  ...RUBROS_PRODUCTOS.computadoras,
  ...RUBROS_PRODUCTOS.fanes,
  ...RUBROS_PRODUCTOS.estabilizadores,
  ...RUBROS_PRODUCTOS.fuenteAlimentacion,
  ...RUBROS_PRODUCTOS.gabinete,
  ...RUBROS_PRODUCTOS.impresoras,
  ...RUBROS_PRODUCTOS.memorias,
  ...RUBROS_PRODUCTOS.microprocesadores,
  ...RUBROS_PRODUCTOS.miniPc,
  ...RUBROS_PRODUCTOS.monitores,
  ...RUBROS_PRODUCTOS.motherboard,
  ...RUBROS_PRODUCTOS.notebooks,
  ...RUBROS_PRODUCTOS.placaVga,
  ...RUBROS_PRODUCTOS.sillas,
];

const VALORES_POR_DEFECTO = {
  categoria: "Sin categoría",
  subcategoria: "Sin subcategoría",
  marca: "a",
  proveedor: "air",
  deposito: "CBA",
  dimensiones: {
    largo: 0.0,
    alto: 0.0,
    ancho: 0.0,
    peso: 0.0,
  },
};

const DEPOSITOS_DISPONIBLES = ["CBA", "LUG", "ROS", "MZA"];

// ============================================================================
// FUNCIONES UTILITARIAS
// ============================================================================

/**
 * Detecta el separador del archivo CSV analizando la primera línea
 * @param {string} primeraLinea - Primera línea del archivo CSV
 * @returns {string} - Separador detectado (tab, punto y coma, o coma)
 */
function detectarSeparadorCSV(primeraLinea) {
  const contadores = {
    comas: (primeraLinea.match(/,/g) || []).length,
    tabs: (primeraLinea.match(/\t/g) || []).length,
    puntosComa: (primeraLinea.match(/;/g) || []).length,
  };

  if (
    contadores.tabs >= contadores.comas &&
    contadores.tabs >= contadores.puntosComa
  ) {
    return "\t";
  }

  if (contadores.puntosComa >= contadores.comas) {
    return ";";
  }

  return ",";
}

/**
 * Convierte un valor a número, manejando valores nulos o inválidos
 * @param {any} valor - Valor a convertir
 * @returns {number} - Número parseado o 0 si no es válido
 */
function convertirANumero(valor) {
  const numero = parseFloat(valor);
  return isNaN(numero) ? 0 : numero;
}

/**
 * Obtiene la cotización del dólar desde la API y deshabilita productos AIR
 * @returns {Promise<number>} - Cotización del dólar o valor por defecto
 */
async function obtenerCotizacionDolarYConfigurar() {
  try {
    // Deshabilitar productos AIR existentes
    await db.query("CALL deshabilitar_air()");
    console.log("✅ Productos AIR deshabilitados correctamente");

    // Obtener cotización del dólar
    const response = await axios.get("https://dolarapi.com/v1/dolares/oficial");
    const cotizacion =
      Number(response.data?.venta) || CONFIG.COTIZACION_DOLAR_DEFECTO;

    console.log("💵 Cotización dólar oficial obtenida:", cotizacion);
    return cotizacion;
  } catch (error) {
    console.error("❌ Error en configuración inicial:", error.message);
    throw new Error(`Error obteniendo dólar oficial: ${error.message}`);
  }
}

// ============================================================================
// FUNCIONES DE VALIDACIÓN Y CLASIFICACIÓN
// ============================================================================

/**
 * Determina si un producto pertenece a una categoría específica por su rubro
 * @param {string} codigoRubro - Código de rubro del producto
 * @param {string} categoria - Categoría a verificar ('procesadores', 'almacenamiento', etc.)
 * @returns {boolean} - true si pertenece a la categoría
 */
function perteneceACategoria(codigoRubro, categoria) {
  return RUBROS_PRODUCTOS[categoria]?.includes(codigoRubro) || false;
}

/**
 * Valida si un rubro está dentro de los permitidos para procesamiento
 * @param {string} codigoRubro - Código de rubro a validar
 * @returns {Object} - Objeto con esValido y categoriaDetectada
 */
function validarRubroPermitido(codigoRubro) {
  if (!codigoRubro || !RUBROS_PERMITIDOS.includes(codigoRubro)) {
    return {
      esValido: false,
      motivo: "Rubro no permitido para procesamiento",
      categoriaDetectada: null,
    };
  }

  // Determinar la categoría del producto
  let categoriaDetectada = "general";
  for (const [categoria, rubros] of Object.entries(RUBROS_PRODUCTOS)) {
    if (rubros.includes(codigoRubro)) {
      categoriaDetectada = categoria;
      break;
    }
  }

  return {
    esValido: true,
    motivo: null,
    categoriaDetectada,
  };
}

/**
 * Valida el código de fabricante según las reglas de negocio
 * @param {string} codigo - Código a validar
 * @param {string} nombreProducto - Nombre del producto para logging
 * @returns {Object} - Objeto con esValido y motivo
 */
function validarCodigoFabricante(codigo, nombreProducto) {
  if (!codigo || codigo.length <= CONFIG.CODIGO_MINIMO_LONGITUD) {
    return {
      esValido: false,
      motivo: `Código de fabricante muy corto (${codigo})`,
    };
  }

  return { esValido: true, motivo: null };
}

/**
 * Valida si un precio es válido según las reglas de negocio específicas
 * @param {number} precioFinal - Precio final calculado en pesos
 * @param {string} categoriaProducto - Categoría del producto
 * @param {boolean} esAlmacenamiento - Si el producto es de almacenamiento
 * @returns {Object} - Objeto con esValido y motivo
 */
function validarPrecioProducto(
  precioFinal,
  categoriaProducto,
  esAlmacenamiento
) {
  // Validación general: precio debe ser mayor a 0
  if (precioFinal <= 0) {
    return { esValido: false, motivo: "Precio inválido o cero" };
  }

  // Validación: precio mínimo general
  if (precioFinal < CONFIG.PRECIO_MINIMO_GENERAL) {
    return {
      esValido: false,
      motivo: `Precio menor al mínimo general permitido ($${CONFIG.PRECIO_MINIMO_GENERAL})`,
    };
  }

  // Validación específica: procesadores deben tener precio mínimo mayor
  if (
    categoriaProducto === "procesadores" &&
    precioFinal < CONFIG.PRECIO_MINIMO_PROCESADOR
  ) {
    return {
      esValido: false,
      motivo: `Procesador con precio menor al mínimo permitido ($${CONFIG.PRECIO_MINIMO_PROCESADOR})`,
    };
  }

  // Validación específica: productos que NO son almacenamiento tienen precio mínimo mayor
  if (
    !esAlmacenamiento &&
    precioFinal < CONFIG.PRECIO_MINIMO_NO_ALMACENAMIENTO
  ) {
    return {
      esValido: false,
      motivo: `Producto no-almacenamiento con precio menor al mínimo ($${CONFIG.PRECIO_MINIMO_NO_ALMACENAMIENTO})`,
    };
  }

  return { esValido: true, motivo: null };
}

/**
 * Valida el nombre del producto
 * @param {string} nombre - Nombre a validar
 * @returns {Object} - Objeto con esValido y motivo
 */
function validarNombreProducto(nombre) {
  if (!nombre || nombre.trim() === "") {
    return { esValido: false, motivo: "Producto sin nombre" };
  }

  return { esValido: true, motivo: null };
}

// ============================================================================
// PROCESAMIENTO DE DATOS DEL CSV
// ============================================================================

/**
 * Extrae y normaliza los datos básicos de una fila del CSV
 * @param {Object} fila - Fila del CSV parseado
 * @returns {Object} - Datos extraídos y normalizados
 */
function extraerDatosBasicosFilaCSV(fila) {
  const nombre = (fila["Descripcion"] || "").trim();

  // Determinar código de fabricante con prioridad
  let codigoFabricante = (fila["Part Number"] || fila['"Part Number"'] || "")
    .trim()
    .toUpperCase();

  if (!codigoFabricante) {
    codigoFabricante = (fila["Codigo"] || "SIN-CODIGO").trim();
  }

  const codigoRubro = (fila["Rubro"] || "").trim();
  const detalle = (fila["Tipo"] || "").trim() || "N/A";

  // Calcular stock total de todos los depósitos
  const stockPorDeposito = DEPOSITOS_DISPONIBLES.map(
    (deposito) => parseInt(fila[deposito]) || 0
  );
  const stockTotal = stockPorDeposito.reduce(
    (total, stock) => total + stock,
    0
  );

  // Determinar depósito principal (el primero que tenga stock)
  let depositoPrincipal = VALORES_POR_DEFECTO.deposito;
  for (const deposito of DEPOSITOS_DISPONIBLES) {
    if (parseInt(fila[deposito]) > 0) {
      depositoPrincipal = deposito;
      break;
    }
  }

  // Precios y datos numéricos
  const precioDolaresSinIVA = convertirANumero(fila["lista5"]);
  const porcentajeIVA = convertirANumero(fila["IVA"]);

  return {
    nombre,
    codigoFabricante,
    codigoRubro,
    detalle,
    stockTotal,
    depositoPrincipal,
    precioDolaresSinIVA,
    porcentajeIVA,
    stockPorDeposito,
  };
}

/**
 * Mapea el código de rubro a una categoría legible
 * @param {string} codigoRubro - Código de rubro
 * @returns {string} - Categoría mapeada o categoría por defecto
 */
function mapearCategoria(codigoRubro) {
  const categoria = categorias_final_air[codigoRubro];

  if (!categoria || categoria.trim() === "") {
    console.warn(
      `⚠️ Categoría no encontrada para código de rubro: ${codigoRubro}`
    );
    return VALORES_POR_DEFECTO.categoria;
  }

  return categoria;
}

/**
 * Calcula todos los precios del producto en diferentes monedas
 * @param {number} precioDolaresSinIVA - Precio base en dólares sin IVA
 * @param {number} porcentajeIVA - Porcentaje de IVA
 * @param {number} cotizacionDolar - Cotización del dólar
 * @param {boolean} esProcesador - Si el producto es un procesador
 * @returns {Object} - Objeto con todos los precios calculados
 */
function calcularPreciosCompletos(
  precioDolaresSinIVA,
  porcentajeIVA,
  cotizacionDolar,
  esProcesador
) {
  const factorIVA = porcentajeIVA / 100 + 1;
  const margenAplicar = esProcesador
    ? CONFIG.MARGEN_PROCESADOR
    : CONFIG.MARGEN_GENERAL;

  const precios = {
    dolaresConIVA: Number((precioDolaresSinIVA * factorIVA).toFixed(2)),
    pesosSinIVA: Number((precioDolaresSinIVA * cotizacionDolar).toFixed(2)),
    pesosConIVA: Number(
      (precioDolaresSinIVA * cotizacionDolar * factorIVA).toFixed(2)
    ),
  };

  // Precio final con margen aplicado
  precios.precioFinalConMargen = Number(
    (precios.pesosConIVA * margenAplicar).toFixed(2)
  );

  return precios;
}

/**
 * Procesa una fila completa del CSV
 * @param {Object} fila - Fila del CSV
 * @param {number} cotizacionDolar - Cotización actual del dólar
 * @returns {Object} - Resultado del procesamiento
 */
async function procesarFilaCSV(fila, cotizacionDolar) {
  try {
    // 1. Extraer datos básicos
    const datosBasicos = extraerDatosBasicosFilaCSV(fila);

    // 2. Validaciones tempranas
    const validacionNombre = validarNombreProducto(datosBasicos.nombre);
    if (!validacionNombre.esValido) {
      return {
        tipo: "omitida",
        datos: {
          nombre: "SIN NOMBRE",
          codigo: datosBasicos.codigoFabricante,
          categoria: "N/A",
        },
        motivo: validacionNombre.motivo,
      };
    }

    const validacionCodigo = validarCodigoFabricante(
      datosBasicos.codigoFabricante,
      datosBasicos.nombre
    );
    if (!validacionCodigo.esValido) {
      return {
        tipo: "omitida",
        datos: {
          nombre: datosBasicos.nombre,
          codigo: datosBasicos.codigoFabricante,
          categoria: mapearCategoria(datosBasicos.codigoRubro),
        },
        motivo: validacionCodigo.motivo,
      };
    }

    // 3. Validar rubro permitido (validación crítica)
    const validacionRubro = validarRubroPermitido(datosBasicos.codigoRubro);
    if (!validacionRubro.esValido) {
      return {
        tipo: "omitida",
        datos: {
          nombre: datosBasicos.nombre,
          codigo: datosBasicos.codigoFabricante,
          categoria: mapearCategoria(datosBasicos.codigoRubro),
        },
        motivo: `${validacionRubro.motivo} (rubro: ${datosBasicos.codigoRubro})`,
      };
    }

    // 4. Validar precio base
    if (datosBasicos.precioDolaresSinIVA <= 0) {
      return {
        tipo: "omitida",
        datos: {
          nombre: datosBasicos.nombre,
          codigo: datosBasicos.codigoFabricante,
          categoria: mapearCategoria(datosBasicos.codigoRubro),
        },
        motivo: `Precio base inválido: $${datosBasicos.precioDolaresSinIVA} USD`,
      };
    }

    // 5. Determinar características del producto
    const esProcesador = perteneceACategoria(
      datosBasicos.codigoRubro,
      "procesadores"
    );
    const esAlmacenamiento = perteneceACategoria(
      datosBasicos.codigoRubro,
      "almacenamiento"
    );

    // 6. Calcular precios
    const precios = calcularPreciosCompletos(
      datosBasicos.precioDolaresSinIVA,
      datosBasicos.porcentajeIVA,
      cotizacionDolar,
      esProcesador
    );

    // 7. Validar precio final
    const validacionPrecio = validarPrecioProducto(
      precios.precioFinalConMargen,
      validacionRubro.categoriaDetectada,
      esAlmacenamiento
    );

    if (!validacionPrecio.esValido) {
      return {
        tipo: "omitida",
        datos: {
          nombre: datosBasicos.nombre,
          codigo: datosBasicos.codigoFabricante,
          categoria: mapearCategoria(datosBasicos.codigoRubro),
        },
        motivo: `${validacionPrecio.motivo} (precio calculado: $${precios.precioFinalConMargen})`,
      };
    }

    // 8. Preparar datos para la base de datos
    const categoria = mapearCategoria(datosBasicos.codigoRubro);
    const datosParaBD = prepararDatosParaBaseDatos(
      datosBasicos,
      precios,
      categoria
    );

    // 9. Insertar en base de datos
    const resultadoBD = await insertarProductoEnBaseDatos(datosParaBD);

    // 10. Log de éxito
    console.log("✅ Producto procesado correctamente:", {
      producto: datosBasicos.nombre,
      categoria: categoria,
      codigo: datosBasicos.codigoFabricante,
      precio_final: `$${precios.precioFinalConMargen}`,
      es_procesador: esProcesador,
      es_almacenamiento: esAlmacenamiento,
    });

    return {
      tipo: "exitosa",
      datos: {
        nombre: datosBasicos.nombre,
        codigo: datosBasicos.codigoFabricante,
        categoria: categoria,
        categoriaRubro: datosBasicos.codigoRubro,
        stock: datosBasicos.stockTotal,
        precioDolares: datosBasicos.precioDolaresSinIVA,
        precioFinal: precios.precioFinalConMargen,
        esProcesador,
        esAlmacenamiento,
      },
      resultadoBD,
    };
  } catch (error) {
    console.error("❌ Error procesando fila:", error.message);
    return {
      tipo: "error",
      datos: {
        descripcion: fila["Descripcion"] || "N/A",
        codigo: fila["Part Number"] || fila["Codigo"] || "N/A",
        rubro: fila["Rubro"] || "N/A",
      },
      error: error.message,
    };
  }
}

/**
 * Prepara los parámetros para el stored procedure de la base de datos
 * @param {Object} datosBasicos - Datos básicos del producto
 * @param {Object} precios - Precios calculados
 * @param {string} categoria - Categoría mapeada
 * @returns {Array} - Array de parámetros para el SP
 */
function prepararDatosParaBaseDatos(datosBasicos, precios, categoria) {
  return [
    datosBasicos.nombre,
    datosBasicos.stockTotal,
    CONFIG.GARANTIA_MESES_DEFECTO,
    datosBasicos.detalle,
    VALORES_POR_DEFECTO.dimensiones.largo,
    VALORES_POR_DEFECTO.dimensiones.alto,
    VALORES_POR_DEFECTO.dimensiones.ancho,
    VALORES_POR_DEFECTO.dimensiones.peso,
    datosBasicos.codigoFabricante,
    VALORES_POR_DEFECTO.marca,
    String(categoria),
    VALORES_POR_DEFECTO.subcategoria,
    VALORES_POR_DEFECTO.proveedor,
    datosBasicos.precioDolaresSinIVA,
    precios.dolaresConIVA,
    datosBasicos.porcentajeIVA,
    precios.pesosSinIVA,
    precios.precioFinalConMargen,
    CONFIG.IMAGEN_POR_DEFECTO,
    datosBasicos.depositoPrincipal,
  ];
}

/**
 * Inserta el producto en la base de datos usando stored procedure
 * @param {Array} parametros - Parámetros para el SP
 * @returns {Object} - Resultado de la inserción
 */
async function insertarProductoEnBaseDatos(parametros) {
  try {
    const [resultado] = await db.query(
      "CALL cargarDatosProducto(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      parametros
    );

    return resultado[0];
  } catch (error) {
    throw new Error(`Error en stored procedure: ${error.message}`);
  }
}

// ============================================================================
// ENDPOINT PRINCIPAL
// ============================================================================

routerCargaProducto.post(
  "/cargar-productos",
  upload.single("archivo_csv"),
  async (req, res) => {
    const rutaArchivo = req.file?.path;

    if (!rutaArchivo) {
      return res.status(400).json({
        error: "No se envió ningún archivo CSV válido.",
      });
    }

    console.log("📁 Iniciando procesamiento de archivo CSV:", rutaArchivo);

    try {
      // 1. Configuración inicial y obtener cotización del dólar
      const cotizacionDolar = await obtenerCotizacionDolarYConfigurar();

      // 2. Leer y parsear archivo CSV
      const contenidoArchivo = fs.readFileSync(rutaArchivo, "utf8");
      const primeraLinea = contenidoArchivo.split("\n")[0];
      const separador = detectarSeparadorCSV(primeraLinea);

      console.log("📑 Separador CSV detectado:", JSON.stringify(separador));

      const { data: filasCSV } = Papa.parse(contenidoArchivo, {
        header: true,
        delimiter: separador,
        skipEmptyLines: true,
      });

      console.log(`📦 Total de filas leídas del CSV: ${filasCSV.length}`);

      // 3. Procesar cada fila
      const resultados = {
        exitosas: [],
        omitidas: [],
        errores: [],
      };

      for (const fila of filasCSV) {
        const resultado = await procesarFilaCSV(fila, cotizacionDolar);

        // Clasificar resultado según el tipo
        switch (resultado.tipo) {
          case "exitosa":
            resultados.exitosas.push(resultado);
            break;
          case "omitida":
            resultados.omitidas.push(resultado);
            break;
          case "error":
            resultados.errores.push(resultado);
            break;
        }
      }

      // 4. Calcular estadísticas finales
      const estadisticas = calcularEstadisticasFinalesCSV(
        resultados,
        filasCSV.length
      );

      // 5. Mostrar resumen en consola
      imprimirResumenProcesamientoCSV(estadisticas);

      // 6. Respuesta exitosa
      res.json({
        mensaje: "Procesamiento CSV completado",
        estadisticas,
        detalles: {
          exitosas: resultados.exitosas.map((r) => r.datos),
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
        error: "Error interno del servidor",
        detalle: error.message,
      });
    } finally {
      // Limpieza del archivo temporal
      await limpiarArchivoTemporal(rutaArchivo);
    }
  }
);

// ============================================================================
// FUNCIONES AUXILIARES PARA ESTADÍSTICAS Y LIMPIEZA
// ============================================================================

/**
 * Calcula las estadísticas finales del procesamiento CSV
 * @param {Object} resultados - Resultados clasificados
 * @param {number} totalFilas - Total de filas en el CSV
 * @returns {Object} - Estadísticas completas
 */
function calcularEstadisticasFinalesCSV(resultados, totalFilas) {
  const procesadas = resultados.exitosas.length;
  const omitidas = resultados.omitidas.length;
  const errores = resultados.errores.length;
  const totalProcesadas = procesadas + omitidas + errores;

  return {
    totalFilasCSV: totalFilas,
    procesadasExitosamente: procesadas,
    omitidas: omitidas,
    errores: errores,
    totalProcesadas: totalProcesadas,
    detallesAdicionales: {
      procesadores: resultados.exitosas.filter((r) => r.datos.esProcesador)
        .length,
      almacenamiento: resultados.exitosas.filter(
        (r) => r.datos.esAlmacenamiento
      ).length,
      categoriasUnicas: [
        ...new Set(resultados.exitosas.map((r) => r.datos.categoria)),
      ],
      rubrosUnicos: [
        ...new Set(resultados.exitosas.map((r) => r.datos.categoriaRubro)),
      ],
    },
  };
}

/**
 * Imprime un resumen detallado del procesamiento CSV en consola
 * @param {Object} estadisticas - Estadísticas del procesamiento
 */
function imprimirResumenProcesamientoCSV(estadisticas) {
  console.log(`
📊 ============== RESUMEN DEL PROCESAMIENTO CSV ==============
📋 Total de filas en CSV: ${estadisticas.totalFilasCSV}
✅ Procesadas exitosamente: ${estadisticas.procesadasExitosamente}
⚠️  Omitidas por validación: ${estadisticas.omitidas}
❌ Con errores: ${estadisticas.errores}
📈 Total procesadas: ${estadisticas.totalProcesadas}

🔧 Productos por tipo:
   - Procesadores: ${estadisticas.detallesAdicionales.procesadores}
   - Almacenamiento: ${estadisticas.detallesAdicionales.almacenamiento}
   - Otros: ${
     estadisticas.procesadasExitosamente -
     estadisticas.detallesAdicionales.procesadores -
     estadisticas.detallesAdicionales.almacenamiento
   }

📦 Categorías procesadas: ${
    estadisticas.detallesAdicionales.categoriasUnicas.length
  }
🏷️  Rubros únicos procesados: ${
    estadisticas.detallesAdicionales.rubrosUnicos.length
  }

📋 Rubros permitidos actualmente:
   ${RUBROS_PERMITIDOS.join(", ")}
============================================================
  `);
}

/**
 * Elimina el archivo temporal CSV
 * @param {string} rutaArchivo - Ruta del archivo a eliminar
 */
async function limpiarArchivoTemporal(rutaArchivo) {
  if (rutaArchivo && fs.existsSync(rutaArchivo)) {
    try {
      fs.unlinkSync(rutaArchivo);
      console.log("🗑️ Archivo CSV temporal eliminado:", rutaArchivo);
    } catch (error) {
      console.error(
        "⚠️ No se pudo eliminar el archivo CSV temporal:",
        error.message
      );
    }
  }
}

export default routerCargaProducto;
