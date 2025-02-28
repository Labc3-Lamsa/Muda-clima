async function filtrar() {
    const uf = document.getElementById("uf").value;
    const city = document.getElementById("city").value;
    const station = document.getElementById("station").value;
    const group = document.getElementById("group").value;
    const startDate = document.getElementById("start-date").value;
    const interval = document.getElementById("interval").value;
    const inmet = document.getElementById("inmet").value;

    // Enviar as datas como JSON para o servidor
    const resposta = await fetch('http://localhost:3000/datasus', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uf, city, station, group, startDate, interval, inmet })
    });

    const dadosFiltrados = await resposta.json();
    console.log(dadosFiltrados);
    
}

function exibirDados(dados, coluna_inmet) {
    const tabela = document.getElementById("tabela");
    tabela.innerHTML = `
        <tr>
            <th>nome_munic</th>
            <th>uf</th>
            <th>pop_2000</th>
            <th>data</th>
            <th>cod_estacao</th>
            <th>valor</th>
            <th>cid10</th>
            <th>inmet</th>
        </tr>`;

        //m.nome_munic, m.uf, m.pop_2000, d.data, e.cod_estacao, d.valor, g.cid10, i.temp_max

    dados.forEach(dado => {
        tabela.innerHTML += `<tr>
            <td>${dado.nome_munic}</td>
            <td>${dado.uf}</td>
            <td>${dado.pop_2000}</td>
            <td>${dado.data}</td>
            <td>${dado.cod_estacao}</td>
            <td>${dado.valor}</td>
            <td>${dado.cid10}</td>
            <td>${dado[coluna_inmet]}</td>
        </tr>`;
    });
}