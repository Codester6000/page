// src/components/CargaProductos.jsx
import { useState } from "react";
import axios from "axios";
import "../styles/CargaProductos.css";

// ================== COMPONENTES DE RESULTADOS ==================
const ResultadosGenericos = ({ titulo, resultados }) => {
  if (!resultados) return null;

  const { mensaje, estadisticas, detalles } = resultados;

  return (
    <div className="resultados">
      <h3>{titulo}</h3>

      {/* Caso CSV (formateado) */}
      {mensaje && (
        <>
          <p>
            <strong>{mensaje}</strong>
          </p>

          {estadisticas && (
            <div className="estadisticas">
              <h4>📌 Estadísticas</h4>
              <ul>
                <li>Total filas: {estadisticas.totalFilasCSV}</li>
                <li>
                  Procesadas exitosamente: {estadisticas.procesadasExitosamente}
                </li>
                <li>Omitidas: {estadisticas.omitidas}</li>
                <li>Errores: {estadisticas.errores}</li>
                <li>Total procesadas: {estadisticas.totalProcesadas}</li>
              </ul>

              {estadisticas.detallesAdicionales && (
                <>
                  <h5>📂 Detalles adicionales</h5>
                  <p>
                    <strong>Procesadores:</strong>{" "}
                    {estadisticas.detallesAdicionales.procesadores ?? 0}
                  </p>
                  <p>
                    <strong>Almacenamiento:</strong>{" "}
                    {estadisticas.detallesAdicionales.almacenamiento ?? 0}
                  </p>
                  {Array.isArray(
                    estadisticas.detallesAdicionales.categoriasUnicas
                  ) && (
                    <p>
                      <strong>Categorías únicas:</strong>{" "}
                      {estadisticas.detallesAdicionales.categoriasUnicas.join(
                        ", "
                      )}
                    </p>
                  )}
                  {Array.isArray(
                    estadisticas.detallesAdicionales.rubrosUnicos
                  ) && (
                    <p>
                      <strong>Rubros únicos:</strong>{" "}
                      {estadisticas.detallesAdicionales.rubrosUnicos.join(", ")}
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
      {/* Caso Excel u otros (fallback genérico) */}
      {!mensaje && <pre>{JSON.stringify(resultados, null, 2)}</pre>}
    </div>
  );
};

const ResultadosImagenes = ({ resultados }) => {
  if (!resultados) return null;

  const { mensaje, estadisticas, estadoInicial, detalleResultados } =
    resultados;

  return (
    <div className="resultados">
      <h3>🖼️ Resultados Imágenes</h3>
      {mensaje && (
        <p>
          <strong>{mensaje}</strong>
        </p>
      )}

      {estadisticas && (
        <>
          <h4>📌 Estadísticas</h4>
          <ul>
            <li>Total productos: {estadisticas.totalProductos}</li>
            <li>Procesados: {estadisticas.productosProcesados}</li>
            <li>Ya con imagen: {estadisticas.productosYaConImagen}</li>
            <li>✔️ Exitosos: {estadisticas.resultados.exitosos}</li>
            <li>⚠️ Sin imagen: {estadisticas.resultados.sinImagen}</li>
            <li>
              ❌ Imágenes inválidas: {estadisticas.resultados.imagenesInvalidas}
            </li>
            <li>Errores: {estadisticas.resultados.errores}</li>
          </ul>
        </>
      )}

      {estadoInicial && (
        <>
          <h4>⚙️ Estado inicial</h4>
          <ul>
            <li>Total imágenes: {estadoInicial.totalImagenes}</li>
            <li>Total relaciones: {estadoInicial.totalRelaciones}</li>
            <li>URLs únicas: {estadoInicial.urlsUnicas}</li>
          </ul>
        </>
      )}

      {detalleResultados?.length > 0 && (
        <div className="detalle-productos">
          <h4>📌 Detalle de productos (máx. 15 mostrados)</h4>
          <table className="tabla-resultados">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Estado</th>
                <th>Mensaje</th>
              </tr>
            </thead>
            <tbody>
              {detalleResultados.slice(0, 15).map((item, i) => (
                <tr key={i}>
                  <td>{item.producto}</td>
                  <td>{item.estado}</td>
                  <td>{item.mensaje}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {detalleResultados.length > 15 && (
            <p>⚠️ Mostrando solo los primeros 15 productos...</p>
          )}
        </div>
      )}
    </div>
  );
};

// ================== NUEVO COMPONENTE: MODAL PARA AGREGAR IMAGEN ==================
const ModalAgregarImagen = ({
  producto,
  isOpen,
  onClose,
  onImagenAgregada,
}) => {
  const [urlImagen, setUrlImagen] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!urlImagen.trim()) {
      setMensaje("Por favor ingresa una URL válida");
      return;
    }

    setCargando(true);
    setMensaje("");

    try {
      const response = await axios.post(
        "http://localhost:3000/cargar/imagen-manualmente",
        {
          idProducto: producto.id_producto,
          urlImagen: urlImagen.trim(),
        }
      );

      if (response.data.success) {
        setMensaje(`✅ ${response.data.mensaje}`);
        setTimeout(() => {
          onImagenAgregada(producto.id_producto);
          onClose();
        }, 1500);
      } else {
        setMensaje(`❌ ${response.data.mensaje || "Error al agregar imagen"}`);
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.mensaje || "Error al conectar con el servidor";
      setMensaje(`❌ ${errorMsg}`);
    } finally {
      setCargando(false);
    }
  };

  const handleClose = () => {
    setUrlImagen("");
    setMensaje("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🖼️ Agregar Imagen Manual</h3>
          <button className="btn-close" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="producto-info-modal">
            <p>
              <strong>Producto:</strong> {producto?.nombre}
            </p>
            <p>
              <strong>ID:</strong> {producto?.id_producto}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="urlImagen">URL de la imagen:</label>
              <input
                type="url"
                id="urlImagen"
                value={urlImagen}
                onChange={(e) => setUrlImagen(e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
                disabled={cargando}
                required
                className="input-url"
              />
            </div>

            {mensaje && (
              <div
                className={`mensaje-modal ${
                  mensaje.startsWith("✅") ? "success" : "error"
                }`}
              >
                {mensaje}
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                onClick={handleClose}
                disabled={cargando}
                className="btn btn-cancelar"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={cargando || !urlImagen.trim()}
                className="btn btn-agregar"
              >
                {cargando ? "Agregando..." : "Agregar Imagen"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ================== COMPONENTE: PRODUCTOS SIN IMAGEN (MODIFICADO) ==================
const ProductosSinImagen = ({ datos, onActualizar }) => {
  const [paginaActual, setPaginaActual] = useState(1);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const productosPorPagina = 12;

  if (!datos || !datos.productos || datos.productos.length === 0) {
    return (
      <div className="productos-sin-imagen">
        <div className="resumen-productos">
          <h3>🚫 Productos sin Imagen</h3>
          <p className="total-productos">
            <strong>Resultado:</strong>{" "}
            {datos?.mensaje || "No se encontraron productos"}
          </p>
        </div>
      </div>
    );
  }

  const productos = datos.productos;
  const resumen = datos.resumen;

  // Funciones para el modal
  const abrirModal = (producto) => {
    setProductoSeleccionado(producto);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setProductoSeleccionado(null);
  };

  const handleImagenAgregada = (idProducto) => {
    // Actualizar la lista removiendo el producto que ya tiene imagen
    if (onActualizar) {
      onActualizar(idProducto);
    }
  };

  // Calcular productos para la página actual
  const indiceInicio = (paginaActual - 1) * productosPorPagina;
  const indiceFin = indiceInicio + productosPorPagina;
  const productosActuales = productos.slice(indiceInicio, indiceFin);
  const totalPaginas = Math.ceil(productos.length / productosPorPagina);

  const irAPagina = (numPagina) => {
    setPaginaActual(numPagina);
  };

  const paginaAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual(paginaActual - 1);
    }
  };

  const paginaSiguiente = () => {
    if (paginaActual < totalPaginas) {
      setPaginaActual(paginaActual + 1);
    }
  };

  return (
    <div className="productos-sin-imagen">
      <div className="resumen-productos">
        <h3>🚫 Productos sin Imagen</h3>

        {resumen && (
          <div className="estadisticas-resumen">
            <p className="total-productos">
              <strong>Total productos en sistema:</strong>{" "}
              {resumen.totalProductos}
            </p>
            <p className="total-productos">
              <strong>Productos sin imagen:</strong>{" "}
              {resumen.productosSinImagen}
            </p>
            <p className="total-productos">
              <strong>Porcentaje completado:</strong>{" "}
              {resumen.porcentajeCompletado}%
            </p>
          </div>
        )}

        <p className="total-productos">
          <strong>{datos.mensaje}</strong>
        </p>

        <p className="info-paginacion">
          Página {paginaActual} de {totalPaginas}
          (mostrando {productosActuales.length} de {productos.length})
        </p>
      </div>

      {/* Grid de productos */}
      <div className="grid-productos">
        {productosActuales.map((producto, index) => (
          <div
            key={producto.id_producto || producto.numero || index}
            className="card-producto"
          >
            <div className="producto-header">
              <div className="icono-producto">📦</div>
              <div className="producto-id">ID: {producto.id_producto}</div>
            </div>

            <div className="producto-info">
              <h4 className="producto-nombre" title={producto.nombre}>
                {producto.nombre}
              </h4>

              <div className="producto-detalles">
                <div className="detalle-item">
                  <span className="label">Número:</span>
                  <span className="value">{producto.numero}</span>
                </div>

                <div className="detalle-item">
                  <span className="label">ID Producto:</span>
                  <span className="value">{producto.id_producto}</span>
                </div>

                {producto.codigo && (
                  <div className="detalle-item">
                    <span className="label">Código:</span>
                    <span className="value">{producto.codigo}</span>
                  </div>
                )}

                {producto.categoria && (
                  <div className="detalle-item">
                    <span className="label">Categoría:</span>
                    <span className="value">{producto.categoria}</span>
                  </div>
                )}

                {producto.rubro && (
                  <div className="detalle-item">
                    <span className="label">Rubro:</span>
                    <span className="value">{producto.rubro}</span>
                  </div>
                )}

                {producto.precio && (
                  <div className="detalle-item precio">
                    <span className="label">Precio:</span>
                    <span className="value precio-valor">
                      $
                      {parseFloat(producto.precio).toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* SECCIÓN MODIFICADA: Estado imagen con botón agregar */}
              <div className="estado-imagen">
                <span className="estado-sin-imagen">⚠️ Sin imagen</span>
                <button
                  className="btn btn-agregar-imagen"
                  onClick={() => abrirModal(producto)}
                  title="Agregar imagen manualmente"
                >
                  ➕ Agregar Imagen
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controles de paginación */}
      {totalPaginas > 1 && (
        <div className="paginacion">
          <button
            className="btn-paginacion"
            onClick={paginaAnterior}
            disabled={paginaActual === 1}
          >
            ← Anterior
          </button>

          <div className="numeros-pagina">
            {[...Array(totalPaginas)].map((_, i) => {
              const numPagina = i + 1;
              // Mostrar solo algunas páginas alrededor de la actual
              if (
                numPagina === 1 ||
                numPagina === totalPaginas ||
                (numPagina >= paginaActual - 2 && numPagina <= paginaActual + 2)
              ) {
                return (
                  <button
                    key={numPagina}
                    className={`btn-numero ${
                      numPagina === paginaActual ? "activo" : ""
                    }`}
                    onClick={() => irAPagina(numPagina)}
                  >
                    {numPagina}
                  </button>
                );
              } else if (
                numPagina === paginaActual - 3 ||
                numPagina === paginaActual + 3
              ) {
                return (
                  <span key={numPagina} className="puntos">
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>

          <button
            className="btn-paginacion"
            onClick={paginaSiguiente}
            disabled={paginaActual === totalPaginas}
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* Modal para agregar imagen */}
      <ModalAgregarImagen
        producto={productoSeleccionado}
        isOpen={modalAbierto}
        onClose={cerrarModal}
        onImagenAgregada={handleImagenAgregada}
      />
    </div>
  );
};

// ================== COMPONENTE PRINCIPAL ==================
const CargaProductos = () => {
  const [archivoExcel, setArchivoExcel] = useState(null);
  const [resultadosExcel, setResultadosExcel] = useState(null);
  const [cargandoExcel, setCargandoExcel] = useState(false);

  const [archivoCSV, setArchivoCSV] = useState(null);
  const [resultadosCSV, setResultadosCSV] = useState(null);
  const [cargandoCSV, setCargandoCSV] = useState(false);

  const [resultadosImg, setResultadosImg] = useState(null);
  const [cargandoImg, setCargandoImg] = useState(false);

  const [resultadoBorrado, setResultadoBorrado] = useState(null);
  const [cargandoBorrado, setCargandoBorrado] = useState(false);

  // Estados para productos sin imagen
  const [productosSinImagen, setProductosSinImagen] = useState(null);
  const [cargandoProductosSinImagen, setCargandoProductosSinImagen] =
    useState(false);

  // Handlers existentes
  const handleExcelFileChange = (e) => {
    setArchivoExcel(e.target.files[0]);
    setResultadosExcel(null);
  };

  const handleCSVFileChange = (e) => {
    setArchivoCSV(e.target.files[0]);
    setResultadosCSV(null);
  };

  const handleBorrarProd = async (e) => {
    e.preventDefault();
    setCargandoBorrado(true);
    setResultadoBorrado(null);

    try {
      const response = await axios.post("http://localhost:3000/borrado");
      setResultadoBorrado(response.data);
    } catch (error) {
      setResultadoBorrado({
        success: false,
        mensaje: "❌ Error al conectar con el servidor",
      });
    } finally {
      setCargandoBorrado(false);
    }
  };

  const handleExcelSubmit = async (e) => {
    e.preventDefault();
    if (!archivoExcel) return;

    const extension = archivoExcel.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls"].includes(extension)) {
      alert("Solo se permiten archivos Excel (.xlsx, .xls)");
      return;
    }

    const formData = new FormData();
    formData.append("archivo_excel", archivoExcel);

    setCargandoExcel(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/renovar-modex/cargar-articulos",
        formData
      );
      setResultadosExcel(response.data);
    } catch (error) {
      setResultadosExcel({ error: "Error en la conexión con el servidor" });
    } finally {
      setCargandoExcel(false);
    }
  };

  const handleCSVSubmit = async (e) => {
    e.preventDefault();
    if (!archivoCSV) return;

    const extension = archivoCSV.name.split(".").pop().toLowerCase();
    if (extension !== "csv") {
      alert("Solo se permiten archivos CSV");
      return;
    }

    const formData = new FormData();
    formData.append("archivo_csv", archivoCSV);

    setCargandoCSV(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/renovar/cargar-productos",
        formData
      );
      setResultadosCSV(response.data);
    } catch (error) {
      setResultadosCSV({ error: "Error en la conexión con el servidor" });
    } finally {
      setCargandoCSV(false);
    }
  };

  const handleCargarImagenes = async () => {
    setCargandoImg(true);
    setResultadosImg(null);

    try {
      const response = await axios.post(
        "http://localhost:3000/cargar/imagenes"
      );
      setResultadosImg(response.data);
    } catch (error) {
      setResultadosImg({
        success: false,
        error: "Error al conectar con el servidor",
      });
    } finally {
      setCargandoImg(false);
    }
  };

  // Handler para obtener productos sin imagen
  const handleObtenerProductosSinImagen = async () => {
    setCargandoProductosSinImagen(true);
    setProductosSinImagen(null);

    try {
      const response = await axios.get(
        "http://localhost:3000/cargar/productos-sin-imagen"
      );

      // Adaptamos a la estructura de respuesta real de la API
      if (
        response.data.success &&
        response.data.datos &&
        response.data.datos.productosSinImagen
      ) {
        setProductosSinImagen({
          productos: response.data.datos.productosSinImagen,
          resumen: response.data.datos.resumen,
          mensaje: response.data.mensaje,
        });
      } else {
        setProductosSinImagen({
          productos: [],
          resumen: null,
          mensaje: "No se encontraron productos sin imagen",
        });
      }
    } catch (error) {
      console.error("Error al obtener productos sin imagen:", error);
      setProductosSinImagen({
        productos: [],
        resumen: null,
        mensaje: "Error al conectar con el servidor",
      });
    } finally {
      setCargandoProductosSinImagen(false);
    }
  };

  // NUEVA FUNCIÓN: Handler para actualizar lista cuando se agrega imagen
  const handleActualizarListaProductos = (idProductoAgregado) => {
    if (productosSinImagen && productosSinImagen.productos) {
      const productosActualizados = productosSinImagen.productos.filter(
        (p) => p.id_producto !== idProductoAgregado
      );

      const resumenActualizado = {
        ...productosSinImagen.resumen,
        productosSinImagen: productosActualizados.length,
        totalProductos: productosSinImagen.resumen.totalProductos,
        porcentajeCompletado: (
          ((productosSinImagen.resumen.totalProductos -
            productosActualizados.length) /
            productosSinImagen.resumen.totalProductos) *
          100
        ).toFixed(1),
      };

      setProductosSinImagen({
        ...productosSinImagen,
        productos: productosActualizados,
        resumen: resumenActualizado,
        mensaje:
          productosActualizados.length > 0
            ? `Se encontraron ${productosActualizados.length} productos que NO tienen imagen asignada`
            : "✅ Todos los productos ya tienen imagen asignada",
      });
    }
  };

  return (
    <div className="contenedor-principal">
      <h1 className="titulo-app">Sistema de Carga Masiva de Productos</h1>

      {/* Excel */}
      <div className="card">
        <h2 className="titulo-seccion">Carga de Artículos Modex (Excel)</h2>
        <form onSubmit={handleExcelSubmit} className="formulario">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleExcelFileChange}
            disabled={cargandoExcel}
            className="input-file"
          />
          <button
            type="submit"
            disabled={!archivoExcel || cargandoExcel}
            className="btn btn-azul"
          >
            {cargandoExcel ? "Procesando..." : "Cargar Artículos Modex"}
          </button>
        </form>
        {resultadosExcel && (
          <ResultadosGenericos
            titulo="📊 Resultados Excel"
            resultados={resultadosExcel}
          />
        )}
      </div>

      {/* CSV */}
      <div className="card">
        <h2 className="titulo-seccion">Carga de Productos AIR (CSV)</h2>
        <form onSubmit={handleCSVSubmit} className="formulario">
          <input
            type="file"
            accept=".csv"
            onChange={handleCSVFileChange}
            disabled={cargandoCSV}
            className="input-file"
          />
          <button
            type="submit"
            disabled={!archivoCSV || cargandoCSV}
            className="btn btn-verde"
          >
            {cargandoCSV ? "Procesando..." : "Cargar Productos AIR"}
          </button>
        </form>
        {resultadosCSV && (
          <ResultadosGenericos
            titulo="📊 Resultados CSV"
            resultados={resultadosCSV}
          />
        )}
      </div>

      {/* Imágenes */}
      <div className="card">
        <h2 className="titulo-seccion">Gestión de Imágenes</h2>
        <button
          onClick={handleCargarImagenes}
          disabled={cargandoImg}
          className="btn btn-morado"
        >
          {cargandoImg ? "Procesando..." : "Cargar Imágenes Automáticamente"}
        </button>
        {resultadosImg && <ResultadosImagenes resultados={resultadosImg} />}
      </div>

      {/* SECCIÓN: Productos sin imagen (MODIFICADA) */}
      <div className="card">
        <h2 className="titulo-seccion">Consulta de Productos sin Imagen</h2>
        <button
          onClick={handleObtenerProductosSinImagen}
          disabled={cargandoProductosSinImagen}
          className="btn btn-naranja"
        >
          {cargandoProductosSinImagen
            ? "Consultando..."
            : "Ver Productos sin Imagen"}
        </button>
        {productosSinImagen && (
          <ProductosSinImagen
            datos={productosSinImagen}
            onActualizar={handleActualizarListaProductos}
          />
        )}
      </div>

      {/* BorradoDeImagenes */}
      <div className="card">
        <h2 className="titulo-seccion">
          Eliminado de productos y relacionados
        </h2>
        <form onSubmit={handleBorrarProd} className="formulario">
          <button
            type="submit"
            className="btn btn-azul"
            disabled={cargandoBorrado}
          >
            {cargandoBorrado ? "Eliminando..." : "Eliminar todo"}
          </button>
        </form>

        {/* Mostrar resultado del borrado */}
        {resultadoBorrado && (
          <div
            className={`mensaje-borrado ${
              resultadoBorrado.success ? "ok" : "error"
            }`}
          >
            <p>{resultadoBorrado.mensaje}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CargaProductos;
