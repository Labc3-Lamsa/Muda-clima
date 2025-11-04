export function exportarParaXLSX(dados, nomeArquivo = 'dados.xlsx') {
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

function getImagemGraficoComFundo(chartInstance) {
    if (!chartInstance) return null;
    
    const canvas = chartInstance.canvas;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    
    const ctx = tempCanvas.getContext('2d');
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    ctx.drawImage(canvas, 0, 0);

    return tempCanvas.toDataURL('image/png');
}

export function exportarParaPNG(chartInstance) {
    if (!chartInstance) {
        alert("O gráfico ainda não foi gerado.");
        return;
    }
    const urlImagem = getImagemGraficoComFundo(chartInstance);
    
    const link = document.createElement('a');
    link.href = urlImagem;
    link.download = 'grafico_internacoes.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function exportarParaPDF(chartInstance) {
    if (!chartInstance) {
        alert("O gráfico ainda não foi gerado.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const urlImagem = getImagemGraficoComFundo(chartInstance);
    const canvas = chartInstance.canvas;
    
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
    });

    doc.addImage(urlImagem, 'PNG', 0, 0, canvas.width, canvas.height);
    doc.save('grafico_internacoes.pdf');
}