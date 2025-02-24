async function filtrar() {
    const startDate = document.getElementById("start-date").value;

    // Enviar as datas como JSON para o servidor
    const resposta = await fetch('http://localhost:3000/datasus', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ startDate })
    });

    const dadosFiltrados = await resposta.json();
    exibirDados(dadosFiltrados);
}

function exibirDados(dados) {
    const tabela = document.getElementById("tabela");
    tabela.innerHTML = `
        <tr>
            <th>nome_munic</th>
            <th>uf</th>
            <th>pop_2000</th>
            <th>cod_grupo</th>
            <th>data</th>
            <th>valor</th>
        </tr>`;

    dados.forEach(dado => {
        tabela.innerHTML += `<tr>
            <td>${dado.nome_munic}</td>
            <td>${dado.uf}</td>
            <td>${dado.pop_2000}</td>
            <td>${dado.cod_grupo}</td>
            <td>${dado.data}</td>
            <td>${dado.valor}</td>
        </tr>`;
    });
}