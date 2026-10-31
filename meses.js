// Utilidades para agrupar por mes (usando la hora local)

export function mesKey(d){
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}

export function tituloMes(d){
  const t = d.toLocaleString('es-AR', {month: 'long', year: 'numeric'});
  return t.charAt(0).toUpperCase() + t.slice(1);
}

// "2026-10" -> "Octubre 2026"
export function tituloDeClave(k){
  const [anio, mes] = k.split('-').map(Number);
  return tituloMes(new Date(anio, mes - 1, 1));
}

// Los últimos n meses, empezando por el actual
export function ultimosMeses(n = 12){
  const hoy = new Date();
  const out = [];
  for (let i = 0; i < n; i++){
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    out.push({k: mesKey(d), titulo: tituloMes(d)});
  }
  return out;
}
