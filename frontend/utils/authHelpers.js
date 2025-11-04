export const esAdmin = (sesion) => {
  if (!sesion) return false;
  return (
    sesion.rol === "admin" ||
    sesion.rol === "subadmin" ||
    sesion.rol === 2 ||
    sesion.rol === 4
  );
};

export const esSuperAdmin = (sesion) => {
  if (!sesion) return false;
  return sesion.rol === 2;
};

export const esSubAdmin = (sesion) => {
  if (!sesion) return false;
  return sesion.rol === 4;
};

export const esEmpleado = (sesion) => {
  if (!sesion) return false;
  return sesion.rol === 1;
};

export const esCliente = (sesion) => {
  if (!sesion) return false;
  return sesion.rol === 3;
};

export const tieneRol = (sesion, roles) => {
  if (!sesion) return false;
  const rolesPermitidos = Array.isArray(roles) ? roles : [roles];
  return rolesPermitidos.includes(sesion.rol);
};
