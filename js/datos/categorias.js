import { sb } from '../supabase.js';
import { estado } from '../estado.js';
import { errorMsg, toast } from '../utils.js';

// Categorías ordenadas por nombre
export async function cargarCategorias(){
  const {data, error} = await sb.from('categorias').select('*').order('nombre');
  if (error){
    toast(errorMsg(error), 'error');
    return false;
  }
  estado.categorias = data;
  return true;
}
