import { estado } from '../estado.js';
import { $, ars, esc, toast } from '../utils.js';
import { ultimosMeses, tituloDeClave } from './meses.js';
import { finanzasPorMes, mesVacio } from './calculo.js';
import { csvFinanzas, descargarCsv } from './csv.js';

export function renderFinanzas(){
  const opciones = ultimosMeses(12);
  if (!estado.mesSeleccionado || !opciones.some(o => o.k === estado.mesSeleccionado)){
    estado.mesSeleccionado = opciones[0].k;
  }
  const meses = finanzasPorMes(estado.movimientos);
  const sinDatos = !meses[estado.mesSeleccionado];
  const m = meses[estado.mesSeleccionado] || mesVacio();
  const ganancia = m.ventas - m.costo;
  const margen = m.ventas > 0 ? (ganancia / m.ventas) * 100 : 0;
  const filas = Object.entries(m.productos)
    .sort((a, b) => (b[1].ventas - b[1].costo) - (a[1].ventas - a[1].costo));

  $('#finanzas').innerHTML = `
    <div class="barra-fin">
      <label>Mes
        <select id="mes-sel">${opciones.map(o =>
          `<option value="${esc(o.k)}" ${o.k === estado.mesSeleccionado ? 'selected' : ''}>${esc(o.titulo)}</option>`).join('')}</select>
      </label>
      <button id="descargar-fin" class="btn primario">Descargar CSV</button>
    </div>
    <article class="mes">
      <header class="cab">
        <h3>${esc(tituloDeClave(estado.mesSeleccionado))}</h3>
        <span>${m.unidades} unidades vendidas</span>
      </header>
      ${sinDatos ? '<p class="vacio">Todavía no hay movimientos en este mes.</p>' : ''}
      <dl class="cifras">
        <div><dt>Ventas</dt><dd>${ars.format(m.ventas)}</dd></div>
        <div><dt>Costo de lo vendido</dt><dd>${ars.format(m.costo)}</dd></div>
        <div class="destacado"><dt>Ganancia bruta</dt><dd class="${ganancia < 0 ? 'neg' : ''}">${ars.format(ganancia)}</dd></div>
        <div><dt>Margen</dt><dd>${margen.toFixed(1)}%</dd></div>
        <div><dt>Compras de stock</dt><dd>${ars.format(m.compras)}</dd></div>
      </dl>
      <details>
        <summary>Ganancia por producto</summary>
        <ul class="por-producto">${filas.length
          ? filas.map(([nombre, f]) =>
              `<li><span>${esc(nombre)} × ${f.unidades}</span><span>${ars.format(f.ventas - f.costo)}</span></li>`).join('')
          : '<li class="vacio">Sin ventas este mes.</li>'}</ul>
      </details>
    </article>`;
}

export function initFinanzas(){
  $('#finanzas').addEventListener('change', e => {
    if (e.target.id !== 'mes-sel') return;
    estado.mesSeleccionado = e.target.value;
    renderFinanzas();
  });

  $('#finanzas').addEventListener('click', e => {
    if (!e.target.closest('#descargar-fin')) return;
    const m = finanzasPorMes(estado.movimientos)[estado.mesSeleccionado] || mesVacio();
    descargarCsv(`finanzas-${estado.mesSeleccionado}.csv`, csvFinanzas(estado.mesSeleccionado, m));
    toast('Finanzas descargadas.');
  });
}
