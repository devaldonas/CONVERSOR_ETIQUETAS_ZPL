-- CLIENTE RIACHUELO
INSERT INTO clients (name, code, description)
VALUES ('Riachuelo', 'RIACHUELO', 'Cliente Riachuelo');

-- TIPOS DE CÓDIGO DE BARRAS
INSERT INTO barcode_types (name, zpl_command) VALUES
('CODE128', '^BC'),
('EAN13', '^BE'),
('QR', '^BQ');

-- TEMPLATE RIACHUELO 60x100
INSERT INTO label_templates (
  client_id, name, tag, width_mm, height_mm, dpi, orientation, zpl_template
)
VALUES (
  (SELECT id FROM clients WHERE code = 'RIACHUELO'),
  'Etiqueta Riachuelo 60x100',
  'RIACHUELO_60X100',
  60,
  100,
  203,
  'N',
'^XA
^PW480
^LL800
^CF0,28
^FO31,7^FD${remNome}^FS
^FO31,43^FDDestinatário^FS
^FO31,70^FD${destinatario_nome}^FS
^FO31,99^FD${destinatario_endereco}^FS
^FO31,130^FD${destinatario_cep}^FS
^FO31,164^FDCNPJ: ${destinatario_cnpj}^FS

^FO37,319^BY2,3,80^BCN,80,Y,N,N
^FD${codBarraAtual}^FS

^FO37,373^FDCódigo Artigo^FS
^FO37,412^FD${codigo_artigo}^FS

^FO37,451^FDPedido^FS
^FO37,476^FD${pedido}^FS

^FO37,520^FDVolumes^FS
^FO37,545^FD${volumes}^FS

^FO210,523^FDDCO^FS
^FO210,545^FD${dco}^FS

^FO328,374^FDDestino^FS
^FO328,401^FD${destino}^FS

^FO328,451^FDQuant. Total^FS
^FO328,476^FD${quantidade_total}^FS

^FO328,520^FDTipo Produto^FS
^FO328,548^FD${tipo_produto}^FS

^FO41,606^BY2,3,110^BCN,110,Y,N,N
^FD${codBarraDetalhado}^FS
^XZ'
);
