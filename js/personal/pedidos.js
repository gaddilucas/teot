import { sb } from '../supabase.js';
import { estado } from '../estado.js';
import { $, ars, esc, num, ahora, toast, errorMsg, conBloqueo, fechaCorta } from '../utils.js';

export function renderPedidos(){
  const pend = estado.pedidos.filter(p => p.estado === 'pendiente');
  $('#lista-pedidos').innerHTML = pend.length
    ? pend.map(tarjetaPedido).join('')
    : '<p class="vacio">No hay pedidos pendientes.</p>';
}

function tarjetaPedido(p){
  return `<article class="ficha">
    <header class="cab"><strong>${esc(p.cliente)}</strong><span>${esc(fechaCorta(p.fecha))}</span></header>
    <ul>${(p.items || []).map(it => `<li>${esc(it.nombre)} × ${num(it.cantidad)}</li>`).join('')}</ul>
    <div class="total"><span>Total</span><strong>${ars.format(num(p.total))}</strong></div>
    <div class="acciones">
      <button class="btn primario" data-accion="entregar" data-id="${esc(p.id)}">Entregar y descontar</button>
      <button class="btn" data-accion="cancelar" data-id="${esc(p.id)}">Cancelar</button>
    </div>
  </article>`;
}

export function initPedidos(){
  $('#lista-pedidos').addEventListener('click', e => {
    const b = e.target.closest('button[data-accion]');
    if (!b) return;
    conBloqueo(() => b.dataset.accion === 'entregar' ? entregar(b.dataset.id) : cancelar(b.dataset.id));
  });
}

// La función de la base descuenta todo el stock y registra las ventas en una sola operación
async function entregar(id){
  const {error} = await sb.rpc('entregar_pedido', {p_id: id});
  if (error) return toast(errorMsg(error), 'error');
  toast('Pedido entregado y stock descontado.');
}

async function cancelar(id){
  const {error} = await sb.from('pedidos').update({estado: 'cancelado', cerrado: ahora()}).eq('id', id);
  if (error) return toast(errorMsg(error), 'error');
  toast('Pedido cancelado.');
}
