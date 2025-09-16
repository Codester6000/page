import { useState } from "react";
import axios from "axios";

const CargaProductos = () => {
  const [archivo, setArchivo] = useState(null);
  const [resultados, setResultados] = useState([]);
  const [errores, setErrores] = useState([]);
  const [cargando, setCargando] = useState(false);

  // Estados para el formulario CSV
  const [archivoCSV, setArchivoCSV] = useState(null);
  const [resultadosCSV, setResultadosCSV] = useState([]);
  const [erroresCSV, setErroresCSV] = useState([]);
  const [cargandoCSV, setCargandoCSV] = useState(false);

  // Estados para la carga de imágenes
  const [resultadosImg, setResultadosImg] = useState([]);
  const [cargandoImg, setCargandoImg] = useState(false);
  const [estadoImagenes, setEstadoImagenes] = useState(null);

  const handleFileChange = (e) => {
    setArchivo(e.target.files[0]);
  };

  const handleCSVFileChange = (e) => {
    setArchivoCSV(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!archivo) return;

    const extension = archivo.name.split(".").pop().toLowerCase();
    const formatosPermitidos = ["xlsx", "xls"];

    if (!formatosPermitidos.includes(extension)) {
      alert("solo archivos de excel");
      return;
    }
    const formData = new FormData();
    formData.append("archivo_excel", archivo);

    setCargando(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/renovar-modex/cargar-articulos",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResultados(response.data.resultados || []);
      setErrores(response.data.errores || []);
    } catch (error) {
      console.error("Error:", error);
      setErrores([{ error: "Error en la conexión con el servidor" }]);
    } finally {
      setCargando(false);
    }
  };

  const handleCSVSubmit = async (e) => {
    e.preventDefault();
    if (!archivoCSV) return;

    const extension = archivoCSV.name.split(".").pop().toLowerCase();
    if (extension !== "csv") {
      alert("solo archivos CSV");
      return;
    }
    const formData = new FormData();
    formData.append("archivo_csv", archivoCSV);

    setCargandoCSV(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/renovar/cargar-productos",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResultadosCSV(response.data.resultados || []);
      setErroresCSV(response.data.errores || []);
    } catch (error) {
      console.error("Error:", error);
      setErroresCSV([{ error: "Error en la conexión con el servidor" }]);
    } finally {
      setCargandoCSV(false);
    }
  };

  // Función para cargar imágenes automáticamente
  const handleCargarImagenes = async () => {
    setCargandoImg(true);
    setResultadosImg([]);

    try {
      console.log("Iniciando carga de imágenes...");

      const response = await axios.post(
        "http://localhost:3000/cargar/imagenes"
      );

      console.log("Respuesta del servidor:", response.data);

      setResultadosImg(response.data.resultados || []);

      // Mostrar un resumen del proceso
      if (response.data.message) {
        alert(
          `${response.data.message}\nExitosos: ${
            response.data.exitosos || 0
          }\nErrores: ${response.data.errores || 0}`
        );
      }
    } catch (error) {
      console.error("Error:", error);
      setResultadosImg([
        {
          producto: "Error del sistema",
          error: "Error al cargar imágenes desde el servidor",
          estado: "error",
        },
      ]);
      alert("Error al conectar con el servidor");
    } finally {
      setCargandoImg(false);
    }
  };

  // Función para obtener estadísticas de imágenes
  const handleVerEstadoImagenes = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/cargar-imagenes/estado-imagenes"
      );
      setEstadoImagenes(response.data);
    } catch (error) {
      console.error("Error obteniendo estado:", error);
      alert("Error al obtener estadísticas");
    }
  };

  // Función para reintentar un producto específico
  const handleReintentarProducto = async (idProducto) => {
    if (!idProducto) return;

    try {
      const response = await axios.post(
        "http://localhost:3000/cargar-imagenes/reintentar-producto",
        { idProducto: parseInt(idProducto) }
      );

      if (response.data.success) {
        alert(`Imagen cargada exitosamente para: ${response.data.producto}`);
        // Actualizar resultados
        handleCargarImagenes();
      } else {
        alert(`Error: ${response.data.error}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al reintentar producto");
    }
  };

  return (
    <div className="container">
      <h1>Carga Masiva de Productos</h1>

      {/* Formulario Excel */}
      <form onSubmit={handleSubmit}>
        <div className="file-input">
          <label htmlFor="excel-file">Seleccionar archivo excel:</label>
          <input
            type="file"
            id="excel-file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            disabled={cargando}
          />
        </div>

        <button
          type="submit"
          disabled={!archivo || cargando}
          className={cargando ? "loading" : ""}
        >
          {cargando ? "Procesando..." : "Cargar Productos"}
        </button>
      </form>

      {resultados.length > 0 && <ResultadosSection resultados={resultados} />}
      {errores.length > 0 && <ErroresSection errores={errores} />}

      <hr />

      <h1>Carga Masiva de Artículos (CSV)</h1>

      {/* Formulario CSV */}
      <form onSubmit={handleCSVSubmit}>
        <div className="file-input">
          <label htmlFor="csv-file">Seleccionar archivo CSV:</label>
          <input
            type="file"
            id="csv-file"
            accept=".csv"
            onChange={handleCSVFileChange}
            disabled={cargandoCSV}
          />
        </div>

        <button
          type="submit"
          disabled={!archivoCSV || cargandoCSV}
          className={cargandoCSV ? "loading" : ""}
        >
          {cargandoCSV ? "Procesando..." : "Cargar Artículos"}
        </button>
      </form>

      {resultadosCSV.length > 0 && (
        <ResultadosSection resultados={resultadosCSV} />
      )}
      {erroresCSV.length > 0 && <ErroresSection errores={erroresCSV} />}

      <hr />

      {/* Sección de Carga de Imágenes */}
      <h1>Carga Automática de Imágenes</h1>

      <div className="imagenes-section">
        <div className="botones-imagenes">
          <button
            onClick={handleCargarImagenes}
            disabled={cargandoImg}
            className="btn-primary"
          >
            {cargandoImg
              ? "🔄 Buscando imágenes..."
              : "🖼️ Cargar Imágenes Automáticamente"}
          </button>

          <button onClick={handleVerEstadoImagenes} className="btn-secondary">
            📊 Ver Estado de Imágenes
          </button>
        </div>

        {/* Mostrar estadísticas */}
        {estadoImagenes && (
          <div className="estado-imagenes">
            <h3>📈 Estadísticas de Imágenes</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Total productos:</span>
                <span className="stat-value">
                  {estadoImagenes.total_productos}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Con imagen:</span>
                <span className="stat-value success">
                  {estadoImagenes.con_imagen}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Sin imagen:</span>
                <span className="stat-value error">
                  {estadoImagenes.sin_imagen}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Mostrar resultados de la carga */}
        {resultadosImg.length > 0 && (
          <div className="resultados-imagenes">
            <h3>🖼️ Resultados del Procesamiento</h3>
            <div className="resultados-lista">
              {resultadosImg.map((item, index) => (
                <div
                  key={index}
                  className={`resultado-item ${
                    item.estado === "exitoso" ? "success" : "error"
                  }`}
                >
                  <div className="resultado-contenido">
                    {item.estado === "exitoso" ? (
                      <>
                        <span className="icono">✅</span>
                        <span className="producto">{item.producto}</span>
                        <span className="url">{item.imagen}</span>
                      </>
                    ) : (
                      <>
                        <span className="icono">❌</span>
                        <span className="producto">{item.producto}</span>
                        <span className="error-msg">{item.error}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sección para reintentar producto específico */}
        <div className="reintentar-section">
          <h3>🔄 Reintentar Producto Específico</h3>
          <div className="reintentar-form">
            <input
              type="number"
              placeholder="ID del producto"
              id="reintentar-input"
              className="reintentar-input"
            />
            <button
              onClick={() => {
                const id = document.getElementById("reintentar-input").value;
                if (id) handleReintentarProducto(id);
              }}
              className="btn-retry"
            >
              🔄 Reintentar
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .imagenes-section {
          margin-top: 20px;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background-color: #f9f9f9;
        }

        .botones-imagenes {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .btn-primary {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
        }

        .btn-primary:hover {
          background-color: #0056b3;
        }

        .btn-primary:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }

        .btn-secondary {
          background-color: #6c757d;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
        }

        .btn-retry {
          background-color: #ffc107;
          color: black;
          border: none;
          padding: 8px 15px;
          border-radius: 3px;
          cursor: pointer;
        }

        .estado-imagenes {
          background-color: white;
          padding: 15px;
          border-radius: 5px;
          margin: 15px 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-top: 10px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px;
          background-color: #f8f9fa;
          border-radius: 5px;
        }

        .stat-label {
          font-size: 14px;
          color: #666;
        }

        .stat-value {
          font-size: 24px;
          font-weight: bold;
        }

        .stat-value.success {
          color: #28a745;
        }

        .stat-value.error {
          color: #dc3545;
        }

        .resultados-imagenes {
          margin-top: 20px;
        }

        .resultados-lista {
          max-height: 400px;
          overflow-y: auto;
          border: 1px solid #ddd;
          border-radius: 5px;
          background-color: white;
        }

        .resultado-item {
          padding: 10px;
          border-bottom: 1px solid #eee;
        }

        .resultado-item.success {
          background-color: #d4edda;
        }

        .resultado-item.error {
          background-color: #f8d7da;
        }

        .resultado-contenido {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .producto {
          font-weight: bold;
          min-width: 200px;
        }

        .url {
          font-size: 12px;
          color: #666;
          word-break: break-all;
        }

        .error-msg {
          color: #721c24;
          font-style: italic;
        }

        .reintentar-section {
          margin-top: 20px;
          padding: 15px;
          background-color: white;
          border-radius: 5px;
        }

        .reintentar-form {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .reintentar-input {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 3px;
          width: 150px;
        }
      `}</style>
    </div>
  );
};

// Componente para mostrar resultados
const ResultadosSection = ({ resultados }) => (
  <div className="resultados">
    <h2>Elementos Cargados Correctamente</h2>
    <ul>
      {resultados.map((item, index) => (
        <li key={index} className="success">
          ✓ {item.nombre}
        </li>
      ))}
    </ul>
  </div>
);

// Componente para mostrar errores
const ErroresSection = ({ errores }) => (
  <div className="errores">
    <h2>Errores en la Carga</h2>
    <ul>
      {errores.map((error, index) => (
        <li key={index} className="error">
          {error.nombre ? `[${error.nombre}]: ${error.error}` : error.error}
        </li>
      ))}
    </ul>
  </div>
);

export default CargaProductos;
