module.exports = {
  apps: [
    {
      // --- Aplicación del Backend (API) ---
      name: 'modex-backend',
      script: 'app.js', // El script principal de tu backend
      cwd: '/home/page/backend', // Directorio de trabajo
      watch: false, // Desactivar el watch en producción
      // Cargar variables de entorno del archivo .env
      node_args: '--env-file=.env', 
      env: {
        NODE_ENV: 'production',
        PORT: 3000, // Puerto de escucha interno del backend
      },
    },
    {
      // --- Servidor para el Frontend (Archivos Estáticos) ---
      name: 'modex-frontend-serve',
      script: 'serve', // PM2 utiliza un servidor estático interno 'serve'
      cwd: '/home/page/frontend', // Directorio donde está la carpeta 'dist'
      env: {
        PM2_SERVE_PATH: 'dist', // La carpeta que se va a servir
        PM2_SERVE_PORT: 8080,   // Puerto de escucha interno del frontend
        PM2_SERVE_SPA: 'true',  // Necesario para el routing de React
      },
    },
  ],
};
