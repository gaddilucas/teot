import { sb } from '../supabase.js';
import { estado } from '../estado.js';
import { num, errorMsg, toast, conBloqueo } from '../utils.js';
import { subirFoto } from './fotos.js';

const MENSAJE = {entrada: 'Stock sumado.', salida: 'Stock restado.', venta: 'Venta registrada.'};

// Sumar, restar o vender. La función de la base valida el stock y registra el movimiento.
export async function ajustar(id, tipo){
  const p = estado.productos.find(x => x.id === id);
  if (!p) return;
  const cant = Math.floor(Number(estado.cantidades[id] ?? 1));
  if (!(cant > 0)) return toast('La cantidad tiene que ser mayor a cero.', 'error');
  if (tipo !== 'entrada' && cant > num(p.stock)){
    return toast(`Solo hay ${num(p.stock)} de ${p.nombre} en stock.`, 'error');
  }
  const {error} = await sb.rpc('ajustar_stock', {p_id: id, p_tipo: tipo, p_cantidad: cant});
  if (error) return toast(errorMsg(error), 'error');
  toast(MENSAJE[tipo]);
}

export async function guardarPrecios(boton){
  const fila = boton.closest('.fila');
  const id = boton.dataset.id;
  const precio = parseFloat(fila.querySelector('[data-precio]').value);
  const costo = parseFloat(fila.querySelector('[data-costo]').value);
  if (!Number.isFinite(precio) || precio < 0 || !Number.isFinite(costo) || costo < 0){
    return toast('Precio y costo tienen que ser números válidos.', 'error');
  }
  const {error} = await sb.from('productos').update({precio, costo}).eq('id', id);
  if (error) return toast(errorMsg(error), 'error');
  toast('Precios actualizados.');
}

// Primer toque: pide confirmar. Segundo toque dentro de 4 segundos: elimina.
export function pedirEliminar(boton){
  if (boton.dataset.confirmar !== '1'){
    boton.dataset.confirmar = '1';
    boton.textContent = '¿Seguro? Tocá de nuevo';
    boton.classList.add('peligro');
    clearTimeout(boton._t);
    boton._t = setTimeout(() => {
      boton.dataset.confirmar = '';
      boton.textContent = 'Eliminar';
      boton.classList.remove('peligro');
    }, 4000);
    return;
  }
  conBloqueo(() => eliminarProducto(boton.dataset.id));
}

async function eliminarProducto(id){
  const p = estado.productos.find(x => x.id === id);
  const {error} = await sb.from('productos').delete().eq('id', id);
  if (error) return toast(errorMsg(error), 'error');
  delete estado.cantidades[id];
  toast(`"${p ? p.nombre : 'Producto'}" eliminado del catálogo.`);
}

export async function cambiarFoto(id, archivo){
  try {
    const imagen_path = await subirFoto(archivo);
    const {error} = await sb.from('productos').update({imagen_path}).eq('id', id);
    if (error) throw error;
    toast('Foto actualizada.');
  } catch {
    toast('No se pudo cargar la foto. Probá con otra imagen.', 'error');
  }
}
