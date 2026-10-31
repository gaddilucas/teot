import { estado } from './estado.js';
import { aviso } from './utils.js';
import { cargarProductos } from './datos/productos.js';
import { cargarPedidos } from './datos/pedidos.js';
import { cargarMovimientos } from './datos/movimientos.js';
import { escucharCambios } from './datos/tiempo-real.js';
import { renderCatalogo, initCatalogo } from './cliente/catalogo.js';
import { initCarrito } from './cliente/carrito.js';
import { haySesion, initSesion } from './personal/sesion.js';
import { renderPedidos, initPedidos } from './personal/pedidos.js';
import { renderStock, initStock } from './personal/stock.js';
import { initAlta } from './personal/alta.js';
import { renderMovimientos } from './personal/movimientos.js';
import { renderFinanzas, initFinanzas } from './finanzas/vista.js';

async function refrescarProductos(){
  if (!(await cargarProductos())) return;
  renderCatalogo();
  if (estado.isStaff) renderStock();
}

async function refrescarPedidos(){
  if (!estado.isStaff) return;
  if (!(await cargarPedidos())) return;
  renderPedidos();
}

async function refrescarMovimientos(){
  if (!estado.isStaff) return;
  if (!(await cargarMovimientos())) return;
  renderMovimientos();
  renderFinanzas();
}

async function entrarPersonal(){
  renderStock();
  await refrescarPedidos();
  await refrescarMovimientos();
}

function salirPersonal(){
  estado.pedidos = [];
  estado.movimientos = [];
  renderCatalogo();
}

async function iniciar(){
  initCatalogo();
  initCarrito();
  initSesion({onEntrar: entrarPersonal, onSalir: salirPersonal});
  initPedidos();
  initStock();
  initAlta();
  initFinanzas();

  estado.isStaff = await haySesion();
  await refrescarProductos();
  if (estado.isStaff) await entrarPersonal();

  escucharCambios({
    onProductos: refrescarProductos,
    onPedidos: refrescarPedidos,
    onMovimientos: refrescarMovimientos,
  });
  aviso('');
}

iniciar();
