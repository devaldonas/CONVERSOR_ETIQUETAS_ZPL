// backend/services/zplService.js
import { supabase } from '../config/supabase.js';

export async function generateZpl(templateId, payload) {
  // chama a função PL/pgSQL no Supabase
  const { data, error } = await supabase.rpc(
    'generate_zpl_from_template',
    {
      p_template_id: templateId,
      p_payload: payload
    }
  );

  if (error) {
    console.error('Erro ao chamar generate_zpl_from_template:', error);
    throw error;
  }

  return data;
}
