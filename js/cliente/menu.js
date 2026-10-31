import { estado } from '../estado.js';
import { $, esc } from '../utils.js';

// Lista de categorías del menú lateral. "Sin categoría" aparece solo si hay productos sin categoría.
export function renderMenu(){
  const sinCategoria = estado.productos.some(p => !p.categoria_id);
  const items = [
    {id: 'todas', nombre: 'Todas las categorías'},
    ...estado.categorias.map(c => ({id: c.id, nombre: c.nombre})),
    ...(sinCategoria ? [{id: 'sin', nombre: 'Sin categoría'}] : []),
  ];
  $('#lista-categorias').innerHTML = items.map(i => `<li>
      <button class="cat-item ${estado.categoriaSeleccionada === i.id ? 'activa' : ''}" data-cat="${esc(i.id)}">${esc(i.nombre)}</button>
    </li>`).join('');
}

function abrir(){
  renderMenu();
  $('#menu-categorias').hidden = false;
  $('#menu-fondo').hidden = false;
}

function cerrar(){
  $('#menu-categorias').hidden = true;
  $('#menu-fondo').hidden = true;
}

export function initMenu(){
  $('#menu-btn').addEventListener('click', abrir);
  $('#menu-cerrar').addEventListener('click', cerrar);
  $('#menu-fondo').addEventListener('click', cerrar);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrar(); });

  $('#lista-categorias').addEventListener('click', e => {
    const b = e.target.closest('button[data-cat]');
    if (!b) return;
    estado.categoriaSeleccionada = b.dataset.cat;
    cerrar();
    document.dispatchEvent(new Event('categoria:cambio'));
  });
}
