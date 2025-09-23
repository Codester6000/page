import Usuario from "./recursos/userAdmin.js";

const ejecutarInicializacionAdmin = async () => {
  try {
    console.log("Iniciando verificación del sistema de usuarios...");

    // 1. Inicializar roles básicos del sistema
    await Usuario.inicializarRoles();

    const countAdmins = await Usuario.contarAdmins();

    if (countAdmins === 0) {
      console.log("No se encontraron administradores en el sistema");
      console.log("Creando usuario administrador por defecto...");

      const adminCreado = await Usuario.crearAdmin();

      if (adminCreado) {
        console.log(
          " Sistema inicializado correctamente con usuario administrador"
        );

        const adminInfo = await Usuario.obtenerUsuarioCompleto(
          process.env.USERNAME_ADMIN || "admin"
        );

        if (adminInfo) {
          console.log("Información del administrador:", {
            username: adminInfo.username,
            email: adminInfo.email,
            rol: adminInfo.nombre_rol,
            nombre_completo: `${adminInfo.nombre} ${adminInfo.apellido}`,
          });
        }
      } else {
        console.log(
          "No se pudo crear el administrador (puede que ya exista con otro nombre)"
        );
      }
    } else {
      console.log(
        ` Sistema ya inicializado - Se encontraron ${countAdmins} administrador(es)`
      );
    }
  } catch (error) {
    console.error(
      "Error durante la inicialización del sistema:",
      error.message
    );
    throw error;
  }
};

export default ejecutarInicializacionAdmin;
