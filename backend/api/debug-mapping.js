import express from "express";
import { supabase } from "../config/supabase.js";
import { parseXml } from "../services/xmlParser.js";
import { applyMappings } from "../services/mappingService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const template_id = req.body?.template_id;
    const xml = req.body?.xml;

    if (!template_id) return res.status(400).json({ error: "template_id é obrigatório" });
    if (!xml) return res.status(400).json({ error: "xml é obrigatório" });

    // 1) XML → JSON
    const json = await parseXml(xml);

    // 2) Campos do template
    const { data: fields, error: fErr } = await supabase
      .from("template_fields")
      .select("id, name")
      .eq("template_id", template_id);

    if (fErr) throw fErr;

    // 3) Mappings
    const { data: mappings, error: mErr } = await supabase
      .from("mappings")
      .select("name, xml_path, rules, active")
      .eq("template_id", template_id)
      .eq("active", true);

    if (mErr) throw mErr;

    // 4) Payload gerado
    const payload = applyMappings(json, fields, mappings);

    // → retorna tudo para debug
    return res.json({
      xml_json: json,
      fields,
      mappings,
      payload
    });

  } catch (err) {
    console.error("Erro em /debug-mapping:", err);
    return res.status(500).json({
      error: "Erro no debug",
      detail: err.message || String(err)
    });
  }
});

export default router;
