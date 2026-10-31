import { num } from '../utils.js';

export const mesVacio = () => ({ventas: 0, costo: 0, compras: 0, unidades: 0, productos: {}});

// Agrupa los movimientos por mes. Ventas y costo salen de los datos guardados
// en cada movimiento, así un cambio de precio no altera los meses pasados.
export function finanzasPorMes(movimientos){
  const meses = {};
  for (const m of movimientos){
    const d = new Date(m.fecha);
    if (isNaN(d)) continue;
    const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    if (!meses[k]) meses[k] = mesVacio();
    const mes = meses[k];
    const cant = num(m.cantidad), costo = num(m.costo);

    if (m.tipo === 'venta'){
      const ventas = num(m.total), costoTotal = cant * costo;
      mes.ventas += ventas;
      mes.costo += costoTotal;
      mes.unidades += cant;
      const nombre = String(m.nombre);
      if (!mes.productos[nombre]) mes.productos[nombre] = {unidades: 0, ventas: 0, costo: 0};
      const f = mes.productos[nombre];
      f.unidades += cant;
      f.ventas += ventas;
      f.costo += costoTotal;
    } else if (m.tipo === 'entrada' || m.tipo === 'alta'){
      mes.compras += cant * costo;
    }
  }
  return meses;
}
