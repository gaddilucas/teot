import { estado } from '../estado.js';
import { $, esc, num, ars, fechaCorta } from '../utils.js';

const ETIQUETA = {alta: 'Alta', entrada: 'Suma', salida: 'Resta', venta: 'Venta'};

export function renderMovimientos(){
  $('#lista-mov').innerHTML = estado.movimientos.length
    ? estado.movimientos.slice(0, 30).map(m => `<li>
        <span>${esc(fechaCorta(m.fecha))} · ${esc(ETIQUETA[m.tipo] || m.tipo)} · ${esc(m.nombre)} × ${num(m.cantidad)}</span>
        <span>${m.tipo === 'venta' ? ars.format(num(m.total)) : ''}</span>
      </li>`).join('')
    : '<li class="vacio">Sin movimientos todavía.</li>';
}
