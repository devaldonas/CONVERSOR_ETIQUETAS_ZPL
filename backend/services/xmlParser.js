import xml2js from 'xml2js';

export async function parseXml(xml) {
  const parser = new xml2js.Parser({
    explicitArray: false,     // não colocar valores dentro de arrays
    mergeAttrs: true,         // mesclar atributos ao objeto
    explicitRoot: false,      // remove um nível extra de root
    tagNameProcessors: [
      name => name.replace(/:/g, '') // remove namespaces do tipo ns2:ETIQUETA
    ]
  });

  const result = await parser.parseStringPromise(xml);

  // NORMALIZA tudo para formato uniforme:
  // Garante que temos exatamente json.ETIQUETA
  if (result.ETIQUETA) {
    return { ETIQUETA: result.ETIQUETA };
  }

  // Se vier tudo em caps ou minúsculo, ajusta:
  const key = Object.keys(result).find(
    k => k.toLowerCase() === 'etiqueta'
  );

  if (key) {
    return { ETIQUETA: result[key] };
  }

  // fallback
  return { ETIQUETA: result };
}
