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

  // Handlers
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

  return (
    <div className="contenedor-principal">
      <h1 className="titulo-app">Sistema de Carga Masiva de Productos</h1>

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
    </div>
  );
};

export default CargaProductos;
