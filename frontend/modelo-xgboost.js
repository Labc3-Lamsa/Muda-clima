const form = document.getElementById('prediction-form');
/* Guarda o resultado da previsão */
const resultadoDiv = document.getElementById('resultado');

// Evento de submissão do formulário
form.addEventListener('submit', async (event) => {
// Previne que a página recarregue
    event.preventDefault(); 

    resultadoDiv.innerText = "Processando...";

    // Chama a função principal que rodará o modelo
    await runModel(); 
});

async function runModel() {
    try {
        // Tarefa 1: Criar a sessão de inferência com o modelo
        /* Carregar o modelo */
        /* const session = await ort.InferenceSession.create('./model.onnx'); */
        /* const session = await ort.InferenceSession.create('/modelos_XGboost_onnx_todas_cidades_pneumonia/São Paulo.onnx'); */
        // Pega o valor da cidade do input
        let cidade = document.getElementById('city').value;

        // Sanitiza o nome da cidade (substitui espaços por %20 ou _ conforme seu nome de arquivo)
        cidade = cidade.trim().replace(/\s+/g, '%20'); // ou use "_" se os nomes dos arquivos forem assim

        // Monta o caminho do modelo com base na cidade
        const modeloPath = `/modelos_XGboost_onnx_todas_cidades_pneumonia/${cidade}.onnx`;

        // Cria a sessão com o modelo correspondente
        const session = await ort.InferenceSession.create(modeloPath);



        // Pega a string da data
        const dataInput = document.getElementById('data').value;
        if (!dataInput) {
            resultadoDiv.innerText = "Por favor, selecione uma data.";
            return;
        }
        // Cria um objeto Date a partir do input 
        const data = new Date(dataInput); 

        const dia = data.getDate();     
        const mes = data.getMonth() + 1;
        const ano = data.getFullYear();

        /* ordem das variáveis */
        const featureNames = [
            'dia', 'mes', 'ano', 'cod_ibge', 'alti', 'lati', 'long',
            'pop_2000', 'pop_2010', 'pop_2021', 'Direcao_vento', 'Insolação',
            'num_dias_chuva', 'Precipitacao', 'Pressao_atmosferica', 'Radiacao_solar',
            'Temperatura_ar', 'Temperatura_ponto_orvalho', 'Temperatura_maxima',
            'Temperatura_minima', 'Umidade_relativa', 'Velocidade_vento',
            'Velocidade_rajada', 'y_lag_1', 'y_lag_2', 'y_lag_3', 'y_lag_4',
            'y_lag_5', 'y_lag_6', 'y_lag_7', 'y_lag_8', 'y_lag_9', 'y_lag_10',
            'y_lag_11', 'y_lag_12', 'y_lag_13', 'y_lag_14'
        ];

        // array com 37 posições (número de variáveis)
        const inputArray = new Array(37);

        /* array com os dados na ordem correta */
        /*IMPORTANTE: A ordem deve ser a mesma que o modelo foi treinado*/

        inputArray[0] = dia;
        inputArray[1] = mes;
        inputArray[2] = ano;

        // loop para preencher o array
        featureNames.slice(3).forEach((featureName, index) => {
            /* featureNames.forEach((featureName, index) => { */
            const valor = parseFloat(document.getElementById(featureName).value);
            inputArray[index + 3] = valor; // +3 para compensar as três primeiras variáveis (dia, mês e ano)
            /* inputArray[index] = valor; */
        });
                        
        /*Converte o array para um Float32Array  */
        const float32Data = new Float32Array(inputArray);

        /* Cria o tensor. O segundo argumento é o "shape" (número de variáveis)*/
        const tensor = new ort.Tensor('float32', float32Data, [1, 37]);

        console.log("Tensor criado:", tensor);

        // Tarefa 3: Executar o modelo com os dados
        /* O nome 'float_input' deve corresponder à entrada do modelo */
        const feeds = { float_input: tensor };
        /* resultado da previsão*/
        const results = await session.run(feeds);

        // Tarefa 4: Exibir o resultado
        /* inspensionar o modelo e checar o output em https://netron.app/*/
        const previsao = results.variable.data[0];
        resultadoDiv.innerText = `Estimativa do número de internações por pneumonia: ${previsao.toFixed(4)}`;

        console.log("Função runModel foi chamada.");

        } catch (e) {
            resultadoDiv.innerText = `Ocorreu um erro: ${e}.`;
            console.error(e);
        }
}
