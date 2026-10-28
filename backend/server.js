const express = require('express');
const cors = require('cors');
const xml2js = require('xml2js');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Rota para processar XML
app.post('/api/process-xml', async (req, res) => {
    try {
        const { xml } = req.body;
        console.log('📥 XML recebido');
        
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(xml);
        
        // Extrair dados do XML
        const pedidoRiac = result?.Volume?.PedidoRiac?.[0] || {};
        const loja = pedidoRiac?.Loja?.[0] || {};
        const dadosVolume = loja?.DADOS_VOLUME?.ETIQUETA?.[0] || {};
        
        const dados = {
            remetente: loja.NomeForn?.[0] || 'JUNO IMPORTACAO E EXPORTACAO L',
            destinatario: loja.destNome?.[0] || 'CD GUARULHOS NOVO',
            endereco: loja.desEndereco?.[0] || 'RUA LANDRI SALES 1070, G01',
            cep: loja.desAuxiliar_1?.[0] || 'CEP: 07250-130GUARULHOS-SP',
            cnpj: loja.desAuxiliar_2?.[0] || 'CNPJ: 33200056036097',
            codigoBarras: dadosVolume.codBarra?.[0] || 'T00000041810381',
            pedido: pedidoRiac.$?.Codigo || '6702609737',
            volume: dadosVolume.numVolume?.[0] || 'N. 1/7',
            quantidade: dadosVolume.qtdeTotal?.[0] || '22'
        };
        
        console.log('✅ Dados extraídos:', dados);
        res.json({ success: true, data: dados });
        
    } catch (error) {
        console.error('❌ Erro:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});