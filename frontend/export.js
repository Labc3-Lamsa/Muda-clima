function exportarParaXLSX(dados, nomeArquivo = 'dados.xlsx') {
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

function exportarParaCSV(dados, nomeArquivo = 'dados.csv') {
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