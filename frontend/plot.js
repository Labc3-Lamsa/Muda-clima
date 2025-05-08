let internacoesChart;

document.addEventListener("DOMContentLoaded", function () {
    const ctx = document.getElementById("internacoesChart").getContext("2d");
    window.internacoesChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: [],
            datasets: [
                {
                    label: "Internações por Doenças Respiratórias",
                    data: [],
                    borderColor: "red",
                    backgroundColor: "rgba(255, 0, 0, 0.2)",
                    borderWidth: 2,
                    fill: true,
                    yAxisID: "y1"
                },
                {
                    label: "Temperatura Média (°C)",
                    data: [],
                    borderColor: "blue",
                    backgroundColor: "rgba(0, 0, 255, 0.2)",
                    borderWidth: 2,
                    fill: false,
                    yAxisID: "y2"
                }
            ]
        },
        options: {
            responsive: false,
            scales: {
                y1: {
                    type: "linear",
                    position: "left",
                    title: { display: true, text: "Internações" }
                },
                y2: {
                    type: "linear",
                    position: "right",
                    title: { display: true, text: "Temperatura (°C)" },
                    grid: { drawOnChartArea: false }
                }
            }
        }
    });
});

async function filtrar() {
    try {
        const uf = document.getElementById("uf").value;
        const city = document.getElementById("city").value;
        const station = document.getElementById("station").value;
        const group = document.getElementById("group").value;
        const startDate = document.getElementById("start-date").value;
        const endDate = document.getElementById("end-date").value;
        const inmet = document.getElementById("inmet").value;

        // Determinando qual coluna usar com base na data
        let pop;
        const year = new Date(startDate).getFullYear();

        if (year >= 2000 && year < 2010) {
            pop = 'pop_2000';
        } else if (year >= 2010 && year < 2020) {
            pop = 'pop_2010';
        } else if (year >= 2021) {
            pop = 'pop_2021';
        } else {
            throw new Error("Data fora do intervalo esperado.");
        }

        const resposta = await fetch('http://localhost:3000/datasus', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uf, city, station, group, startDate, endDate, inmet, pop })
        });

        if (!resposta.ok) throw new Error(`Erro: ${resposta.status} - ${resposta.statusText}`);

        const dadosFiltrados = await resposta.json();
        console.log(dadosFiltrados);
        atualizarGrafico(dadosFiltrados);

    } catch (erro) {
        console.error("Erro ao buscar dados:", erro);
        alert("Falha ao buscar dados. Verifique a conexão com o servidor.");
    }
}

function atualizarGrafico(dados) {
    const selectElement = document.getElementById("inmet");
    const variavelSelecionada = selectElement.value; // Obtém o valor do select
    const descricaoVariavel = selectElement.selectedOptions[0].text; // Obtém a descrição visível
    const labels = dados.map(item => {
        const dataFormatada = new Date(item.data);
        return dataFormatada.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    });

    const internacoes = dados.map(item => parseInt(item.valor));
    const valoresMeteorologicos = dados.map(item => parseFloat(item[variavelSelecionada]) || 0);

    if (window.internacoesChart) {
        window.internacoesChart.destroy();
    }

    const ctx = document.getElementById("internacoesChart").getContext("2d");
    window.internacoesChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Internações por Doenças Respiratórias",
                    data: internacoes,
                    borderColor: "red",
                    backgroundColor: "rgba(255, 0, 0, 0.2)",
                    borderWidth: 2,
                    fill: true,
                    yAxisID: "y1"
                },
                {
                    label: `Valores de ${descricaoVariavel}`,
                    data: valoresMeteorologicos,
                    borderColor: "blue",
                    backgroundColor: "rgba(0, 0, 255, 0.2)",
                    borderWidth: 2,
                    fill: false,
                    yAxisID: "y2"
                }
            ]
        },
        options: {
            responsive: false,
            scales: {
                y1: {
                    type: "linear",
                    position: "left",
                    title: { display: true, text: "Internações" }
                },
                y2: {
                    type: "linear",
                    position: "right",
                    title: { display: true, text: descricaoVariavel },
                    grid: { drawOnChartArea: false }
                }
            }
        }
    });
}

