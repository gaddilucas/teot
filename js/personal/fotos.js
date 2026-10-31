import { sb } from '../supabase.js';
import { BUCKET } from '../config.js';

// Achica la foto a 800 px de lado y la guarda como JPEG liviano
export function comprimir(archivo){
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(archivo);
    const img = new Image();
    img.onload = () => {
      const escala = Math.min(1, 800 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * escala);
      c.height = Math.round(img.height * escala);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob(b => b ? resolve(b) : reject(new Error('blob')), 'image/jpeg', 0.8);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('imagen'));
    };
    img.src = url;
  });
}

// Sube la foto al bucket y devuelve la ruta del archivo
export async function subirFoto(archivo){
  const blob = await comprimir(archivo);
  const path = `${crypto.randomUUID()}.jpg`;
  const {error} = await sb.storage.from(BUCKET).upload(path, blob, {contentType: 'image/jpeg'});
  if (error) throw error;
  return path;
}
