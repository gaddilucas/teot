import { sb } from '../supabase.js';
import { estado } from '../estado.js';
import { errorMsg, toast } from '../utils.js';

// Trae todos los movimientos de a 1000, porque ese es el límite por consulta.
export async function cargarMovimientos(){
  const todos = [];
  for (let desde = 0; ; desde += 1000){
    const {data, error} = await sb.from('movimientos')
      .select('*')
      .order('fecha', {ascending: false})
      .range(desde, desde + 999);
    if (error){
      toast(errorMsg(error), 'error');
      return false;
    }
    todos.push(...data);
    if (data.length < 1000) break;
  }
  estado.movimientos = todos;
  return true;
}

// Registra un movimiento (alta de producto o compra de stock).
export async function registrar(movimiento){
  const {error} = await sb.from('movimientos').insert(movimiento);
  if (error) throw error;
}
