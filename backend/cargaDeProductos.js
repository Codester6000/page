import express from "express";
import multer from "multer";
import fs from "fs";
import Papa from "papaparse";
import axios from "axios";
import { db } from "./database/connectionMySQL.js";
import { categorias_final_air } from "./recursos/categorias.js";

const routerCargaProducto = express.Router();
const upload = multer({ dest: "uploads/" });

const CONFIG = {
  PRECIO_MINIMO_GENERAL: 30000,
  PRECIO_MINIMO_PROCESADOR: 64999,
  PRECIO_MINIMO_NO_ALMACENAMIENTO: 64999,
  GARANTIA_MESES_DEFECTO: 6,
  COTIZACION_DOLAR_DEFECTO: 1,
  IMAGEN_POR_DEFECTO: "https://i.imgur.com/0wbrCkz.png",
  CODIGO_MINIMO_LONGITUD: 2,
  MARGEN_GENERAL: 1.19,
  MARGEN_PROCESADOR: 1.15,
  MARGEN_PLACA_VIDEO: 1.12,
};

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
  placaVideo: ["002-0553", "001-0560"],
  sillas: ["001-0015"],
};

const RUBROS_PERMITIDOS = Object.values(RUBROS_PRODUCTOS).flat();

const VALORES_POR_DEFECTO = {
  categoria: "Sin categoría",
  subcategoria: "Sin subcategoría",
  marca: "a",
  proveedor: "air",
  deposito: "CBA",
  dimensiones: { largo: 0.0, alto: 0.0, ancho: 0.0, peso: 0.0 },
};

const DEPOSITOS_DISPONIBLES = ["CBA", "LUG", "ROS", "MZA"];

function detectarSeparadorCSV(primeraLinea) {
  const contadores = {
    comas: (primeraLinea.match(/,/g) || []).length,
    tabs: (primeraLinea.match(/\t/g) || []).length,
    puntosComa: (primeraLinea.match(/;/g) || []).length,
  };
  if (
    contadores.tabs >= contadores.comas &&
    contadores.tabs >= contadores.puntosComa
  )
    return "\t";
  if (contadores.puntosComa >= contadores.comas) return ";";
  return ",";
}

function convertirANumero(valor) {
  const numero = parseFloat(valor);
  return isNaN(numero) ? 0 : numero;
}

async function obtenerCotizacionDolarYConfigurar() {
  try {
    await db.query("CALL deshabilitar_air()");
    const response = await axios.get("https://dolarapi.com/v1/dolares/oficial");
    return Number(response.data?.venta) || CONFIG.COTIZACION_DOLAR_DEFECTO;
  } catch (error) {
    throw new Error(`Error obteniendo dólar oficial: ${error.message}`);
  }
}

function perteneceACategoria(codigoRubro, categoria) {
  return RUBROS_PRODUCTOS[categoria]?.includes(codigoRubro) || false;
}

function validarRubroPermitido(codigoRubro) {
  if (!codigoRubro || !RUBROS_PERMITIDOS.includes(codigoRubro)) {
    return {
      esValido: false,
      motivo: "Rubro no permitido para procesamiento",
      categoriaDetectada: null,
    };
  }
  let categoriaDetectada = "general";
  for (const [categoria, rubros] of Object.entries(RUBROS_PRODUCTOS)) {
    if (rubros.includes(codigoRubro)) {
      categoriaDetectada = categoria;
      break;
    }
  }
  return { esValido: true, motivo: null, categoriaDetectada };
}

function validarCodigoFabricante(codigo) {
  if (!codigo || codigo.length <= CONFIG.CODIGO_MINIMO_LONGITUD) {
    return {
      esValido: false,
      motivo: `Código de fabricante muy corto (${codigo})`,
    };
  }
  return { esValido: true, motivo: null };
}

function validarPrecioProducto(
  precioFinal,
  categoriaProducto,
  esAlmacenamiento
) {
  if (precioFinal <= 0)
    return { esValido: false, motivo: "Precio inválido o cero" };
  if (precioFinal < CONFIG.PRECIO_MINIMO_GENERAL) {
    return {
      esValido: false,
      motivo: `Precio menor al mínimo general permitido ($${CONFIG.PRECIO_MINIMO_GENERAL})`,
    };
  }
  if (
    categoriaProducto === "procesadores" &&
    precioFinal < CONFIG.PRECIO_MINIMO_PROCESADOR
  ) {
    return {
      esValido: false,
      motivo: `Procesador con precio menor al mínimo permitido ($${CONFIG.PRECIO_MINIMO_PROCESADOR})`,
    };
  }
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

function validarNombreProducto(nombre) {
  if (!nombre || nombre.trim() === "")
    return { esValido: false, motivo: "Producto sin nombre" };
  return { esValido: true, motivo: null };
}

function extraerDatosBasicosFilaCSV(fila) {
  const nombre = (fila["Descripcion"] || "").trim();
  let codigoFabricante = (fila["Part Number"] || fila['"Part Number"'] || "")
    .trim()
    .toUpperCase();
  if (!codigoFabricante)
    codigoFabricante = (fila["Codigo"] || "SIN-CODIGO").trim();
  const codigoRubro = (fila["Rubro"] || "").trim();
  const detalle = (fila["Tipo"] || "").trim() || "N/A";
  const stockPorDeposito = DEPOSITOS_DISPONIBLES.map(
    (deposito) => parseInt(fila[deposito]) || 0
  );
  const stockTotal = stockPorDeposito.reduce(
    (total, stock) => total + stock,
    0
  );
  let depositoPrincipal = VALORES_POR_DEFECTO.deposito;
  for (const deposito of DEPOSITOS_DISPONIBLES) {
    if (parseInt(fila[deposito]) > 0) {
      depositoPrincipal = deposito;
      break;
    }
  }
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

function mapearCategoria(codigoRubro) {
  const categoria = categorias_final_air[codigoRubro];
  if (!categoria || categoria.trim() === "")
    return VALORES_POR_DEFECTO.categoria;
  return categoria;
}

function determinarMargenGanancia(esProcesador, esPlacaVideo) {
  if (esPlacaVideo) return CONFIG.MARGEN_PLACA_VIDEO;
  if (esProcesador) return CONFIG.MARGEN_PROCESADOR;
  return CONFIG.MARGEN_GENERAL;
}

function calcularPreciosCompletos(
  precioDolaresSinIVA,
  porcentajeIVA,
  cotizacionDolar,
  esProcesador,
  esPlacaVideo
) {
  const factorIVA = porcentajeIVA / 100 + 1;
  const margenAplicar = determinarMargenGanancia(esProcesador, esPlacaVideo);
  const precios = {
    dolaresConIVA: Number((precioDolaresSinIVA * factorIVA).toFixed(2)),
    pesosSinIVA: Number((precioDolaresSinIVA * cotizacionDolar).toFixed(2)),
    pesosConIVA: Number(
      (precioDolaresSinIVA * cotizacionDolar * factorIVA).toFixed(2)
    ),
  };
  precios.precioFinalConMargen = Number(
    (precios.pesosConIVA * margenAplicar).toFixed(2)
  );
  precios.margenAplicado = margenAplicar;
  precios.porcentajeGanancia = ((margenAplicar - 1) * 100).toFixed(0) + "%";
  return precios;
}

async function procesarFilaCSV(fila, cotizacionDolar) {
  try {
    const datosBasicos = extraerDatosBasicosFilaCSV(fila);
    const validacionNombre = validarNombreProducto(datosBasicos.nombre);
    if (!validacionNombre.esValido)
      return {
        tipo: "omitida",
        datos: {
          nombre: "SIN NOMBRE",
          codigo: datosBasicos.codigoFabricante,
          categoria: "N/A",
        },
        motivo: validacionNombre.motivo,
      };
    const validacionCodigo = validarCodigoFabricante(
      datosBasicos.codigoFabricante
    );
    if (!validacionCodigo.esValido)
      return {
        tipo: "omitida",
        datos: {
          nombre: datosBasicos.nombre,
          codigo: datosBasicos.codigoFabricante,
          categoria: mapearCategoria(datosBasicos.codigoRubro),
        },
        motivo: validacionCodigo.motivo,
      };
    const validacionRubro = validarRubroPermitido(datosBasicos.codigoRubro);
    if (!validacionRubro.esValido)
      return {
        tipo: "omitida",
        datos: {
          nombre: datosBasicos.nombre,
          codigo: datosBasicos.codigoFabricante,
          categoria: mapearCategoria(datosBasicos.codigoRubro),
        },
        motivo: validacionRubro.motivo,
      };
    if (datosBasicos.precioDolaresSinIVA <= 0)
      return {
        tipo: "omitida",
        datos: {
          nombre: datosBasicos.nombre,
          codigo: datosBasicos.codigoFabricante,
          categoria: mapearCategoria(datosBasicos.codigoRubro),
        },
        motivo: `Precio base inválido: $${datosBasicos.precioDolaresSinIVA} USD`,
      };
    const esProcesador = perteneceACategoria(
      datosBasicos.codigoRubro,
      "procesadores"
    );
    const esAlmacenamiento = perteneceACategoria(
      datosBasicos.codigoRubro,
      "almacenamiento"
    );
    const esPlacaVideo = perteneceACategoria(
      datosBasicos.codigoRubro,
      "placaVideo"
    );
    const precios = calcularPreciosCompletos(
      datosBasicos.precioDolaresSinIVA,
      datosBasicos.porcentajeIVA,
      cotizacionDolar,
      esProcesador,
      esPlacaVideo
    );
    const validacionPrecio = validarPrecioProducto(
      precios.precioFinalConMargen,
      validacionRubro.categoriaDetectada,
      esAlmacenamiento
    );
    if (!validacionPrecio.esValido)
      return {
        tipo: "omitida",
        datos: {
          nombre: datosBasicos.nombre,
          codigo: datosBasicos.codigoFabricante,
          categoria: mapearCategoria(datosBasicos.codigoRubro),
        },
        motivo: validacionPrecio.motivo,
      };
    const categoria = mapearCategoria(datosBasicos.codigoRubro);
    const datosParaBD = prepararDatosParaBaseDatos(
      datosBasicos,
      precios,
      categoria
    );
    const resultadoBD = await insertarProductoEnBaseDatos(datosParaBD);
    return {
      tipo: "exitosa",
      datos: {
        nombre: datosBasicos.nombre,
        codigo: datosBasicos.codigoFabricante,
        categoria,
        categoriaRubro: datosBasicos.codigoRubro,
        stock: datosBasicos.stockTotal,
        precioDolares: datosBasicos.precioDolaresSinIVA,
        precioFinal: precios.precioFinalConMargen,
        margenAplicado: precios.porcentajeGanancia,
        esProcesador,
        esPlacaVideo,
        esAlmacenamiento,
      },
      resultadoBD,
    };
  } catch (error) {
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

routerCargaProducto.post(
  "/cargar-productos",
  upload.single("archivo_csv"),
  async (req, res) => {
    const rutaArchivo = req.file?.path;
    if (!rutaArchivo)
      return res
        .status(400)
        .json({ error: "No se envió ningún archivo CSV válido." });
    try {
      const cotizacionDolar = await obtenerCotizacionDolarYConfigurar();
      const contenidoArchivo = fs.readFileSync(rutaArchivo, "utf8");
      const primeraLinea = contenidoArchivo.split("\n")[0];
      const separador = detectarSeparadorCSV(primeraLinea);
      const { data: filasCSV } = Papa.parse(contenidoArchivo, {
        header: true,
        delimiter: separador,
        skipEmptyLines: true,
      });
      const resultados = { exitosas: [], omitidas: [], errores: [] };
      for (const fila of filasCSV) {
        const resultado = await procesarFilaCSV(fila, cotizacionDolar);
        resultados[
          resultado.tipo === "exitosa"
            ? "exitosas"
            : resultado.tipo === "omitida"
            ? "omitidas"
            : "errores"
        ].push(resultado);
      }
      const estadisticas = calcularEstadisticasFinalesCSV(
        resultados,
        filasCSV.length
      );
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
      res
        .status(500)
        .json({ error: "Error interno del servidor", detalle: error.message });
    } finally {
      await limpiarArchivoTemporal(rutaArchivo);
    }
  }
);

function calcularEstadisticasFinalesCSV(resultados, totalFilas) {
  const procesadas = resultados.exitosas.length;
  const omitidas = resultados.omitidas.length;
  const errores = resultados.errores.length;
  return {
    totalFilasCSV: totalFilas,
    procesadasExitosamente: procesadas,
    omitidas,
    errores,
    totalProcesadas: procesadas + omitidas + errores,
    detallesAdicionales: {
      procesadores: resultados.exitosas.filter((r) => r.datos.esProcesador)
        .length,
      placasVideo: resultados.exitosas.filter((r) => r.datos.esPlacaVideo)
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

async function limpiarArchivoTemporal(rutaArchivo) {
  if (rutaArchivo && fs.existsSync(rutaArchivo)) {
    try {
      fs.unlinkSync(rutaArchivo);
    } catch (error) {
      console.error(
        "No se pudo eliminar el archivo CSV temporal:",
        error.message
      );
    }
  }
}

export default routerCargaProducto;
