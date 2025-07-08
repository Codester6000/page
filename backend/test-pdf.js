// test-pdf.js
import fs from 'fs';
import PDFDocument from 'pdfkit';

const doc = new PDFDocument();
const stream = fs.createWriteStream('test-pdf.pdf');

doc.pipe(stream);
doc.fontSize(25).text('¡Hola! Este es un PDF de prueba generado con PDFKit.', 100, 100);
doc.end();

stream.on('close', () => {
  console.log('✅ PDF de prueba generado correctamente');
});

stream.on('error', (err) => {
  console.error('❌ Error generando PDF:', err);
});
