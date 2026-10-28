CREATE OR REPLACE FUNCTION generate_zpl_from_template(
  p_template_id uuid,
  p_payload jsonb
)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  tpl text;
  key text;
  val text;
  result text;
BEGIN
  SELECT zpl_template
  INTO tpl
  FROM label_templates
  WHERE id = p_template_id;

  IF tpl IS NULL THEN
    RAISE EXCEPTION 'Template not found for id %', p_template_id;
  END IF;

  result := tpl;

  FOR key, val IN
    SELECT * FROM jsonb_each_text(p_payload)
  LOOP
    result := replace(result, '${' || key || '}', val);
  END LOOP;

  RETURN result;
END;
$$;
