import { estado } from '../estado.js';
import { $, ars, esc, num, conBloqueo } from '../utils.js';
import { urlFoto } from '../config.js';
import { ajustar, guardarPrecios, pedirEliminar, cambiarFoto } from './stock-acciones.js';

export function renderStock(){
  $('#tabla-stock').innerHTML = estado.productos.length
    ? estado.productos.map(filaProducto).join('')
    : '<p class="vacio">Todavía no hay productos. Cargá el primero arriba.</p>';
}

function filaProducto(p){
  return `<div class="fila">
    <div class="info"><strong>${esc(p.nombre)}</strong><span>${ars.format(num(p.precio))} · stock: <b>${num(p.stock)}</b></span></div>
    <div class="precios">
      <label>Costo $ <input type="number" min="0" step="0.01" data-costo="${esc(p.id)}" value="${num(p.costo)}"></label>
      <label>Precio $ <input type="number" min="0" step="0.01" data-precio="${esc(p.id)}" value="${num(p.precio)}"></label>
      <button class="btn" data-accion="precios" data-id="${esc(p.id)}">Guardar precios</button>
    </div>
    <div class="ctl">
      ${p.imagen_path ? `<img class="miniatura" src="${esc(urlFoto(p.imagen_path))}" alt="">` : ''}
      <label class="btn">Foto<input type="file" accept="image/*" class="archivo" data-foto="${esc(p.id)}"></label>
      <input class="num" type="number" min="1" step="1" data-cant="${esc(p.id)}" value="${esc(estado.cantidades[p.id] ?? 1)}" aria-label="Cantidad">
      <button class="btn" data-accion="entrada" data-id="${esc(p.id)}">Sumar stock</button>
      <button class="btn" data-accion="salida" data-id="${esc(p.id)}">Restar stock</button>
      <button class="btn primario" data-accion="venta" data-id="${esc(p.id)}">Vender</button>
      <button class="btn borrar" data-accion="eliminar" data-id="${esc(p.id)}">Eliminar</button>
    </div>
  </div>`;
}

export function initStock(){
  const tabla = $('#tabla-stock');

  tabla.addEventListener('input', e => {
    const i = e.target.closest('input[data-cant]');
    if (i) estado.cantidades[i.dataset.cant] = i.value;
  });

  tabla.addEventListener('click', e => {
    const b = e.target.closest('button[data-accion]');
    if (!b) return;
    if (b.dataset.accion === 'precios') conBloqueo(() => guardarPrecios(b));
    else if (b.dataset.accion === 'eliminar') pedirEliminar(b);
    else conBloqueo(() => ajustar(b.dataset.id, b.dataset.accion));
  });

  tabla.addEventListener('change', e => {
    const inp = e.target.closest('input[data-foto]');
    if (!inp || !inp.files[0]) return;
    const archivo = inp.files[0];
    inp.value = '';
    conBloqueo(() => cambiarFoto(inp.dataset.foto, archivo));
  });
}
