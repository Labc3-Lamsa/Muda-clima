import { API_BASE_URL } from "./utils/config.js";
import * as exports from "./utils/export.js";

let internacoesChart;
let dadosExportacao = [];

document.addEventListener("DOMContentLoaded", function () {
    const ctx = document.getElementById("internacoesChart").getContext("2d");
    internacoesChart = new Chart(ctx, {
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

    // --- Conector do Botão de Filtrar ---
    const botaoFiltrar = document.getElementById('btn-filtrar');
    if (botaoFiltrar) {
        botaoFiltrar.addEventListener('click', filtrar);
    } else {
        console.error('Botão "btn-filtrar" não foi encontrado.');
    }

    // --- Conector do Botão de Exportar ---
    const botaoExportar = document.getElementById('export-button');
    if (botaoExportar) {
        botaoExportar.addEventListener('click', () => {
            console.log(dadosExportacao)
            if (!dadosExportacao || !dadosExportacao.length) {
                alert("Nenhum dado para exportar.");
                return;
            }
            const formato = document.getElementById("export-format").value;
            if (formato === "csv") {
                exports.exportarParaCSV(dadosExportacao);
            } 
            else if (formato === "pdf") {
                exports.exportarParaPDF(internacoesChart);
            }
            else if (formato === "png") {
                exports.exportarParaPNG(internacoesChart);
            }
            else  {
                exports.exportarParaXLSX(dadosExportacao, 'dados_filtrados.xlsx');
            }
        });
    } else {
        console.error('Botão "export-button" não foi encontrado.');
    }
});

async function filtrar() {
    const loadingOverlay = document.getElementById('loading-overlay');
    try {
        loadingOverlay.classList.remove('hidden');

        const uf = document.getElementById("uf").value;
        const city = document.getElementById("city").value;
        const station = document.getElementById("station").value;
        const group = window.getSelectedDiseases(); 
        let startDate = document.getElementById("start-date").value;
        let endDate = document.getElementById("end-date").value;
        const inmet = document.getElementById("inmet").value;

        if (group.length === 0) {
            alert("Por favor, selecione pelo menos uma doença.");
            return;
        }

        if (endDate < startDate) {
            let aux = endDate;
            endDate = startDate;
            startDate = aux;
        }

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

        const resposta = await fetch(`${API_BASE_URL}/datasus`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uf, city, station, group, startDate, endDate, inmet, pop })
        });

        if (!resposta.ok) throw new Error(`Erro: ${resposta.status} - ${resposta.statusText}`);

        const dadosFiltrados = await resposta.json();
        console.log(dadosFiltrados);
        dadosExportacao = dadosFiltrados;
        atualizarGrafico(dadosFiltrados);

    } catch (erro) {
        console.error("Erro ao buscar dados:", erro);
        alert("Falha ao buscar dados. Verifique a conexão com o servidor.");
    } finally {
        loadingOverlay.classList.add('hidden');
    }
}

function atualizarGrafico(dados) {
    const selectElement = document.getElementById("inmet");
    const variavelSelecionada = selectElement.value;
    const descricaoVariavel = selectElement.selectedOptions[0].text;

    const labels = dados.map(item => {
        const dataFormatada = new Date(item.data);
        return dataFormatada.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    });

    const internacoes = dados.map(item => parseInt(item.valor));
    const valoresMeteorologicos = dados.map(item => {
        const valor = parseFloat(item[variavelSelecionada]);
        return isNaN(valor) ? null : valor;
    });

    if (internacoesChart) {
        internacoesChart.destroy();
    }

    const ctx = document.getElementById("internacoesChart").getContext("2d");
    
    // Configurações para igualar ao Figma (Background.jpg)
    internacoesChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Internações por doenças respiratórias",
                    data: internacoes,
                    borderColor: "#8B1A1A", // Vermelho escuro conforme o protótipo
                    backgroundColor: "#8B1A1A",
                    borderWidth: 3,         // Linha mais grossa
                    pointRadius: 0,         // Esconde os pontos conforme o design
                    pointHoverRadius: 6,    // Ponto aparece só ao passar o mouse
                    tension: 0.3,           // Curva suave na linha
                    fill: false,
                    yAxisID: "y1"
                },
                {
                    label: `Temperatura média (°C)`, // Ou o nome da variável selecionada
                    data: valoresMeteorologicos,
                    borderColor: "#00306E", // Azul marinho do projeto
                    backgroundColor: "#00306E",
                    borderWidth: 3,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    tension: 0.3,
                    fill: false,
                    yAxisID: "y2"
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    display: false,
                    position: 'top',
                    align: 'start', // Alinhado à esquerda como no Figma
                    labels: {
                        usePointStyle: true, // Bolinhas na legenda em vez de quadrados
                        pointStyle: 'rectRounded',
                        boxWidth: 12,
                        padding: 20,
                        font: {
                            size: 13,
                            weight: '500'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: '#1e293b',
                    padding: 12,
                    titleFont: { size: 14 },
                    bodyFont: { size: 13 },
                    cornerRadius: 8
                }
            },
            scales: {
                y1: {
                    type: "linear",
                    position: "left",
                    grid: {
                        color: "#f0f0f0", // Linhas de grade mais claras e sutis
                        drawBorder: false
                    },
                    title: { display: false } // O design usa rótulos verticais fixos
                },
                y2: {
                    type: "linear",
                    position: "right",
                    grid: {
                        display: false // Remove a grade da segunda escala para não poluir
                    },
                    title: { display: false }
                },
                x: {
                    grid: {
                        display: false // Remove linhas verticais
                    },
                    ticks: {
                        color: "#94a3b8" // Cor dos meses em cinza
                    }
                }
            }
        }
    });
}