import { tituloDeClave } from './meses.js';

// Valor de celda CSV: se entrecomilla si tiene separador, comillas o saltos de línea
export function csvCelda(v){
  const s = String(v ?? '');
  return /[;"\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

// Número en formato argentino: 1500,50
export const nAR = v => Number(v).toFixed(2).replace('.', ',');

export function csvFinanzas(clave, m){
  const ganancia = m.ventas - m.costo;
  const margen = m.ventas > 0 ? (ganancia / m.ventas) * 100 : 0;
  const filas = [
    ['Mes', tituloDeClave(clave)],
    [],
    ['Concepto', 'Monto'],
    ['Ventas', nAR(m.ventas)],
    ['Costo de lo vendido', nAR(m.costo)],
    ['Ganancia bruta', nAR(ganancia)],
    ['Margen (%)', nAR(margen)],
    ['Compras de stock', nAR(m.compras)],
    ['Unidades vendidas', m.unidades],
    [],
    ['Producto', 'Unidades', 'Ventas', 'Costo', 'Ganancia'],
    ...Object.entries(m.productos).map(([nombre, f]) =>
      [nombre, f.unidades, nAR(f.ventas), nAR(f.costo), nAR(f.ventas - f.costo)]),
  ];
  // BOM para que Excel reconozca los acentos
  return '\uFEFF' + filas.map(r => r.map(csvCelda).join(';')).join('\r\n');
}

// Descarga el archivo desde el navegador
export function descargarCsv(nombre, contenido){
  const blob = new Blob([contenido], {type: 'text/csv;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
