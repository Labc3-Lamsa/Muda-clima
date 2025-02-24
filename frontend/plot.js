async function fetchData() {
    try {
        const response = await fetch('http://localhost:3000/datasus');
        const data = await response.json();

        const labels = data.map(item => item.id); // Nomes no eixo X
        const valores = data.map(item => item.cod_ibge); // Idades no eixo Y

        const ctx = document.getElementById('plot-2d').getContext('2d');
        new Chart(ctx, {
            type: 'bar', // Tipo do gráfico (pode ser 'line', 'pie', etc.)
            data: {
                labels: labels,
                datasets: [{
                    label: 'Idade das Pessoas',
                    data: valores,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    } catch (error) {
        console.error("Erro ao buscar dados:", error);
    }
}

/*
<script>  // Dados fictícios (substitua por dados reais do seu banco)
            const labels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
            const internacoes = [120, 150, 180, 200, 220, 300, 280, 260, 230, 190, 160, 140];
            const temperatura = [30, 29, 28, 25, 22, 18, 17, 18, 20, 24, 27, 29];
    
            // Configuração do gráfico
            const ctx = document.getElementById("plot-2d").getContext("2d");
            const internacoesChart = new Chart(ctx, {
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
                            label: "Temperatura Média (°C)",
                            data: temperatura,
                            borderColor: "blue",
                            backgroundColor: "rgba(0, 0, 255, 0.2)",
                            borderWidth: 2,
                            fill: false,
                            yAxisID: "y2"
                        }
                    ]
                },
                options: {
                    responsive: true,
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
            }); </script> <!-- Chama a função ao carregar a página -->

*/