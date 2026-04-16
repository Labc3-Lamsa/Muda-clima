export function exportarParaXLSX(dados, nomeArquivo = 'dados.xlsx') {
    if (typeof XLSX === 'undefined') {
        alert('Biblioteca XLSX não carregada. Atualize a página e tente novamente.');
        return;
    }
    const dadosFormatados = dados.map(item => {
        const novoItem = { ...item };
        if (novoItem.data) {
            novoItem.data = new Date(novoItem.data).toISOString().split('T')[0];
        }
        if ('valor' in novoItem) {
            novoItem.Internações = novoItem.valor;
            delete novoItem.valor;
        }
        return novoItem;
    });

    const worksheet = XLSX.utils.json_to_sheet(dadosFormatados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dados");
    XLSX.writeFile(workbook, nomeArquivo);
}

export function exportarParaCSV(dados, nomeArquivo = 'dados.csv') {
    if (!dados || !dados.length) {
        alert('Nenhum dado disponível para exportar em CSV.');
        return;
    }

    const dadosFormatados = dados.map(item => {
        const novoItem = { ...item };
        if (novoItem.data) {
            novoItem.data = new Date(novoItem.data).toISOString().split('T')[0];
        }
        if ('valor' in novoItem) {
            novoItem.Internações = novoItem.valor;
            delete novoItem.valor;
        }
        return novoItem;
    });

    const headers = Object.keys(dadosFormatados[0]).join(',');
    const linhas = dadosFormatados.map(obj => Object.values(obj).join(',')).join('\n');
    const csv = headers + '\n' + linhas;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nomeArquivo;
    a.click();
    URL.revokeObjectURL(url);
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    text = text == null ? '' : String(text);
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line.trim(), x, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line.trim(), x, y);
    return y + lineHeight;
}

function createExportCanvasWithMetadata(chartInstance, metadata = {}, scale = Math.max(2, window.devicePixelRatio || 1)) {
    if (!chartInstance) return null;

    const chartCanvas = chartInstance.canvas;
    const chartWidth = chartCanvas.width;
    const chartHeight = chartCanvas.height;
    const infoItems = [
        { label: 'UF', value: metadata.uf || 'Todas' },
        { label: 'Cidade', value: metadata.city || 'Todas' },
        { label: 'Estação', value: metadata.station || 'Todas' },
        { label: 'Variável climática', value: metadata.inmetLabel || metadata.inmet || 'Não selecionada' },
        { label: 'Período', value: `${metadata.start || 'Não definido'} até ${metadata.end || 'Não definido'}` },
        { label: 'Doenças', value: metadata.diseases || 'Todas as doenças' },
        { label: 'Registros', value: metadata.recordCount != null ? metadata.recordCount : 0 },
        { label: 'Gerado em', value: new Date(metadata.generatedAt || Date.now()).toLocaleString('pt-BR') }
    ];

    const lineHeight = 20;
    const cardPadding = 18;
    const headerHeight = 48;
    const legendHeight = 42;
    const cardTopMargin = 20;
    const cardWidth = chartWidth - cardPadding * 2;
    const cardContentWidth = cardWidth - cardPadding * 2;
    const columns = 2;
    const rowCount = Math.ceil(infoItems.length / columns);
    const infoCardHeight = rowCount * lineHeight + cardPadding * 2 + 40;
    const exportHeight = chartHeight + cardTopMargin + infoCardHeight + cardPadding;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = chartWidth * scale;
    exportCanvas.height = exportHeight * scale;

    const ctx = exportCanvas.getContext('2d');
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, chartWidth, exportHeight);
    ctx.drawImage(chartCanvas, 0, 0, chartWidth, chartHeight);

    const cardX = cardPadding;
    const cardY = chartHeight + cardTopMargin;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cardX, cardY, cardWidth, infoCardHeight);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(cardX, cardY, cardWidth, infoCardHeight);

    const titleX = cardX + cardPadding;
    const titleY = cardY + 28;
    ctx.fillStyle = '#0f172a';
    ctx.font = '700 16px Arial';
    ctx.fillText('Resumo da exportação', titleX, titleY);

    ctx.fillStyle = '#475569';
    ctx.font = '12px Arial';
    ctx.fillText(`Dados exportados: ${metadata.recordCount != null ? metadata.recordCount : 0}`, titleX, titleY + 22);

    const legendY = cardY + 60;
    const legendItemX = titleX;
    ctx.fillStyle = '#8B1A1A';
    ctx.fillRect(legendItemX, legendY, 20, 10);
    ctx.font = '12px Arial';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('Internações por doenças respiratórias', legendItemX + 26, legendY + 10);

    ctx.fillStyle = '#00306E';
    ctx.fillRect(legendItemX + 320, legendY, 20, 10);
    ctx.fillStyle = '#0f172a';
    ctx.fillText('Temperatura média (°C)', legendItemX + 346, legendY + 10);

    const infoStartY = legendY + legendHeight;
    const columnWidth = cardContentWidth / columns;
    infoItems.forEach((item, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);
        const x = titleX + col * columnWidth;
        let y = infoStartY + row * lineHeight;
        ctx.fillStyle = '#334155';
        ctx.font = '600 12px Arial';
        ctx.fillText(`${item.label}:`, x, y);
        ctx.fillStyle = '#0f172a';
        ctx.font = '12px Arial';
        wrapText(ctx, item.value, x + 110, y, columnWidth - 124, lineHeight);
    });

    return exportCanvas;
}

function getExportImageWithMetadata(chartInstance, metadata = {}) {
    const exportCanvas = createExportCanvasWithMetadata(chartInstance, metadata, 3);
    return exportCanvas ? exportCanvas.toDataURL('image/png', 1.0) : null;
}

export function exportarParaPNG(chartInstance, dados = [], metadata = {}) {
    try {
        if (!chartInstance) {
            alert("O gráfico ainda não foi gerado.");
            return;
        }
        const urlImagem = getExportImageWithMetadata(chartInstance, metadata);
        if (!urlImagem) {
            alert("Não foi possível gerar a imagem do gráfico.");
            return;
        }

        const link = document.createElement('a');
        link.href = urlImagem;
        link.download = 'grafico_internacoes.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Erro ao exportar PNG:', error);
        alert('Falha ao exportar PNG. Veja o console do navegador para detalhes.');
    }
}

export function exportarParaPDF(chartInstance, dados = [], metadata = {}) {
    try {
        if (!chartInstance) {
            alert("O gráfico ainda não foi gerado.");
            return;
        }

        const jsPDF = window.jspdf?.jsPDF;
        if (!jsPDF) {
            alert('Biblioteca jsPDF não carregada. Atualize a página e tente novamente.');
            return;
        }

        const urlImagem = getExportImageWithMetadata(chartInstance, metadata);
        if (!urlImagem) {
            alert("Não foi possível gerar a imagem do gráfico.");
            return;
        }
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: 'a4'
        });

    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxWidth = pageWidth - margin * 2;
    const maxHeight = pageHeight - margin * 2;
    const imgProps = doc.getImageProperties(urlImagem);
    let imgWidth = maxWidth;
    let imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    if (imgHeight > maxHeight) {
        imgHeight = maxHeight;
        imgWidth = (imgProps.width * imgHeight) / imgProps.height;
    }

    doc.addImage(urlImagem, 'PNG', margin, margin, imgWidth, imgHeight);

    const textY = imgHeight + margin + 24;
    doc.setFontSize(12);
    doc.text(`Quantidade de registros: ${dados.length}`, margin, textY);

    if (dados.length > 0) {
        const previewRows = dados.slice(0, 8).map(item => {
            return Object.values(item).map(value => String(value)).join(' | ');
        });

        let rowY = textY + 16;
        doc.setFontSize(9);
        doc.text('Preview dos dados exportados (primeiras 8 linhas):', margin, rowY);
        rowY += 14;
        previewRows.forEach(row => {
            if (rowY > doc.internal.pageSize.getHeight() - margin) return;
            doc.text(row, margin, rowY, { maxWidth: maxWidth });
            rowY += 12;
        });
    }

    doc.save('grafico_internacoes.pdf');
    } catch (error) {
        console.error('Erro ao exportar PDF:', error);
        alert('Falha ao exportar PDF. Veja o console do navegador para detalhes.');
    }
}