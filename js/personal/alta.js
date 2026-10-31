import { sb } from '../supabase.js';
import { $, toast, errorMsg, conBloqueo } from '../utils.js';
import { registrar } from '../datos/movimientos.js';
import { subirFoto } from './fotos.js';

// Carga de producto nuevo. Si tiene stock inicial, queda registrado como alta.
export function initAlta(){
  $('#form-producto').addEventListener('submit', e => {
    e.preventDefault();
    conBloqueo(async () => {
      const nombre = $('#p-nombre').value.trim();
      const precio = parseFloat($('#p-precio').value);
      const costo = parseFloat($('#p-costo').value);
      const stock = parseInt($('#p-stock').value, 10);
      if (!nombre || !Number.isFinite(precio) || precio < 0
          || !Number.isFinite(costo) || costo < 0
          || !Number.isFinite(stock) || stock < 0){
        return toast('Completá nombre, precio, costo y stock válidos.', 'error');
      }
      try {
        const archivo = $('#p-foto').files[0];
        const imagen_path = archivo ? await subirFoto(archivo) : null;
        const {data, error} = await sb.from('productos')
          .insert({nombre, precio, costo, stock, imagen_path})
          .select()
          .single();
        if (error) throw error;
        if (stock > 0){
          await registrar({producto_id: data.id, nombre, tipo: 'alta', cantidad: stock, precio, costo, total: 0});
        }
        e.target.reset();
        toast(`"${nombre}" agregado al catálogo.`);
      } catch (err) {
        toast(errorMsg(err), 'error');
      }
    });
  });
}
