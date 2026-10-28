const express = require('express');
const cors = require('cors');
const xml2js = require('xml2js');
const path = require('path');
const { exec } = require('child_process');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Função para abrir o navegador
function openBrowser() {
    const url = `http://localhost:${PORT}`;
    const start = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
    exec(`${start} ${url}`, (err) => {
        if (err) {
            console.log(`⚠️ Não foi possível abrir o navegador automaticamente.`);
            console.log(`🌐 Acesse manualmente: ${url}`);
        } else {
            console.log(`🌐 Navegador aberto em: ${url}`);
        }
    });
}

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, 'frontend')));

function extractAllLabels(xmlData) {
    const allLabels = [];
    
    try {
        const volume = xmlData.Volume;
        if (!volume) return allLabels;
        
        const pedidosRiac = volume.PedidoRiac || [];
        
        for (const pedido of pedidosRiac) {
            const lojas = pedido.Loja || [];
            const numeroPedido = pedido.$?.Codigo || 'N/A';
            
            for (const loja of lojas) {
                const dadosVolume = loja.DADOS_VOLUME || [];
                
                for (const volumeData of dadosVolume) {
                    const etiquetas = volumeData.ETIQUETA || [];
                    
                    for (const etiqueta of etiquetas) {
                        let codigoArtigo = etiqueta.codArtigo?.[0] || loja.CodigoMaterial?.[0] || '';
                        codigoArtigo = codigoArtigo.replace(/^0+/, '');
                        
                        const labelData = {
                            fornecedor: etiqueta.remNome?.[0] || loja.NomeForn?.[0] || 'JUNO IMPORTACAO E EXPORTACAO L',
                            destinatario: etiqueta.destNome?.[0] || loja.destNome?.[0] || 'CD GUARULHOS NOVO',
                            endereco: etiqueta.desEndereco?.[0] || loja.desEndereco?.[0] || 'RUA LANDRI SALES 1070, G01',
                            cep: etiqueta.desAuxiliar_1?.[0] || loja.desAuxiliar_1?.[0] || 'CEP: 07250-130GUARULHOS-SP',
                            cnpj: etiqueta.desAuxiliar_2?.[0] || loja.desAuxiliar_2?.[0] || 'CNPJ: 33200056036097',
                            codigoBarrasTop: etiqueta.codBarraCdAtual?.[0] || 'L16034937001017116',
                            codigoBarrasBottom: etiqueta.detalhesCodBarra?.[0] || etiqueta.codBarra?.[0] || 'T00000041858206',
                            pedido: numeroPedido,
                            volumes: etiqueta.numVolume?.[0] || 'N. 1/5',
                            quantidadeTotal: etiqueta.qtdeTotal?.[0] || '0',
                            tipoProduto: etiqueta.tipoProduto?.[0] || loja.tipoProduto?.[0] || 'AR',
                            codigoArtigo: codigoArtigo,
                            destino: etiqueta.desCodigoDestino?.[0] || loja.desCodigoDestino?.[0] || 'C270',
                            dco: etiqueta.codDco?.[0] || loja.codDco?.[0] || '283'
                        };
                        
                        allLabels.push(labelData);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Erro ao extrair etiquetas:', error);
    }
    
    return allLabels;
}

// Rota para processar XML e retornar todas as etiquetas
app.post('/api/process-all-xml', async (req, res) => {
    try {
        const { xml } = req.body;
        console.log('📥 Processando XML...');
        
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(xml);
        
        const allLabels = extractAllLabels(result);
        
        console.log(`✅ ${allLabels.length} etiqueta(s) encontrada(s)`);
        
        if (allLabels.length > 0) {
            res.json({ 
                success: true, 
                allLabels: allLabels,
                totalLabels: allLabels.length
            });
        } else {
            res.json({ success: false, error: 'Nenhuma etiqueta encontrada' });
        }
        
    } catch (error) {
        console.error('❌ Erro:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Rota para processar XML (retorna primeira etiqueta)
app.post('/api/process-xml', async (req, res) => {
    try {
        const { xml } = req.body;
        console.log('📥 Processando XML...');
        
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(xml);
        
        const allLabels = extractAllLabels(result);
        
        if (allLabels.length > 0) {
            console.log('✅ Primeira etiqueta extraída');
            res.json({ 
                success: true, 
                data: allLabels[0],
                totalLabels: allLabels.length
            });
        } else {
            res.json({ success: false, error: 'Nenhuma etiqueta encontrada' });
        }
        
    } catch (error) {
        console.error('❌ Erro:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server running' });
});

// Para qualquer outra rota, servir o index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Iniciar servidor e abrir navegador
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║           🖨️ ZPL CONVERTER - RIACHUELO 🖨️               ║
╚══════════════════════════════════════════════════════════╝
🚀 Servidor rodando em http://localhost:${PORT}
    `);
    
    // Abrir o navegador automaticamente após 1 segundo
    setTimeout(() => {
        openBrowser();
    }, 1000);
});
