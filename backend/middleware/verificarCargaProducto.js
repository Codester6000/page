export const normalize = (str) =>
  str
    ?.toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, "")
    .trim()
    .toLowerCase();

export const cellToString = (val) => {
  if (val === null || val === undefined) return "";
  if (typeof val === "object") {
    if (Array.isArray(val.richText))
      return val.richText.map((t) => t.text ?? "").join("");
    if (val.text != null) return String(val.text);
    if (val.result != null) return String(val.result);
    if (val.hyperlink && val.text) return String(val.text);
    if (val instanceof Date) return val.toISOString();
    try {
      return String(val.toString ? val.toString() : "");
    } catch {
      return "";
    }
  }
  return String(val);
};

export const parseNum = (value) => {
  if (value === null || value === undefined) return NaN;
  if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
  const s = cellToString(value).trim();
  if (!s) return NaN;
  const cleaned = s.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : NaN;
};

export const pickCodigoFabricante = (vals) => {
  for (const v of vals) {
    const s = cellToString(v).trim();
    if (s) return s;
  }
  return null;
};

export const wanted = {
  id: ["id"],
  codInt: ["codint", "codigo interno", "part number", "cod.int."],
  codBarras: ["codbarras", "codigo de barras", "cod.barras"],
  producto: ["producto", "descripcion", "nombre"],
  p: ["stock", "cantidad", "cba", "lug", "p"],
  marca: ["marca"],
  categoria: ["categoria", "rubro"],
  iva: ["iva", "alicuota"],
  moneda: ["moneda"],
  costo: ["costo", "precio compra", "lista4"],
};
