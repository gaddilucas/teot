import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

// `supabase` es el objeto global que carga el script UMD en index.html
export const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
