import { sb } from '../supabase.js';
import { estado } from '../estado.js';
import { $, errorMsg, mostrar, toast } from '../utils.js';

export async function haySesion(){
  try {
    const {data} = await sb.auth.getSession();
    return !!data.session;
  } catch {
    return false;
  }
}

// Login del personal: el email y la contraseña van directo a Supabase Auth.
export function initSesion({onEntrar, onSalir}){
  $('#ir-personal').addEventListener('click', () => {
    mostrar(estado.isStaff ? 'personal' : 'login');
  });
  $('#volver').addEventListener('click', () => mostrar('cliente'));
  $('#volver-login').addEventListener('click', () => mostrar('cliente'));

  $('#form-login').addEventListener('submit', async e => {
    e.preventDefault();
    const email = $('#l-email').value.trim();
    const password = $('#l-pass').value;
    $('#l-aviso').textContent = 'Entrando…';
    const {error} = await sb.auth.signInWithPassword({email, password});
    if (error){
      $('#l-aviso').textContent = errorMsg(error);
      return;
    }
    $('#l-pass').value = '';
    $('#l-aviso').textContent = '';
    estado.isStaff = true;
    await onEntrar();
    mostrar('personal');
  });

  $('#salir').addEventListener('click', async () => {
    await sb.auth.signOut();
    estado.isStaff = false;
    onSalir();
    mostrar('cliente');
    toast('Sesión cerrada.');
  });
}
