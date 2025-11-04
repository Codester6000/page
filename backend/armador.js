import express from "express";
import {
  validarQueryArmador,
  verificarValidaciones,
} from "./middleware/validaciones.js";
import { db } from "./database/connectionMySQL.js";

const armadorRouter = express.Router();

/**
 * Servicio para manejar la lógica del armador de PC
 */
class ArmadorService {
  /**
   * Extrae watts del nombre de una fuente
   */
  static extraerWattsFuente(nombre) {
    if (!nombre) return 0;

    const patrones = [
      /(\d{3,4})W/i,
      /(\d{3,4})\s*W/i,
      /(\d{3,4})\s*watts?/i,
      /(400|450|500|550|600|650|700|750|800|850|900|1000|1200|1500)/,
    ];

    for (const patron of patrones) {
      const match = nombre.match(patron);
      if (match) {
        const watts = parseInt(match[1]);
        if (watts >= 300 && watts <= 2000) {
          return watts;
        }
      }
    }

    return 0;
  }

  /**
   * Procesa los productos de fuentes para extraer watts del nombre
   */
  static procesarProductosFuentes(productos) {
    return productos.map((producto) => ({
      ...producto,
      consumo:
        producto.consumo && producto.consumo > 0
          ? producto.consumo
          : this.extraerWattsFuente(producto.nombre),
    }));
  }

  /**
   * Obtiene las compatibilidades de un producto específico
   */
  static async obtenerCompatibilidadesProducto(idProducto) {
    try {
      const [result] = await db.execute(
        "CALL sp_obtener_compatibilidades_producto(?)",
        [idProducto]
      );
      return result[0] || [];
    } catch (error) {
      console.error("Error obteniendo compatibilidades:", error);
      return [];
    }
  }

  /**
   * Calcula el consumo estimado basado en el nombre del procesador
   */
  static calcularConsumoEstimado(nombre) {
    if (!nombre) return 65; // TDP base por defecto
    const upperName = nombre.toUpperCase();

    // Patrones para Intel (más específicos primero)
    if (upperName.includes("I9-13900") || upperName.includes("I9-14900"))
      return 253;
    if (upperName.includes("I7-13700") || upperName.includes("I7-14700"))
      return 253;
    if (upperName.includes("I9")) return 150;
    if (upperName.includes("I7")) return 125;
    if (upperName.includes("I5-13600") || upperName.includes("I5-14600"))
      return 181;
    if (upperName.includes("I5")) return 125;
    if (upperName.includes("I3")) return 89;

    // Patrones para AMD (más específicos primero)
    if (upperName.includes("RYZEN 9") && upperName.includes("X")) return 170;
    if (upperName.includes("RYZEN 9")) return 120;
    if (upperName.includes("RYZEN 7") && upperName.includes("X")) return 105;
    if (upperName.includes("RYZEN 7")) return 65;
    if (upperName.includes("RYZEN 5") && upperName.includes("X")) return 95;
    if (upperName.includes("RYZEN 5")) return 65;
    if (upperName.includes("RYZEN 3")) return 65;

    return 65; // TDP base por defecto si no coincide nada
  }

  /**
   * Determina las restricciones de compatibilidad basadas en los productos seleccionados
   */
  static async determinarRestricciones(params) {
    const { procesador_id, motherboard_id, memoria_id, gpu_id } = params;

    let socketRequerido = null;
    let ramRequerida = null;
    let consumoTotal = 50; // Consumo base para Motherboard, RAM, SSD

    // Analizar procesador seleccionado
    if (procesador_id) {
      const compatibilidades = await this.obtenerCompatibilidadesProducto(
        procesador_id
      );

      // Determinar socket del procesador
      const socket = compatibilidades.find((c) =>
        ["am4", "am5", "1200", "1700", "1151", "1851"].includes(
          c.nombre_categoria
        )
      );
      if (socket) socketRequerido = socket.nombre_categoria;

      // Calcular consumo estimado del procesador
      const [procesadorInfo] = await db.execute(
        "SELECT nombre, consumo FROM productos WHERE id_producto = ?",
        [procesador_id]
      );

      if (procesadorInfo[0]) {
        const consumoCalculado = this.calcularConsumoEstimado(
          procesadorInfo[0].nombre
        );
        consumoTotal += procesadorInfo[0].consumo || consumoCalculado;
      }
    }

    // Analizar motherboard seleccionada
    if (motherboard_id) {
      const compatibilidades = await this.obtenerCompatibilidadesProducto(
        motherboard_id
      );

      if (!socketRequerido) {
        const socket = compatibilidades.find((c) =>
          ["am4", "am5", "1200", "1700", "1151", "1851"].includes(
            c.nombre_categoria
          )
        );
        if (socket) socketRequerido = socket.nombre_categoria;
      }

      const ram = compatibilidades.find((c) =>
        ["DDR3", "DDR4", "DDR5"].includes(c.nombre_categoria)
      );
      if (ram) ramRequerida = ram.nombre_categoria;
    }

    // Analizar memoria seleccionada
    if (memoria_id && !ramRequerida) {
      const compatibilidades = await this.obtenerCompatibilidadesProducto(
        memoria_id
      );
      const ram = compatibilidades.find((c) =>
        ["DDR3", "DDR4", "DDR5"].includes(c.nombre_categoria)
      );
      if (ram) ramRequerida = ram.nombre_categoria;
    }

    // Calcular consumo adicional de GPU
    if (gpu_id) {
      const [gpuInfo] = await db.execute(
        "SELECT consumo FROM productos WHERE id_producto = ?",
        [gpu_id]
      );
      if (gpuInfo[0]?.consumo) {
        consumoTotal += gpuInfo[0].consumo;
      }
    }

    return {
      socketRequerido,
      ramRequerida,
      consumoTotal,
      fuenteMinima: Math.ceil(consumoTotal * 1.5), // Margen de 50%
    };
  }

  static construirConsultaBase() {
    return `
            SELECT
                pr.id_producto,
                COALESCE(pr.consumo, 0) as consumo,
                pr.nombre, 
                p.stock, 
                pr.peso, 
                pr.garantia_meses, 
                pr.codigo_fabricante,
                GROUP_CONCAT(DISTINCT c.nombre_categoria SEPARATOR ', ') AS categorias,
                (SELECT JSON_ARRAYAGG(url_imagen)
                    FROM (
                        SELECT DISTINCT i.url_imagen
                        FROM productos_imagenes pi
                        INNER JOIN imagenes i ON pi.id_imagen = i.id_imagen
                        WHERE pi.id_producto = pr.id_producto
                    ) AS distinct_images
                ) AS url_imagenes,
                p.precio_dolar,
                p.precio_dolar_iva,
                p.iva, 
                p.precio_pesos,
                p.precio_pesos_iva,
                CASE
                    WHEN pro.nombre_proveedor = 'air' AND pr.id_producto IN (
                        SELECT pc2.id_producto
                        FROM productos_categorias pc2
                        INNER JOIN categorias c2 ON pc2.id_categoria = c2.id_categoria
                        WHERE c2.nombre_categoria IN ('procesadores')
                        GROUP BY pc2.id_producto
                    ) THEN p.precio_pesos_iva * 1.12
                    WHEN pro.nombre_proveedor = 'air' THEN p.precio_pesos_iva * 1.12
                    ELSE p.precio_pesos_iva
                END AS precio_pesos_iva_ajustado,
                pr.alto, 
                pr.ancho, 
                pr.largo, 
                pro.nombre_proveedor
            FROM productos pr
            INNER JOIN precios p ON pr.id_producto = p.id_producto
            INNER JOIN productos_categorias pc ON pr.id_producto = pc.id_producto
            INNER JOIN categorias c ON pc.id_categoria = c.id_categoria
            LEFT JOIN productos_imagenes pi ON pi.id_producto = pr.id_producto
            LEFT JOIN imagenes i ON pi.id_imagen = i.id_imagen
            INNER JOIN proveedores pro ON pro.id_proveedor = p.id_proveedor
            WHERE 
                p.precio_dolar = (
                    SELECT MIN(precio_dolar) 
                    FROM precios 
                    WHERE id_producto = pr.id_producto AND stock > 0 AND p.deshabilitado = 0
                )
                AND p.stock > 0 
                AND p.deshabilitado = 0
        `;
  }

  static construirConsultaFuentes() {
    return `
            SELECT
                pr.id_producto,
                CASE 
                    WHEN COALESCE(pr.consumo, 0) > 0 THEN pr.consumo
                    ELSE (
                        CASE
                            WHEN pr.nombre REGEXP '[0-9]{3,4}W' THEN 
                                CAST(REGEXP_SUBSTR(pr.nombre, '[0-9]{3,4}(?=W)') AS UNSIGNED)
                            WHEN pr.nombre REGEXP '[0-9]{3,4}\\\\s*W' THEN 
                                CAST(REGEXP_SUBSTR(pr.nombre, '[0-9]{3,4}(?=\\\\s*W)') AS UNSIGNED)
                            WHEN UPPER(pr.nombre) REGEXP '[0-9]{3,4}\\\\s*WATTS?' THEN 
                                CAST(REGEXP_SUBSTR(UPPER(pr.nombre), '[0-9]{3,4}(?=\\\\s*WATTS?)') AS UNSIGNED)
                            WHEN pr.nombre REGEXP '(400|450|500|550|600|650|700|750|800|850|900|1000|1200|1500)' THEN 
                                CAST(REGEXP_SUBSTR(pr.nombre, '(400|450|500|550|600|650|700|750|800|850|900|1000|1200|1500)') AS UNSIGNED)
                            ELSE 0
                        END
                    )
                END as consumo,
                pr.nombre, 
                p.stock, 
                pr.peso, 
                pr.garantia_meses, 
                pr.codigo_fabricante,
                GROUP_CONCAT(DISTINCT c.nombre_categoria SEPARATOR ', ') AS categorias,
                (SELECT JSON_ARRAYAGG(url_imagen)
                    FROM (
                        SELECT DISTINCT i.url_imagen
                        FROM productos_imagenes pi
                        INNER JOIN imagenes i ON pi.id_imagen = i.id_imagen
                        WHERE pi.id_producto = pr.id_producto
                    ) AS distinct_images
                ) AS url_imagenes,
                p.precio_dolar,
                p.precio_dolar_iva,
                p.iva, 
                p.precio_pesos,
                p.precio_pesos_iva,
                CASE
                    WHEN pro.nombre_proveedor = 'air' THEN p.precio_pesos_iva * 1.12
                    ELSE p.precio_pesos_iva
                END AS precio_pesos_iva_ajustado,
                pr.alto, 
                pr.ancho, 
                pr.largo, 
                pro.nombre_proveedor
            FROM productos pr
            INNER JOIN precios p ON pr.id_producto = p.id_producto
            INNER JOIN productos_categorias pc ON pr.id_producto = pc.id_producto
            INNER JOIN categorias c ON pc.id_categoria = c.id_categoria
            LEFT JOIN productos_imagenes pi ON pi.id_producto = pr.id_producto
            LEFT JOIN imagenes i ON pi.id_imagen = i.id_imagen
            INNER JOIN proveedores pro ON pro.id_proveedor = p.id_proveedor
            WHERE 
                p.precio_dolar = (
                    SELECT MIN(precio_dolar) 
                    FROM precios 
                    WHERE id_producto = pr.id_producto AND stock > 0 AND p.deshabilitado = 0
                )
                AND p.stock > 0 
                AND p.deshabilitado = 0
        `;
  }

  static aplicarFiltrosCategoria(sql, categoria, restricciones, params) {
    const { socketRequerido, ramRequerida, fuenteMinima } = restricciones;

    switch (categoria) {
      case "procesadores":
        sql += ` AND pr.id_producto IN (
                    SELECT pc2.id_producto
                    FROM productos_categorias pc2
                    INNER JOIN categorias c2 ON pc2.id_categoria = c2.id_categoria
                    WHERE c2.nombre_categoria = 'procesadores'
                )`;

        if (socketRequerido) {
          sql += ` AND pr.id_producto IN (
                        SELECT pc3.id_producto
                        FROM productos_categorias pc3
                        INNER JOIN categorias c3 ON pc3.id_categoria = c3.id_categoria
                        WHERE c3.nombre_categoria = ?
                    )`;
          params.push(socketRequerido);
        }
        break;

      case "motherboards":
        sql += ` AND pr.id_producto IN (
                    SELECT pc2.id_producto
                    FROM productos_categorias pc2
                    INNER JOIN categorias c2 ON pc2.id_categoria = c2.id_categoria
                    WHERE c2.nombre_categoria = 'motherboards'
                )`;

        if (socketRequerido) {
          sql += ` AND pr.id_producto IN (
                        SELECT pc3.id_producto
                        FROM productos_categorias pc3
                        INNER JOIN categorias c3 ON pc3.id_categoria = c3.id_categoria
                        WHERE c3.nombre_categoria = ?
                    )`;
          params.push(socketRequerido);
        }

        if (ramRequerida) {
          sql += ` AND pr.id_producto IN (
                        SELECT pc4.id_producto
                        FROM productos_categorias pc4
                        INNER JOIN categorias c4 ON pc4.id_categoria = c4.id_categoria
                        WHERE c4.nombre_categoria = ?
                    )`;
          params.push(ramRequerida);
        }
        break;

      case "memorias":
        sql += ` AND pr.id_producto IN (
                    SELECT pc2.id_producto
                    FROM productos_categorias pc2
                    INNER JOIN categorias c2 ON pc2.id_categoria = c2.id_categoria
                    WHERE c2.nombre_categoria = 'memorias pc'
                )`;

        if (ramRequerida) {
          sql += ` AND pr.id_producto IN (
                        SELECT pc3.id_producto
                        FROM productos_categorias pc3
                        INNER JOIN categorias c3 ON pc3.id_categoria = c3.id_categoria
                        WHERE c3.nombre_categoria = ?
                    )`;
          params.push(ramRequerida);
        }
        break;

      case "gpus":
        sql += ` AND pr.id_producto IN (
                    SELECT pc2.id_producto
                    FROM productos_categorias pc2
                    INNER JOIN categorias c2 ON pc2.id_categoria = c2.id_categoria
                    WHERE c2.nombre_categoria = 'Placas de Video'
                )`;
        break;

      case "fuentes":
        sql += ` AND pr.id_producto IN (
                    SELECT pc2.id_producto
                    FROM productos_categorias pc2
                    INNER JOIN categorias c2 ON pc2.id_categoria = c2.id_categoria
                    WHERE c2.nombre_categoria = 'fuentes'
                )`;

        if (fuenteMinima > 0) {
          sql += ` AND (
                        CASE 
                            WHEN COALESCE(pr.consumo, 0) > 0 THEN pr.consumo
                            ELSE (
                                CASE
                                    WHEN pr.nombre REGEXP '[0-9]{3,4}W' THEN 
                                        CAST(REGEXP_SUBSTR(pr.nombre, '[0-9]{3,4}(?=W)') AS UNSIGNED)
                                    WHEN pr.nombre REGEXP '[0-9]{3,4}\\\\s*W' THEN 
                                        CAST(REGEXP_SUBSTR(pr.nombre, '[0-9]{3,4}(?=\\\\s*W)') AS UNSIGNED)
                                    WHEN UPPER(pr.nombre) REGEXP '[0-9]{3,4}\\\\s*WATTS?' THEN 
                                        CAST(REGEXP_SUBSTR(UPPER(pr.nombre), '[0-9]{3,4}(?=\\\\s*WATTS?)') AS UNSIGNED)
                                    WHEN pr.nombre REGEXP '(400|450|500|550|600|650|700|750|800|850|900|1000|1200|1500)' THEN 
                                        CAST(REGEXP_SUBSTR(pr.nombre, '(400|450|500|550|600|650|700|750|800|850|900|1000|1200|1500)') AS UNSIGNED)
                                    ELSE 0
                                END
                            )
                        END
                    ) >= ?`;
          params.push(fuenteMinima);
        }
        break;

      case "gabinetes":
        sql += ` AND pr.id_producto IN (
                    SELECT pc2.id_producto
                    FROM productos_categorias pc2
                    INNER JOIN categorias c2 ON pc2.id_categoria = c2.id_categoria
                    WHERE c2.nombre_categoria = 'gabinetes'
                )`;
        break;

      case "almacenamiento":
        sql += ` AND pr.id_producto IN (
                    SELECT pc2.id_producto
                    FROM productos_categorias pc2
                    INNER JOIN categorias c2 ON pc2.id_categoria = c2.id_categoria
                    WHERE c2.nombre_categoria IN ('discos internos', 'discos internos ssd', 'discos externos')
                )`;
        break;

      case "coolers":
        sql += ` AND pr.id_producto IN (
                    SELECT pc2.id_producto
                    FROM productos_categorias pc2
                    INNER JOIN categorias c2 ON pc2.id_categoria = c2.id_categoria
                    WHERE c2.nombre_categoria = 'Coolers'
                )`;

        if (socketRequerido) {
          sql += ` AND pr.id_producto IN (
                        SELECT pc3.id_producto
                        FROM productos_categorias pc3
                        INNER JOIN categorias c3 ON pc3.id_categoria = c3.id_categoria
                        WHERE c3.nombre_categoria = ?
                    )`;
          params.push(socketRequerido);
        }
        break;

      case "monitores":
        sql += ` AND pr.id_producto IN (
                    SELECT pc2.id_producto
                    FROM productos_categorias pc2
                    INNER JOIN categorias c2 ON pc2.id_categoria = c2.id_categoria
                    WHERE c2.nombre_categoria = 'Monitores'
                )`;
        break;
    }

    return sql;
  }

  static async obtenerProductosCompatibles(categoria, restricciones) {
    const params = [];

    // Usar consulta especial para fuentes o consulta base para otros
    let sql =
      categoria === "fuentes"
        ? this.construirConsultaFuentes()
        : this.construirConsultaBase();

    sql = this.aplicarFiltrosCategoria(sql, categoria, restricciones, params);

    // Agregar ORDER BY y GROUP BY
    sql += `
            GROUP BY pr.id_producto, p.stock, p.precio_dolar, p.precio_dolar_iva, p.iva, p.precio_pesos, p.precio_pesos_iva, pr.alto, pr.ancho, pr.largo, pro.nombre_proveedor
            ORDER BY precio_pesos_iva_ajustado
        `;

    try {
      const [result] = await db.execute(sql, params);

      if (categoria === "fuentes") {
        console.log(
          `Fuentes encontradas: ${result.length}, watts mínimos requeridos: ${restricciones.fuenteMinima}`
        );
      }

      return result;
    } catch (error) {
      console.error(`Error obteniendo productos de ${categoria}:`, error);
      return [];
    }
  }
}

/**
 * Endpoint principal del armador de PC
 */
armadorRouter.get(
  "/",
  validarQueryArmador(),
  verificarValidaciones,
  async (req, res) => {
    try {
      const {
        procesador_id,
        motherboard_id,
        gpu_id,
        memoria_id,
        gabinete_id,
        almacenamiento_id,
        consumoW,
        order,
      } = req.query;

      // Determinar restricciones de compatibilidad
      const restricciones = await ArmadorService.determinarRestricciones({
        procesador_id,
        motherboard_id,
        memoria_id,
        gpu_id,
      });

      // Agregar consumo adicional si se especifica
      if (consumoW && !isNaN(consumoW)) {
        restricciones.consumoTotal += Number(consumoW);
        restricciones.fuenteMinima = Math.ceil(restricciones.consumoTotal * 1.5);
      }

      console.log("Restricciones calculadas:", restricciones);

      // Obtener productos por categoría
      const [
        procesadores,
        motherboards,
        gpus,
        memorias,
        fuentes,
        gabinetes,
        almacenamientos,
        coolers,
        monitores,
      ] = await Promise.all([
        ArmadorService.obtenerProductosCompatibles(
          "procesadores",
          restricciones
        ),
        ArmadorService.obtenerProductosCompatibles(
          "motherboards",
          restricciones
        ),
        ArmadorService.obtenerProductosCompatibles("gpus", restricciones),
        ArmadorService.obtenerProductosCompatibles("memorias", restricciones),
        ArmadorService.obtenerProductosCompatibles("fuentes", restricciones),
        ArmadorService.obtenerProductosCompatibles("gabinetes", restricciones),
        ArmadorService.obtenerProductosCompatibles(
          "almacenamiento",
          restricciones
        ),
        ArmadorService.obtenerProductosCompatibles("coolers", restricciones),
        ArmadorService.obtenerProductosCompatibles("monitores", restricciones),
      ]);

      // Respuesta estructurada
      const response = {
        productos: {
          procesadores,
          motherboards,
          gpus,
          memorias,
          fuentes,
          gabinetes,
          almacenamiento: almacenamientos,
          coolers,
          monitores,
        },
        compatibilidad: {
          socket_requerido: restricciones.socketRequerido,
          ram_requerida: restricciones.ramRequerida,
          consumo_total: restricciones.consumoTotal,
          fuente_minima: restricciones.fuenteMinima,
        },
        estadisticas: {
          total_procesadores: procesadores.length,
          total_motherboards: motherboards.length,
          total_gpus: gpus.length,
          total_memorias: memorias.length,
          total_fuentes: fuentes.length,
          total_gabinetes: gabinetes.length,
          total_almacenamiento: almacenamientos.length,
          total_coolers: coolers.length,
          total_monitores: monitores.length,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error en endpoint del armador:", error);
      res.status(500).json({
        error: "Error interno del servidor",
        message: "No se pudieron obtener los componentes del armador",
      });
    }
  }
);

/**
 * Endpoint para validar compatibilidad
 */
armadorRouter.post("/validar-compatibilidad", async (req, res) => {
  try {
    const { componentes } = req.body;

    if (!componentes || typeof componentes !== "object") {
      return res.status(400).json({
        error: "Debe proporcionar un objeto con los componentes a validar",
      });
    }

    const restricciones = await ArmadorService.determinarRestricciones(
      componentes
    );

    // Validaciones específicas
    const validaciones = {
      socket_compatible: true,
      ram_compatible: true,
      fuente_suficiente: true,
      errores: [],
      advertencias: [],
    };

    // Validar socket entre procesador y motherboard
    if (componentes.procesador_id && componentes.motherboard_id) {
      const procesadorCompat =
        await ArmadorService.obtenerCompatibilidadesProducto(
          componentes.procesador_id
        );
      const motherboardCompat =
        await ArmadorService.obtenerCompatibilidadesProducto(
          componentes.motherboard_id
        );

      const socketProcesador = procesadorCompat.find((c) =>
        ["am4", "am5", "1200", "1700", "1151", "1851"].includes(
          c.nombre_categoria
        )
      );

      const socketMotherboard = motherboardCompat.find((c) =>
        ["am4", "am5", "1200", "1700", "1151", "1851"].includes(
          c.nombre_categoria
        )
      );

      if (
        socketProcesador &&
        socketMotherboard &&
        socketProcesador.nombre_categoria !== socketMotherboard.nombre_categoria
      ) {
        validaciones.socket_compatible = false;
        validaciones.errores.push(
          "El socket del procesador no es compatible con la motherboard"
        );
      }
    }

    // Validar RAM con motherboard
    if (componentes.memoria_id && componentes.motherboard_id) {
      const memoriaCompat =
        await ArmadorService.obtenerCompatibilidadesProducto(
          componentes.memoria_id
        );
      const motherboardCompat =
        await ArmadorService.obtenerCompatibilidadesProducto(
          componentes.motherboard_id
        );

      const tipoMemoria = memoriaCompat.find((c) =>
        ["DDR3", "DDR4", "DDR5"].includes(c.nombre_categoria)
      );

      const tipoMotherboard = motherboardCompat.find((c) =>
        ["DDR3", "DDR4", "DDR5"].includes(c.nombre_categoria)
      );

      if (
        tipoMemoria &&
        tipoMotherboard &&
        tipoMemoria.nombre_categoria !== tipoMotherboard.nombre_categoria
      ) {
        validaciones.ram_compatible = false;
        validaciones.errores.push(
          "El tipo de memoria no es compatible con la motherboard"
        );
      }
    }

    // Validar fuente con consumo total
    if (componentes.fuente_id && restricciones.consumoTotal > 0) {
      const [fuenteInfo] = await db.execute(
        "SELECT nombre, consumo FROM productos WHERE id_producto = ?",
        [componentes.fuente_id]
      );

      if (fuenteInfo[0]) {
        const wattsReales =
          fuenteInfo[0].consumo ||
          ArmadorService.extraerWattsFuente(fuenteInfo[0].nombre);

        if (wattsReales < restricciones.fuenteMinima) {
          validaciones.fuente_suficiente = false;
          validaciones.errores.push(
            `La fuente de ${wattsReales}W es insuficiente. Se recomienda mínimo ${restricciones.fuenteMinima}W`
          );
        } else if (wattsReales < restricciones.fuenteMinima * 1.2) {
          validaciones.advertencias.push(
            `La fuente de ${wattsReales}W tiene poca reserva de potencia`
          );
        }
      }
    }

    const response = {
      compatible: validaciones.errores.length === 0,
      restricciones,
      validaciones,
      recomendaciones: {
        socket_requerido: restricciones.socketRequerido,
        ram_requerida: restricciones.ramRequerida,
        fuente_minima: restricciones.fuenteMinima,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error validando compatibilidad:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      message: "No se pudo validar la compatibilidad",
    });
  }
});

export default armadorRouter;
