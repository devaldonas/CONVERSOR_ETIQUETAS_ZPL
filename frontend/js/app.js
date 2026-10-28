async function enviar() {
  const file = document.getElementById('xmlFile').files[0];
  const templateId = document.getElementById('templateId').value;

  if (!file || !templateId) {
    alert('Selecione um XML e informe o Template ID');
    return;
  }

  const xml = await file.text();

  const res = await fetch('http://localhost:3000/api/xml-to-zpl', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      template_id: templateId,
      xml
    })
  });

  const blob = await res.blob();

  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'etiqueta.zpl';
  a.click();
}
