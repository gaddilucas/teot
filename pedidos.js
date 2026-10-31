import { sb } from '../supabase.js';
import { estado } from '../estado.js';
import { errorMsg, toast } from '../utils.js';

// Pedidos hechos desde la página (solo los ve el personal).
export async function cargarPedidos(){
  const {data, error} = await sb.from('pedidos').select('*').order('fecha', {ascending: false});
  if (error){
    toast(errorMsg(error), 'error');
    return false;
  }
  estado.pedidos = data;
  return true;
}
