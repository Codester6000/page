import jsPDF from "jspdf";

/**
 * Genera y descarga un PDF con los datos del mantenimiento.
 * @param {Object} params
 */
export function generarFichaMantenimiento({ numero, cliente, producto, fecha, tipo, detalles }) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(`Ficha de Mantenimiento - Nº ${numero}`, 20, 20);
  doc.setFontSize(12);
  doc.text(`Fecha: ${fecha}`, 20, 30);
  doc.text(`DNI Cliente: ${cliente}`, 20, 40);
  doc.text(`Producto: ${producto}`, 20, 50);
  doc.text(`Tipo: ${tipo}`, 20, 60);

  let y = 70;
  for (const [clave, valor] of Object.entries(detalles)) {
    const label = clave.replace(/_/g, " ").replace(/^\w/, (l) => l.toUpperCase());
    doc.text(`${label}: ${valor}`, 20, y);
    y += 10;
  }

  doc.save(`Ficha-${numero}.pdf`);
}
