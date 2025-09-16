import { db } from "./database/connectionMySQL.js";
import { obtenerImgProducto, validarImagen } from "./recursos/imgs.js";
import express from "express";

const routerimagenes = express.Router();

routerimagenes.post("/imagenes", async (req, res) => {
  try {
    console.log("🚀 Iniciando proceso de carga de imágenes...");

    // 1. VERIFICAR ESTADO INICIAL DE IMÁGENES
    console.log("🔍 Verificando estado inicial de imágenes...");
    const [estadoInicial] = await db.query("CALL obtener_info_imagenes()");

    if (!estadoInicial || !estadoInicial[0] || estadoInicial[0].length === 0) {
      return res.json({
        success: false,
        msg: "No se pudo obtener información del estado de imágenes.",
      });
    }

    const infoImagenes = estadoInicial[0][0]; // Primer resultado del procedimiento
    console.log("📊 Estado inicial de imágenes:", infoImagenes);

    // Extraer información relevante
    const totalImagenes = infoImagenes.total_imagenes || 0;
    const totalRelaciones = infoImagenes.total_relaciones || 0;
    const urlsUnicas = infoImagenes.urls_unicas || 0;

    console.log(
      `📈 Resumen: ${totalImagenes} imágenes, ${totalRelaciones} relaciones, ${urlsUnicas} URLs únicas`
    );

    // 2. DECIDIR SI LIMPIAR O NO
    let necesitaLimpieza = totalImagenes < 5;

    if (necesitaLimpieza) {
      console.log(
        `🧹 Total de imágenes (${totalImagenes}) es menor a 5. Ejecutando limpieza...`
      );
      try {
        const [limpiezaResult] = await db.query(
          `CALL limpiar_imagenes_completo()`
        );
        console.log("✅ Limpieza completada:", limpiezaResult[0]);
      } catch (errLimpieza) {
        console.error("❌ Error durante la limpieza:", errLimpieza.message);
        return res.status(500).json({
          success: false,
          error: "Error durante la limpieza de imágenes",
          mensaje: errLimpieza.message,
        });
      }
    } else {
      console.log(
        `✅ Total de imágenes (${totalImagenes}) es suficiente. Saltando limpieza...`
      );
    }

    // 3. OBTENER PRODUCTOS DISPONIBLES
    const [productos] = await db.query(
      "SELECT id_producto, nombre FROM productos ORDER BY id_producto"
    );

    if (productos.length === 0) {
      return res.json({ success: false, msg: "No hay productos cargados." });
    }

    console.log(`📦 Encontrados ${productos.length} productos en total`);

    // 4. FILTRAR PRODUCTOS QUE YA TIENEN IMAGEN
    console.log("🔍 Verificando qué productos ya tienen imágenes asignadas...");

    const [productosConImagen] = await db.query(`
      SELECT DISTINCT p.id_producto, p.nombre
      FROM productos p
      INNER JOIN productos_imagenes pi ON p.id_producto = pi.id_producto
      INNER JOIN imagenes i ON pi.id_imagen = i.id_imagen
      WHERE i.url_imagen IS NOT NULL AND i.url_imagen != ''
      ORDER BY p.id_producto
    `);

    console.log(
      `📸 ${productosConImagen.length} productos ya tienen imagen asignada`
    );

    // Crear array de IDs que ya tienen imagen
    const idsConImagen = productosConImagen.map((p) => p.id_producto);

    // Filtrar productos que NO tienen imagen
    const productosSinImagen = productos.filter(
      (p) => !idsConImagen.includes(p.id_producto)
    );

    console.log(`📋 ${productosSinImagen.length} productos necesitan imagen`);
    console.log(
      `🔄 Productos que serán saltados (ya tienen imagen): ${idsConImagen.join(
        ", "
      )}`
    );

    if (productosSinImagen.length === 0) {
      return res.json({
        success: true,
        msg: "Todos los productos ya tienen imagen asignada",
        estadisticas: {
          total_productos: productos.length,
          productos_con_imagen: productosConImagen.length,
          productos_sin_imagen: 0,
          necesito_limpieza: necesitaLimpieza,
        },
        timestamp: new Date().toISOString(),
      });
    }

    // 5. PROCESAR SOLO PRODUCTOS SIN IMAGEN
    const resultados = [];
    let procesados = 0;

    for (const producto of productosSinImagen) {
      procesados++;
      console.log(
        `\n📋 Procesando ${procesados}/${productosSinImagen.length}: "${producto.nombre}" (ID: ${producto.id_producto})`
      );

      try {
        // 1. Buscar imagen
        console.log("  🔍 Buscando imagen...");
        const urlImg = await obtenerImgProducto(producto.nombre);

        if (!urlImg) {
          console.log("  ❌ No se encontró imagen");
          resultados.push({
            producto: producto.nombre,
            id_producto: producto.id_producto,
            url: null,
            estado: "SIN_IMAGEN",
            mensaje: "No se encontró imagen para este producto",
          });
          continue;
        }

        console.log(`  🖼️  Imagen encontrada: ${urlImg.substring(0, 80)}...`);

        // 2. Validar imagen
        console.log("  ✅ Validando imagen...");
        const esValida = await validarImagen(urlImg);

        if (!esValida) {
          console.log("  ❌ Imagen no válida");
          resultados.push({
            producto: producto.nombre,
            id_producto: producto.id_producto,
            url: urlImg,
            estado: "IMAGEN_INVALIDA",
            mensaje: "La URL de imagen no es válida",
          });
          continue;
        }

        console.log("  ✅ Imagen válida");

        // 3. Guardar en base de datos
        console.log("  💾 Guardando en base de datos...");

        try {
          const [resultadoSP] = await db.query(
            "CALL cargar_imagen_nueva(?, ?)",
            [urlImg, producto.id_producto]
          );

          console.log(
            `  ✅ Guardado exitoso - ID imagen: ${resultadoSP[0]?.id_imagen}`
          );

          resultados.push({
            producto: producto.nombre,
            id_producto: producto.id_producto,
            url: urlImg,
            estado: resultadoSP[0]?.estado || "SUCCESS",
            mensaje: resultadoSP[0]?.mensaje || "Imagen cargada exitosamente",
            id_imagen: resultadoSP[0]?.id_imagen,
          });
        } catch (errSP) {
          console.error(`  ❌ Error en stored procedure:`, errSP.message);

          resultados.push({
            producto: producto.nombre,
            id_producto: producto.id_producto,
            url: urlImg,
            estado: "ERROR_BD",
            mensaje: `Error en base de datos: ${errSP.message}`,
            error_detalle: errSP.message,
          });
        }
      } catch (err) {
        console.error(`  ❌ Error general procesando producto:`, err.message);
        resultados.push({
          producto: producto.nombre,
          id_producto: producto.id_producto,
          url: null,
          estado: "ERROR_GENERAL",
          mensaje: `Error general: ${err.message}`,
          error_detalle: err.message,
        });
      }

      // Pausa pequeña entre productos para no sobrecargar
      if (procesados % 5 === 0) {
        console.log("  ⏸️  Pausa de 1 segundo...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // 6. VERIFICAR ESTADO FINAL
    console.log("\n🔍 Verificando estado final de la base de datos...");
    try {
      const [estadoFinal] = await db.query("CALL obtener_info_imagenes()");
      console.log("📊 Estado final:", estadoFinal[0]);
    } catch (debugErr) {
      console.log("⚠️  No se pudo verificar estado final:", debugErr.message);
    }

    // 7. ESTADÍSTICAS FINALES
    const exitosos = resultados.filter((r) => r.estado === "SUCCESS").length;
    const sinImagen = resultados.filter(
      (r) => r.estado === "SIN_IMAGEN"
    ).length;
    const invalidas = resultados.filter(
      (r) => r.estado === "IMAGEN_INVALIDA"
    ).length;
    const errores = resultados.filter((r) => r.estado.includes("ERROR")).length;

    console.log(`\n📊 RESUMEN FINAL:`);
    console.log(`📦 Total productos: ${productos.length}`);
    console.log(`📸 Ya tenían imagen: ${productosConImagen.length}`);
    console.log(`🔄 Procesados: ${productosSinImagen.length}`);
    console.log(`✅ Exitosos: ${exitosos}`);
    console.log(`❌ Sin imagen: ${sinImagen}`);
    console.log(`❌ Imágenes inválidas: ${invalidas}`);
    console.log(`❌ Errores: ${errores}`);
    console.log(`🧹 Se ejecutó limpieza: ${necesitaLimpieza ? "SÍ" : "NO"}`);

    return res.json({
      success: true,
      total_productos: productos.length,
      productos_ya_con_imagen: productosConImagen.length,
      productos_procesados: productosSinImagen.length,
      se_ejecuto_limpieza: necesitaLimpieza,
      estado_inicial: {
        total_imagenes: totalImagenes,
        total_relaciones: totalRelaciones,
        urls_unicas: urlsUnicas,
      },
      estadisticas: {
        exitosos,
        sin_imagen: sinImagen,
        imagenes_invalidas: invalidas,
        errores,
      },
      productos_saltados: idsConImagen,
      detalle: resultados,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("💥 Error general en /imagenes:", err);
    return res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      mensaje: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

routerimagenes.get("/imagenes/debug", async (req, res) => {
  try {
    const [estado] = await db.query("CALL obtener_info_imagenes()");
    return res.json({
      success: true,
      estado: estado,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default routerimagenes;
