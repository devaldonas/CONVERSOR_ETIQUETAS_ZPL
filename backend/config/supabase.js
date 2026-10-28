import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config(); // ✅ AGORA O .env É CARREGADO AQUI

if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL não encontrado no .env');
}

if (!process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('SUPABASE_SERVICE_KEY não encontrado no .env');
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);
