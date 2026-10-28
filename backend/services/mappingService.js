// backend/services/mappingService.js

// Caminho seguro no JSON usando "a.b.c[0].d"
function getValueByPath(obj, path) {
  try {
    return path.split('.').reduce((acc, part) => {
      if (acc === undefined || acc === null) return undefined;
      if (part.match(/^\d+$/)) {
        return acc[Number(part)];
      }
      return acc[part];
    }, obj);
  } catch {
    return undefined;
  }
}

export function applyMappings(json, fields, mappings) {
  const payload = {};

  for (const field of fields) {
    const map = mappings.find(m => m.name === field.name);
    if (!map) {
      payload[field.name] = "";
      continue;
    }

    let value = getValueByPath(json, map.xml_path);

    // aplica regras opcionais
    if (map.rules && typeof map.rules === "object") {
      if (map.rules.trim) value = String(value || "").trim();
      if (map.rules.uppercase) value = String(value || "").toUpperCase();
      if (map.rules.lowercase) value = String(value || "").toLowerCase();
      if (map.rules.prefix) value = map.rules.prefix + (value || "");
      if (map.rules.suffix) value = (value || "") + map.rules.suffix;
    }

    payload[field.name] = value ?? "";
  }

  return payload;
}
