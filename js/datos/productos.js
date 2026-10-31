import { sb } from '../supabase.js';
import { estado } from '../estado.js';
import { num, errorMsg, toast } from '../utils.js';

// Trae el catálogo completo y lo guarda en el estado.
export async function cargarProductos(){
  const {data, error} = await sb.from('productos').select('*').order('nombre');
  if (error){
    toast(errorMsg(error), 'error');
    return false;
  }
  estado.productos = data.map(p => ({
    ...p,
    precio: num(p.precio),
    costo: num(p.costo),
    stock: num(p.stock),
  }));
  return true;
}
