// Estado compartido de la página. Los módulos leen y escriben acá.
export const estado = {
  isStaff: false,
  ocupado: false,
  productos: [],
  pedidos: [],
  movimientos: [],
  carrito: {},        // { productoId: cantidad }
  cantidades: {},     // cantidad elegida en la solapa Stock
  mesSeleccionado: null,
};
