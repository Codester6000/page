import express from "express";
import { db } from "./database/connectionMySQL.js";
import { obtenerImgProducto, validarImagen } from "./recursos/imgs.js";

// ============================================================================
// CONFIGURACIÓN DEL ROUTER
// ============================================================================

const routerImagenes = express.Router();

// ============================================================================
// CONSTANTES Y CONFIGURACIONES
// ============================================================================

const CONFIG = {
  MINIMO_IMAGENES_SIN_LIMPIEZA: 5, // Mínimo de imágenes para evitar limpieza
  PAUSA_CADA_N_PRODUCTOS: 5, // Pausa cada N productos procesados
  TIEMPO_PAUSA_MS: 1000, // Tiempo de pausa en milisegundos
  TIMEOUT_VALIDACION_MS: 10000, // Timeout para validación de imágenes
};

const ESTADOS_PROCESAMIENTO = {
  EXITOSO: "SUCCESS",
  SIN_IMAGEN: "SIN_IMAGEN",
  IMAGEN_INVALIDA: "IMAGEN_INVALIDA",
  ERROR_BD: "ERROR_BD",
  ERROR_GENERAL: "ERROR_GENERAL",
};

// ============================================================================
// FUNCIONES DE CONSULTAS A BASE DE DATOS
// ============================================================================

/**
 * Obtiene información completa del estado actual de las imágenes
 * @returns {Promise<Object>} - Información del estado de las imágenes
 */
async function obtenerEstadoImagenes() {
  try {
    const [resultado] = await db.query("CALL obtener_info_imagenes()");

    if (!resultado || !resultado[0] || resultado[0].length === 0) {
      throw new Error("No se pudo obtener información del estado de imágenes");
    }

    const infoImagenes = resultado[0][0];

    return {
      totalImagenes: infoImagenes.total_imagenes || 0,
      totalRelaciones: infoImagenes.total_relaciones || 0,
      urlsUnicas: infoImagenes.urls_unicas || 0,
    };
  } catch (error) {
    throw new Error(`Error al obtener estado de imágenes: ${error.message}`);
  }
}

/**
 * Ejecuta la limpieza completa de imágenes
 * @returns {Promise<Object>} - Resultado de la limpieza
 */
async function ejecutarLimpiezaCompleta() {
  try {
    const [resultado] = await db.query("CALL limpiar_imagenes_completo()");
    console.log("✅ Limpieza de imágenes completada:", resultado[0]);
    return resultado[0];
  } catch (error) {
    throw new Error(`Error durante la limpieza de imágenes: ${error.message}`);
  }
}

/**
 * Obtiene todos los productos disponibles en la base de datos
 * @returns {Promise<Array>} - Lista de productos con id y nombre
 */
async function obtenerTodosLosProductos() {
  try {
    const [productos] = await db.query(
      "SELECT id_producto, nombre FROM productos ORDER BY id_producto"
    );

    return productos;
  } catch (error) {
    throw new Error(`Error al obtener productos: ${error.message}`);
  }
}

/**
 * Obtiene productos que ya tienen imágenes asignadas
 * @returns {Promise<Array>} - Lista de productos con imágenes
 */
async function obtenerProductosConImagenes() {
  try {
    const [productosConImagen] = await db.query(`
      SELECT DISTINCT p.id_producto, p.nombre
      FROM productos p
      INNER JOIN productos_imagenes pi ON p.id_producto = pi.id_producto
      INNER JOIN imagenes i ON pi.id_imagen = i.id_imagen
      WHERE i.url_imagen IS NOT NULL AND i.url_imagen != ''
      ORDER BY p.id_producto
    `);

    return productosConImagen;
  } catch (error) {
    throw new Error(
      `Error al obtener productos con imágenes: ${error.message}`
    );
  }
}

/**
 * Guarda una nueva imagen en la base de datos y la asocia a un producto
 * @param {string} urlImagen - URL de la imagen
 * @param {number} idProducto - ID del producto
 * @returns {Promise<Object>} - Resultado de la inserción
 */
async function guardarImagenEnBaseDatos(urlImagen, idProducto) {
  try {
    const [resultado] = await db.query("CALL cargar_imagen_nueva(?, ?)", [
      urlImagen,
      idProducto,
    ]);

    return {
      estado: resultado[0]?.estado || ESTADOS_PROCESAMIENTO.EXITOSO,
      mensaje: resultado[0]?.mensaje || "Imagen cargada exitosamente",
      idImagen: resultado[0]?.id_imagen,
    };
  } catch (error) {
    throw new Error(`Error en stored procedure: ${error.message}`);
  }
}

// ============================================================================
// FUNCIONES DE VALIDACIÓN Y PROCESAMIENTO
// ============================================================================

/**
 * Determina si es necesario ejecutar una limpieza de imágenes
 * @param {number} totalImagenes - Cantidad total de imágenes actuales
 * @returns {boolean} - true si necesita limpieza
 */
function necesitaLimpieza(totalImagenes) {
  return totalImagenes < CONFIG.MINIMO_IMAGENES_SIN_LIMPIEZA;
}

/**
 * Filtra los productos que NO tienen imagen asignada
 * @param {Array} todosLosProductos - Lista completa de productos
 * @param {Array} productosConImagen - Productos que ya tienen imagen
 * @returns {Object} - Objeto con productos filtrados y estadísticas
 */
function filtrarProductosSinImagen(todosLosProductos, productosConImagen) {
  const idsConImagen = productosConImagen.map(
    (producto) => producto.id_producto
  );
  const productosSinImagen = todosLosProductos.filter(
    (producto) => !idsConImagen.includes(producto.id_producto)
  );

  return {
    productosSinImagen,
    idsConImagen,
    estadisticas: {
      total: todosLosProductos.length,
      conImagen: productosConImagen.length,
      sinImagen: productosSinImagen.length,
    },
  };
}

/**
 * Procesa un producto individual para buscar y asignar imagen
 * @param {Object} producto - Datos del producto
 * @param {number} indice - Índice actual en el procesamiento
 * @param {number} total - Total de productos a procesar
 * @returns {Promise<Object>} - Resultado del procesamiento
 */
async function procesarProductoIndividual(producto, indice, total) {
  const numeroActual = indice + 1;
  console.log(
    `\n📋 Procesando ${numeroActual}/${total}: "${producto.nombre}" (ID: ${producto.id_producto})`
  );

  try {
    // 1. Buscar imagen del producto
    console.log("  🔍 Buscando imagen...");
    const urlImagen = await obtenerImgProducto(producto.nombre);

    if (!urlImagen) {
      console.log("  ❌ No se encontró imagen");
      return crearResultadoProcesamiento(
        producto,
        null,
        ESTADOS_PROCESAMIENTO.SIN_IMAGEN,
        "No se encontró imagen para este producto"
      );
    }

    console.log(`  🖼️  Imagen encontrada: ${urlImagen.substring(0, 80)}...`);

    // 2. Validar la imagen encontrada
    console.log("  ✅ Validando imagen...");
    const esImagenValida = await validarImagen(urlImagen);

    if (!esImagenValida) {
      console.log("  ❌ Imagen no válida");
      return crearResultadoProcesamiento(
        producto,
        urlImagen,
        ESTADOS_PROCESAMIENTO.IMAGEN_INVALIDA,
        "La URL de imagen no es válida"
      );
    }

    console.log("  ✅ Imagen válida");

    // 3. Guardar en base de datos
    console.log("  💾 Guardando en base de datos...");

    try {
      const resultadoBD = await guardarImagenEnBaseDatos(
        urlImagen,
        producto.id_producto
      );

      console.log(`  ✅ Guardado exitoso - ID imagen: ${resultadoBD.idImagen}`);

      return crearResultadoProcesamiento(
        producto,
        urlImagen,
        resultadoBD.estado,
        resultadoBD.mensaje,
        { idImagen: resultadoBD.idImagen }
      );
    } catch (errorBD) {
      console.error(`  ❌ Error en base de datos:`, errorBD.message);

      return crearResultadoProcesamiento(
        producto,
        urlImagen,
        ESTADOS_PROCESAMIENTO.ERROR_BD,
        `Error en base de datos: ${errorBD.message}`,
        { errorDetalle: errorBD.message }
      );
    }
  } catch (error) {
    console.error(`  ❌ Error general procesando producto:`, error.message);

    return crearResultadoProcesamiento(
      producto,
      null,
      ESTADOS_PROCESAMIENTO.ERROR_GENERAL,
      `Error general: ${error.message}`,
      { errorDetalle: error.message }
    );
  }
}

/**
 * Crea un objeto resultado estandarizado para el procesamiento de productos
 * @param {Object} producto - Datos del producto
 * @param {string|null} url - URL de la imagen (puede ser null)
 * @param {string} estado - Estado del procesamiento
 * @param {string} mensaje - Mensaje descriptivo
 * @param {Object} datosAdicionales - Datos adicionales opcionales
 * @returns {Object} - Objeto resultado estandarizado
 */
function crearResultadoProcesamiento(
  producto,
  url,
  estado,
  mensaje,
  datosAdicionales = {}
) {
  return {
    producto: producto.nombre,
    idProducto: producto.id_producto,
    url: url,
    estado: estado,
    mensaje: mensaje,
    ...datosAdicionales,
  };
}

/**
 * Aplica una pausa en el procesamiento si es necesario
 * @param {number} numeroProducto - Número del producto actual
 */
async function aplicarPausaSiEsNecesario(numeroProducto) {
  if (numeroProducto % CONFIG.PAUSA_CADA_N_PRODUCTOS === 0) {
    console.log(
      `  ⏸️  Pausa de ${CONFIG.TIEMPO_PAUSA_MS / 1000} segundo(s)...`
    );
    await new Promise((resolve) => setTimeout(resolve, CONFIG.TIEMPO_PAUSA_MS));
  }
}

// ============================================================================
// FUNCIONES DE ESTADÍSTICAS Y REPORTING
// ============================================================================

/**
 * Calcula las estadísticas finales del procesamiento
 * @param {Array} resultados - Array con todos los resultados del procesamiento
 * @returns {Object} - Objeto con estadísticas calculadas
 */
function calcularEstadisticasFinales(resultados) {
  return {
    exitosos: resultados.filter(
      (r) => r.estado === ESTADOS_PROCESAMIENTO.EXITOSO
    ).length,
    sinImagen: resultados.filter(
      (r) => r.estado === ESTADOS_PROCESAMIENTO.SIN_IMAGEN
    ).length,
    imagenesInvalidas: resultados.filter(
      (r) => r.estado === ESTADOS_PROCESAMIENTO.IMAGEN_INVALIDA
    ).length,
    errores: resultados.filter((r) => r.estado.includes("ERROR")).length,
  };
}

/**
 * Imprime un resumen completo del procesamiento en consola
 * @param {Object} estadisticas - Estadísticas del procesamiento
 * @param {Object} informacionGeneral - Información general del proceso
 */
function imprimirResumenFinal(estadisticas, informacionGeneral) {
  const {
    totalProductos,
    productosConImagenInicial,
    productosProcesados,
    seEjecutoLimpieza,
  } = informacionGeneral;

  console.log(`
📊 =================== RESUMEN FINAL DE IMÁGENES ===================
📦 Total productos en sistema: ${totalProductos}
📸 Ya tenían imagen asignada: ${productosConImagenInicial}
🔄 Productos procesados: ${productosProcesados}
✅ Imágenes asignadas exitosamente: ${estadisticas.exitosos}
❌ Sin imagen encontrada: ${estadisticas.sinImagen}
❌ Imágenes inválidas: ${estadisticas.imagenesInvalidas}
❌ Errores durante el proceso: ${estadisticas.errores}
🧹 Se ejecutó limpieza previa: ${seEjecutoLimpieza ? "SÍ" : "NO"}
===================================================================
  `);
}

// ============================================================================
// ENDPOINT PRINCIPAL - CARGAR IMÁGENES
// ============================================================================

routerImagenes.post("/imagenes", async (req, res) => {
  try {
    console.log("🚀 Iniciando proceso de carga de imágenes...");

    // 1. VERIFICAR Y OBTENER ESTADO INICIAL
    console.log("🔍 Verificando estado inicial de imágenes...");
    const estadoInicial = await obtenerEstadoImagenes();

    console.log("📊 Estado inicial de imágenes:", estadoInicial);
    console.log(
      `📈 Resumen inicial: ${estadoInicial.totalImagenes} imágenes, ` +
        `${estadoInicial.totalRelaciones} relaciones, ${estadoInicial.urlsUnicas} URLs únicas`
    );

    // 2. DETERMINAR SI NECESITA LIMPIEZA Y EJECUTARLA
    const requiereLimpieza = necesitaLimpieza(estadoInicial.totalImagenes);

    if (requiereLimpieza) {
      console.log(
        `🧹 Total de imágenes (${estadoInicial.totalImagenes}) es menor a ` +
          `${CONFIG.MINIMO_IMAGENES_SIN_LIMPIEZA}. Ejecutando limpieza...`
      );

      await ejecutarLimpiezaCompleta();
    } else {
      console.log(
        `✅ Total de imágenes (${estadoInicial.totalImagenes}) es suficiente. ` +
          `Saltando limpieza...`
      );
    }

    // 3. OBTENER TODOS LOS PRODUCTOS
    const todosLosProductos = await obtenerTodosLosProductos();

    if (todosLosProductos.length === 0) {
      return res.json({
        success: false,
        mensaje: "No hay productos cargados en el sistema.",
      });
    }

    console.log(
      `📦 Encontrados ${todosLosProductos.length} productos en total`
    );

    // 4. IDENTIFICAR PRODUCTOS QUE YA TIENEN IMÁGENES
    console.log(
      "🔍 Identificando productos que ya tienen imágenes asignadas..."
    );
    const productosConImagen = await obtenerProductosConImagenes();

    console.log(
      `📸 ${productosConImagen.length} productos ya tienen imagen asignada`
    );

    // 5. FILTRAR PRODUCTOS SIN IMAGEN
    const filtrado = filtrarProductosSinImagen(
      todosLosProductos,
      productosConImagen
    );
    const { productosSinImagen, idsConImagen, estadisticas } = filtrado;

    console.log(`📋 ${estadisticas.sinImagen} productos necesitan imagen`);
    console.log(
      `🔄 Productos que serán saltados (ya tienen imagen): ${idsConImagen.join(
        ", "
      )}`
    );

    // 6. VALIDAR SI HAY PRODUCTOS PARA PROCESAR
    if (estadisticas.sinImagen === 0) {
      return res.json({
        success: true,
        mensaje: "Todos los productos ya tienen imagen asignada",
        estadisticas: {
          totalProductos: estadisticas.total,
          productosConImagen: estadisticas.conImagen,
          productosSinImagen: 0,
          seEjecutoLimpieza: requiereLimpieza,
        },
        timestamp: new Date().toISOString(),
      });
    }

    // 7. PROCESAR PRODUCTOS SIN IMAGEN
    console.log(
      `\n🔄 Iniciando procesamiento de ${estadisticas.sinImagen} productos...`
    );
    const resultadosProcesamiento = [];

    for (let i = 0; i < productosSinImagen.length; i++) {
      const producto = productosSinImagen[i];

      // Procesar producto individual
      const resultado = await procesarProductoIndividual(
        producto,
        i,
        estadisticas.sinImagen
      );
      resultadosProcesamiento.push(resultado);

      // Aplicar pausa si es necesario
      await aplicarPausaSiEsNecesario(i + 1);
    }

    // 8. VERIFICAR ESTADO FINAL (OPCIONAL)
    console.log("\n🔍 Verificando estado final de la base de datos...");
    try {
      const estadoFinal = await obtenerEstadoImagenes();
      console.log("📊 Estado final:", estadoFinal);
    } catch (errorDebug) {
      console.log("⚠️  No se pudo verificar estado final:", errorDebug.message);
    }

    // 9. CALCULAR ESTADÍSTICAS FINALES
    const estadisticasFinales = calcularEstadisticasFinales(
      resultadosProcesamiento
    );

    // 10. MOSTRAR RESUMEN EN CONSOLA
    imprimirResumenFinal(estadisticasFinales, {
      totalProductos: estadisticas.total,
      productosConImagenInicial: estadisticas.conImagen,
      productosProcesados: estadisticas.sinImagen,
      seEjecutoLimpieza: requiereLimpieza,
    });

    // 11. RESPUESTA EXITOSA
    return res.json({
      success: true,
      mensaje: "Procesamiento de imágenes completado",
      estadisticas: {
        totalProductos: estadisticas.total,
        productosYaConImagen: estadisticas.conImagen,
        productosProcesados: estadisticas.sinImagen,
        seEjecutoLimpieza: requiereLimpieza,
        resultados: estadisticasFinales,
      },
      estadoInicial: {
        totalImagenes: estadoInicial.totalImagenes,
        totalRelaciones: estadoInicial.totalRelaciones,
        urlsUnicas: estadoInicial.urlsUnicas,
      },
      productosSaltados: idsConImagen,
      detalleResultados: resultadosProcesamiento,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("💥 Error general en endpoint /imagenes:", error);

    return res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      mensaje: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// ============================================================================
// ENDPOINT DE DEBUG - INFORMACIÓN DE ESTADO
// ============================================================================

routerImagenes.get("/imagenes/debug", async (req, res) => {
  try {
    console.log("🔍 Ejecutando endpoint de debug para imágenes...");

    const estadoActual = await obtenerEstadoImagenes();

    // Información adicional para debug
    const [productosTotal] = await db.query(
      "SELECT COUNT(*) as total FROM productos"
    );
    const [imagenesTotal] = await db.query(
      "SELECT COUNT(*) as total FROM imagenes"
    );
    const [relacionesTotal] = await db.query(
      "SELECT COUNT(*) as total FROM productos_imagenes"
    );

    return res.json({
      success: true,
      mensaje: "Información de debug obtenida correctamente",
      estadoImagenes: estadoActual,
      informacionAdicional: {
        totalProductosEnSistema: productosTotal[0]?.total || 0,
        totalImagenesEnBD: imagenesTotal[0]?.total || 0,
        totalRelacionesEnBD: relacionesTotal[0]?.total || 0,
        requiereLimpieza: necesitaLimpieza(estadoActual.totalImagenes),
      },
      configuracion: {
        minimoImagenesSinLimpieza: CONFIG.MINIMO_IMAGENES_SIN_LIMPIEZA,
        pausaCadaNProductos: CONFIG.PAUSA_CADA_N_PRODUCTOS,
        tiempoPausaMs: CONFIG.TIEMPO_PAUSA_MS,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error en endpoint de debug:", error.message);

    return res.status(500).json({
      success: false,
      error: "Error al obtener información de debug",
      mensaje: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// ============================================================================
// ENDPOINT - OBTENER TODOS LOS PRODUCTOS SIN IMAGEN
// ============================================================================

routerImagenes.get("/productos-sin-imagen", async (req, res) => {
  try {
    console.log("🔍 Obteniendo TODOS los productos sin imagen asignada...");

    // 1. OBTENER TODOS LOS PRODUCTOS DEL SISTEMA
    const todosLosProductos = await obtenerTodosLosProductos();

    if (todosLosProductos.length === 0) {
      return res.json({
        success: true,
        mensaje: "No hay productos cargados en el sistema.",
        datos: {
          totalProductos: 0,
          productosSinImagen: [],
          cantidadSinImagen: 0,
        },
        timestamp: new Date().toISOString(),
      });
    }

    // 2. OBTENER PRODUCTOS QUE YA TIENEN IMAGEN ASIGNADA
    const productosConImagen = await obtenerProductosConImagenes();

    // 3. FILTRAR Y OBTENER SOLO LOS QUE NO TIENEN IMAGEN
    const filtrado = filtrarProductosSinImagen(
      todosLosProductos,
      productosConImagen
    );

    const { productosSinImagen, estadisticas } = filtrado;

    console.log(`RESUMEN:`);
    console.log(`Total productos en sistema: ${estadisticas.total}`);
    console.log(`Ya tienen imagen: ${estadisticas.conImagen}`);
    console.log(`SIN IMAGEN (faltan): ${estadisticas.sinImagen}`);

    // 4. FORMATEAR LA LISTA DE PRODUCTOS SIN IMAGEN
    const listaProductosSinImagen = productosSinImagen.map(
      (producto, index) => ({
        numero: index + 1,
        id_producto: producto.id_producto,
        nombre: producto.nombre,
      })
    );

    /*
    // 5. IMPRIMIR EN CONSOLA LOS PRODUCTOS QUE FALTAN (para debug)
    if (estadisticas.sinImagen > 0) {
      console.log(`\n PRODUCTOS QUE NECESITAN IMAGEN:`);
      listaProductosSinImagen.forEach((producto) => {
        console.log(
          `   ${producto.numero}. ID: ${producto.id_producto} - "${producto.nombre}"`
        );
      });
    }
    */

    return res.json({
      success: true,
      mensaje:
        estadisticas.sinImagen > 0
          ? `Se encontraron ${estadisticas.sinImagen} productos que NO tienen imagen asignada`
          : "✅ Todos los productos ya tienen imagen asignada",
      datos: {
        resumen: {
          totalProductos: estadisticas.total,
          productosSinImagen: estadisticas.sinImagen,
          porcentajeCompletado:
            estadisticas.total > 0
              ? ((estadisticas.conImagen / estadisticas.total) * 100).toFixed(1)
              : "100.0",
        },
        productosSinImagen: listaProductosSinImagen,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error al obtener productos sin imagen:", error.message);

    return res.status(500).json({
      success: false,
      error: "Error al obtener productos sin imagen",
      mensaje: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

routerImagenes.post("/imagen-manualmente", async (req, res) => {
  try {
    const { idProducto, urlImagen } = req.body;

    // Validaciones básicas
    if (!idProducto || !urlImagen) {
      return res.status(400).json({
        success: false,
        error: "Datos incompletos",
        mensaje: "Se requiere idProducto y urlImagen",
        timestamp: new Date().toISOString(),
      });
    }

    // Validar que idProducto sea un número
    const idProductoNum = parseInt(idProducto);
    if (isNaN(idProductoNum)) {
      return res.status(400).json({
        success: false,
        error: "ID de producto inválido",
        mensaje: "El ID del producto debe ser un número válido",
        timestamp: new Date().toISOString(),
      });
    }
    // Validar formato básico de URL
    if (!urlImagen.trim() || !urlImagen.startsWith("http")) {
      return res.status(400).json({
        success: false,
        error: "URL inválida",
        mensaje: "La URL debe comenzar con http:// o https://",
        timestamp: new Date().toISOString(),
      });
    }

    console.log(
      `🔧 Agregando imagen manual para producto ID: ${idProductoNum}`
    );
    console.log(`🖼️  URL: ${urlImagen.substring(0, 80)}...`);

    // Verificar que el producto existe
    const [producto] = await db.query(
      "SELECT id_producto, nombre FROM productos WHERE id_producto = ?",
      [idProductoNum]
    );

    if (!producto || producto.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Producto no encontrado",
        mensaje: `No se encontró un producto con ID: ${idProductoNum}`,
        timestamp: new Date().toISOString(),
      });
    }

    const datosProducto = producto[0];
    console.log(`📦 Producto encontrado: "${datosProducto.nombre}"`);
    console.log("💾 Guardando en base de datos...");
    const resultado = await guardarImagenEnBaseDatos(urlImagen, idProductoNum);

    if (resultado.estado === ESTADOS_PROCESAMIENTO.EXITOSO) {
      console.log(
        `✅ Imagen agregada exitosamente - ID imagen: ${resultado.idImagen}`
      );

      return res.json({
        success: true,
        mensaje: "Imagen agregada exitosamente",
        datos: {
          idProducto: idProductoNum,
          nombreProducto: datosProducto.nombre,
          urlImagen: urlImagen,
          idImagen: resultado.idImagen,
        },
        timestamp: new Date().toISOString(),
      });
    } else {
      // Error desde el stored procedure
      return res.status(400).json({
        success: false,
        error: "Error al guardar imagen",
        mensaje: resultado.mensaje,
        datos: {
          idProducto: idProductoNum,
          nombreProducto: datosProducto.nombre,
          urlImagen: urlImagen,
          estadoProceso: resultado.estado,
        },
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("💥 Error en endpoint agregar imagen manual:", error);

    return res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      mensaje: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default routerImagenes;
