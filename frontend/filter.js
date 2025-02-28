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

async function carregarEstacoes() {
    const cidade = document.getElementById('city').value.trim();

    if (!cidade) {
        document.getElementById('station').innerHTML = '<option value="">Escolha uma estação</option>';
        document.getElementById('station').disabled = true;
        return;
    }

    const resposta = await fetch(`http://localhost:3000/estacoes/${cidade}`);
    const estacoes = await resposta.json();

    const selectEstacao = document.getElementById('station');
    selectEstacao.innerHTML = '<option value="">Escolha uma estação</option>'; // Reset

    estacoes.forEach(estacao => {
        const option = document.createElement('option');
        option.value = estacao;
        option.textContent = estacao;
        selectEstacao.appendChild(option);
    });

    selectEstacao.disabled = false;
}

// Ativar carregamento dinâmico
document.addEventListener("DOMContentLoaded", () => {
    const ufInput = document.getElementById('uf');
    const cidadeInput = document.getElementById('city');

    if (ufInput) ufInput.addEventListener('input', carregarCidades);
    if (cidadeInput) cidadeInput.addEventListener('input', carregarEstacoes);

    carregarUFs();
});