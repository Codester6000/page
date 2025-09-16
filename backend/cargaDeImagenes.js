import { db } from "./database/connectionMySQL.js";
import { obtenerImgProducto, validarImagen } from "./recursos/imgs.js";
import express from "express";

const routerimagenes = express.Router();

routerimagenes.post("/imagenes", async (req, res) => {
  try {
    console.log("🚀 Iniciando proceso de carga de imágenes...");

    // Obtener productos
    const [productos] = await db.query(
      "SELECT id_producto, nombre FROM productos ORDER BY id_producto"
    );

    if (productos.length === 0) {
      return res.json({ success: false, msg: "No hay productos cargados." });
    }

    console.log(`📦 Encontrados ${productos.length} productos para procesar`);

    const resultados = [];

    // Limpiar imágenes existentes
    console.log("🧹 Limpiando imágenes existentes...");
    const [limpiezaResult] = await db.query(`CALL limpiar_imagenes_completo()`);
    console.log("🧹 Resultado de limpieza:", limpiezaResult[0]);

    // DEBUGGING: Verificar estado antes de procesar
    console.log("🔍 Verificando estado inicial de la base de datos...");
    const [estadoInicial] = await db.query("CALL obtener_info_imagenes()");
    console.log("📊 Estado inicial:", estadoInicial[0]);

    let procesados = 0;
    for (const producto of productos) {
      procesados++;
      console.log(
        `\n📋 Procesando ${procesados}/${productos.length}: "${producto.nombre}" (ID: ${producto.id_producto})`
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

        // 3. Guardar en base de datos usando el procedimiento NUEVO
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

          // Log adicional para debugging específico
          if (errSP.message.includes("ya tiene una imagen asignada")) {
            console.error(
              `  🔍 DEBUGGING: Verificando estado para producto ${producto.id_producto}:`
            );
            try {
              const [debug] = await db.query(
                "SELECT COUNT(*) as tiene_imagen FROM productos_imagenes WHERE id_producto = ?",
                [producto.id_producto]
              );
              console.error(
                `  🔍 Producto ${producto.id_producto} tiene ${debug[0].tiene_imagen} imágenes asignadas`
              );

              if (debug[0].tiene_imagen > 0) {
                const [imagenes] = await db.query(
                  `
                  SELECT pi.id_imagen, i.url_imagen 
                  FROM productos_imagenes pi 
                  JOIN imagenes i ON pi.id_imagen = i.id_imagen 
                  WHERE pi.id_producto = ?
                `,
                  [producto.id_producto]
                );
                console.error(`  🔍 Imágenes existentes:`, imagenes);
              }
            } catch (debugErr) {
              console.error(`  ❌ Error en debug:`, debugErr.message);
            }
          }

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

    // DEBUGGING FINAL: Verificar estado de la base de datos
    console.log("\n🔍 Verificando estado final de la base de datos...");
    try {
      const [estadoFinal] = await db.query("CALL obtener_info_imagenes()");
      console.log("📊 Estado final:", estadoFinal);
    } catch (debugErr) {
      console.log("⚠️  No se pudo verificar estado final:", debugErr.message);
    }

    // Estadísticas finales
    const exitosos = resultados.filter((r) => r.estado === "SUCCESS").length;
    const sinImagen = resultados.filter(
      (r) => r.estado === "SIN_IMAGEN"
    ).length;
    const invalidas = resultados.filter(
      (r) => r.estado === "IMAGEN_INVALIDA"
    ).length;
    const errores = resultados.filter((r) => r.estado.includes("ERROR")).length;

    console.log(`\n📊 RESUMEN FINAL:`);
    console.log(`✅ Exitosos: ${exitosos}`);
    console.log(`❌ Sin imagen: ${sinImagen}`);
    console.log(`❌ Imágenes inválidas: ${invalidas}`);
    console.log(`❌ Errores: ${errores}`);
    console.log(`📋 Total: ${resultados.length}`);

    return res.json({
      success: true,
      total_productos: productos.length,
      estadisticas: {
        exitosos,
        sin_imagen: sinImagen,
        imagenes_invalidas: invalidas,
        errores,
      },
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
