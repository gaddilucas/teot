import { sb } from '../supabase.js';
import { estado } from '../estado.js';
import { $, esc, errorMsg, toast, conBloqueo, pedirConfirmacion } from '../utils.js';

// Opciones de categoría para cualquier selector. actual = id de la categoría o null
export function opcionesCategorias(actual){
  const sin = `<option value="" ${!actual ? 'selected' : ''}>Sin categoría</option>`;
  return sin + estado.categorias.map(c =>
    `<option value="${esc(c.id)}" ${c.id === actual ? 'selected' : ''}>${esc(c.nombre)}</option>`).join('');
}

// Selectores de categoría fuera de la tabla: alta de producto y "Mover seleccionados"
export function renderSelectsCategorias(){
  $('#p-categoria').innerHTML = opcionesCategorias(null);
  $('#mover-a').innerHTML = opcionesCategorias(null);
}

export function renderCategoriasAdmin(){
  $('#lista-cats-admin').innerHTML = estado.categorias.length
    ? estado.categorias.map(c => {
        const cuenta = estado.productos.filter(p => p.categoria_id === c.id).length;
        return `<li>
          <input type="text" maxlength="60" value="${esc(c.nombre)}" aria-label="Nombre de la categoría">
          <span class="cuenta">${cuenta} ${cuenta === 1 ? 'producto' : 'productos'}</span>
          <button class="btn" data-accion="renombrar-cat" data-id="${esc(c.id)}">Guardar nombre</button>
          <button class="btn borrar" data-accion="eliminar-cat" data-id="${esc(c.id)}">Eliminar</button>
        </li>`;
      }).join('')
    : '<li class="vacio">Todavía no hay categorías. Creá la primera arriba.</li>';
}

export function initCategorias(){
  $('#form-categoria').addEventListener('submit', e => {
    e.preventDefault();
    conBloqueo(async () => {
      const nombre = $('#c-nombre').value.trim();
      if (!nombre) return toast('Escribí un nombre para la categoría.', 'error');
      const {error} = await sb.from('categorias').insert({nombre});
      if (error) return toast(errorMsg(error), 'error');
      e.target.reset();
      toast(`Categoría "${nombre}" creada.`);
    });
  });

  $('#lista-cats-admin').addEventListener('click', e => {
    const b = e.target.closest('button[data-accion]');
    if (!b) return;
    if (b.dataset.accion === 'renombrar-cat'){
      const input = b.parentElement.querySelector('input');
      conBloqueo(() => renombrar(b.dataset.id, input.value.trim()));
    } else {
      pedirConfirmacion(b, 'Eliminar', () => conBloqueo(() => eliminar(b.dataset.id)));
    }
  });
}

async function renombrar(id, nombre){
  if (!nombre) return toast('El nombre no puede quedar vacío.', 'error');
  const {error} = await sb.from('categorias').update({nombre}).eq('id', id);
  if (error) return toast(errorMsg(error), 'error');
  toast('Nombre actualizado.');
}

async function eliminar(id){
  const c = estado.categorias.find(x => x.id === id);
  const {error} = await sb.from('categorias').delete().eq('id', id);
  if (error) return toast(errorMsg(error), 'error');
  if (estado.categoriaSeleccionada === id) estado.categoriaSeleccionada = 'todas';
  toast(`Categoría "${c ? c.nombre : ''}" eliminada. Sus productos quedan sin categoría.`);
}
