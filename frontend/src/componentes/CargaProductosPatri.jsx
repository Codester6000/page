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
        "http://localhost:3000/renovar/cargar-productos",
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
        "http://localhost:3000/renovar-modex/cargar-articulos",
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
