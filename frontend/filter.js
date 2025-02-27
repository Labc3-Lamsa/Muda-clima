// Carregar UFs ao iniciar a página
async function carregarUFs() {
    const resposta = await fetch('http://localhost:3000/ufs');
    const ufs = await resposta.json();

    const listaUFs = document.getElementById('ufs-list');
    listaUFs.innerHTML = '';

    ufs.forEach(uf => {
        listaUFs.innerHTML += `<option value="${uf}">`;
    });
}

// Buscar cidades da UF digitada
async function carregarCidades() {
    const uf = document.getElementById('uf').value.trim().toUpperCase();
    const cidadeInput = document.getElementById('city');
    const listaCidades = document.getElementById('cities-list');

    if (!uf) {
        cidadeInput.disabled = true;
        listaCidades.innerHTML = '';
        return;
    }

    const resposta = await fetch(`http://localhost:3000/cidades/${uf}`);
    const cidades = await resposta.json();

    // Preencher o <datalist> com as cidades da UF digitada
    listaCidades.innerHTML = '';
    cidades.forEach(cidade => {
        listaCidades.innerHTML += `<option value="${cidade}">`;
    });

    cidadeInput.disabled = false;
}


// Ativar carregamento de cidades ao digitar a UF
document.addEventListener("DOMContentLoaded", () => {
    const ufInput = document.getElementById('uf');

    if (ufInput) {
        ufInput.addEventListener('input', carregarCidades);
    } else {
        console.error('Elemento com id "uf" não encontrado.');
    }

    carregarUFs();
});

// Carregar UFs quando a página carregar
document.addEventListener("DOMContentLoaded", carregarUFs);