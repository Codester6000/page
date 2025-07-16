import jsPDF from "jspdf";

/**
 * Genera y descarga una ficha de mantenimiento completa.
 * @param {Object} params
 */
export function generarFichaMantenimiento({
  numero,
  fecha,
  clienteDNI,
  clienteNombre,
  responsable,
  telefono,
  direccion,
  mail,
  producto,
  estado,
  fecha_inicio,
  descripcion,
  observaciones,
}) {
  const doc = new jsPDF();
  const x = 20;
  let y = 20;

  // Header
  doc.setFontSize(16).setFont("helvetica", "bold");
  doc.text("HOJA MANTENIMIENTO", x, y);
  y += 10;
  doc.text("FICHA SERVICIO TÉCNICO", x, y);
  y += 10;

  // Datos superiores
  doc.setFontSize(12).setFont("helvetica", "normal");
  doc.text(`FECHA: ${fecha}`, x, y);
  y += 7;
  doc.text("ABEL BAZÁN Y BUSTOS 600", x, y);
  y += 7;
  doc.text(`NÚMERO DE FICHA: ${numero}`, x, y);
  y += 7;
  doc.text("WHATSAPP: 3804 353826", x, y);
  y += 10;

  // Sección cliente y responsable
  doc.setFont("helvetica", "bold");
  doc.text("RECEPCIÓN DE EQUIPO", x, y);
  y += 10;
  doc.setFont("helvetica", "normal");
  doc.text("DATOS CLIENTE", x, y);
  doc.text("DATOS GENERALES", x + 90, y);
  y += 7;

  doc.text(`Nombre: ${clienteNombre}`, x, y);
  doc.text(`Responsable del trabajo: ${responsable}`, x + 90, y);
  y += 7;
  doc.text(`DNI: ${clienteDNI}`, x, y);
  y += 7;
  doc.text(`Dirección: ${direccion}`, x, y);
  doc.text(`Teléfono: ${telefono}`, x + 90, y);
  y += 7;
  doc.text(`Email: ${mail}`, x, y);
  y += 10;

  // Producto
  doc.setFont("helvetica", "bold");
  doc.text("Producto Ingresado", x, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.text(`Tipo: ${producto}`, x, y);
  y += 7;
  doc.text(`Estado: ${estado}`, x, y);
  y += 7;
  doc.text(`Fecha de inicio: ${fecha_inicio}`, x, y);
  y += 10;

  // Descripción del producto
  doc.setFont("helvetica", "bold");
  doc.text("Descripción del Producto", x, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  const descripcionLineas = doc.splitTextToSize(descripcion, 170);
  doc.text(descripcionLineas, x, y);
  y += descripcionLineas.length * 6 + 4;

  // Observaciones
  doc.setFont("helvetica", "bold");
  doc.text("Observaciones / Falla que presenta", x, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  const obsLineas = doc.splitTextToSize(observaciones, 170);
  doc.text(obsLineas, x, y);
  y += obsLineas.length * 6 + 10;

  // Firmas
  y += 20;
  doc.text("FIRMA CLIENTE", x, y);
  doc.text("FIRMA RECEPCION", x + 100, y);

  doc.save(`Ficha-${numero}.pdf`);
}
