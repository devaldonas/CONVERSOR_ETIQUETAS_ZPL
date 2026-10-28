// backend/api/xml-to-zpl.js
import express from 'express';
import { supabase } from '../config/supabase.js';
import { parseXml } from '../services/xmlParser.js';
import { applyMappings } from '../services/mappingService.js';
import { generateZpl } from '../services/zplService.js';

const router = express.Router();

/* ============================
      DEBUG: XML → JSON
============================ */
router.post('/debug-json', async (req, res) => {
  try {
    const xml = req.body?.xml;
    if (!xml) return res.status(400).json({ error: "xml é obrigatório" });

    const json = await parseXml(xml);
    return res.json(json);

  } catch (err) {
    return res.status(500).json({
      error: "Erro ao converter XML",
      detail: String(err.message || err)
    });
  }
});

/* ============================
        XML → ZPL
============================ */
router.post('/', async (req, res) => {
  try {
    const template_id = req.body?.template_id ?? req.body?.templateId;
    const xml = req.body?.xml;

    if (!template_id)
      return res.status(400).json({ error: "template_id é obrigatório" });

    if (!xml)
      return res.status(400).json({ error: "xml é obrigatório" });

    // 1) XML → JSON
    const json = await parseXml(xml);

    // 2) Campos do template
    const { data: fields, error: fieldsErr } = await supabase
      .from("template_fields")
      .select("id, name")
      .eq("template_id", template_id);

    if (fieldsErr) throw fieldsErr;

    if (!fields?.length)
      return res.status(400).json({ error: "Nenhum campo do template encontrado" });

    // 3) Buscar mappings
    const { data: mappings, error: mappingsErr } = await supabase
      .from("mappings")
      .select("name, xml_path, rules, active")
      .eq("template_id", template_id)
      .eq("active", true);

    if (mappingsErr) throw mappingsErr;

    if (!mappings?.length)
      return res.status(400).json({ error: "Nenhum mapping ativo encontrado" });

    // 4) Aplicar mappings → gerar payload
    const payload = applyMappings(json, fields, mappings);

    // 5) Gerar ZPL usando a função SQL
    const zpl = await generateZpl(template_id, payload);

    // 6) Registrar no histórico
    await supabase.from("generated_labels").insert({
      template_id,
      payload,
      zpl
    });

    // 7) Enviar arquivo para download
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", "attachment; filename=etiqueta.zpl");

    return res.send(zpl);

  } catch (err) {
    console.error("ERRO XML→ZPL:", err);
    return res.status(500).json({
      error: "Erro ao gerar etiqueta",
      detail: err.message || String(err)
    });
  }
});

export default router;
