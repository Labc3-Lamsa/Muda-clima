process.env.PATH += ":/usr/bin:/usr/local/bin";

const express = require('express');
const cors = require('cors');
const app = express();
const { Pool } = require('pg');
const path = require('path');

const createMunicipiosRouter = require('./routes/predicao.js');
const redirect_home = require('./routes/home.js');

//Dependências para o chatbot ===
const fs = require('fs');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

//===============================

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'mudaclima',
    password: 'admin',
    port: 5432,
})

app.use(cors());
app.use(express.json());

const municipiosRouter = createMunicipiosRouter(pool);
const homeRouter = redirect_home();

app.use(municipiosRouter);
app.use(homeRouter);


// Rota para obter todas as UFs
app.get('/ufs', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT DISTINCT uf FROM municipios ORDER BY uf;');
        res.json(resultado.rows.map(row => row.uf));
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro no servidor');
    }
});

// Rota para obter cidades por UF digitada
app.get('/cidades/:uf', async (req, res) => {
    const { uf } = req.params;
    
    try {
        const resultado = await pool.query('SELECT nome_munic FROM municipios WHERE uf = $1 ORDER BY nome_munic;', [uf]);
        res.json(resultado.rows.map(row => row.nome_munic));
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro no servidor');
    }
});

// Rota para obter as estações climáticas por cidade digitada
app.get('/estacoes/:cidade', async (req, res) => {
    const { cidade } = req.params;

    try {
        const resultado = await pool.query(`SELECT * FROM municipios m join estacoes e on m.cod_ibge = e.cod_ibge 
                                            WHERE m.nome_munic ILIKE $1;`, [cidade]);
        res.json(resultado.rows.map(row => row.cod_estacao));
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro no servidor');
    }
});

// Endpoint para pegar os dados do postgresql filtrados
app.post('/datasus', async (req, res) => {
    console.log(req.body); // DEBUG
    const { uf, city, station, group, startDate, endDate, inmet, pop } = req.body;
    
    try {
        const queryText = `
            SELECT 
                m.nome_munic, 
                m.uf, 
                m.${pop}, 
                d.data, 
                SUM(d.valor) AS valor,
                -- As colunas de estação e inmet podem ser NULL se não houver correspondência
                e.cod_estacao, 
                i.${inmet}
            FROM municipios m 
            -- A tabela datasus é a nossa base, então o join com municipios é mantido
            JOIN datasus d ON m.cod_ibge = d.cod_ibge 

            LEFT JOIN estacoes e ON d.cod_ibge = e.cod_ibge 
                                  -- MUDANÇA 2: A condição do filtro da estação vem para o ON
                                  AND e.cod_estacao ILIKE $3
            
            LEFT JOIN inmet i ON e.cod_estacao = i.cod_estacao
                              -- MUDANÇA 2: A condição de data também vem para o ON
                              AND d.data = i.data
            
            WHERE 
                m.nome_munic ILIKE $2 
                AND m.uf = $1 
                -- As condições dos LEFT JOINs foram movidas para os seus respectivos ON
                AND d.data BETWEEN $5 AND $6
                AND d.cod_grupo = ANY($4)
            GROUP BY 
                m.nome_munic, 
                m.uf, 
                m.${pop}, 
                d.data, 
                e.cod_estacao,
                i.${inmet}
            ORDER BY 
                d.data ASC;
        `;

        const queryParams = [uf, city, station, group, startDate, endDate];
        const resultado = await pool.query(queryText, queryParams);

        res.json(resultado.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro no servidor.')
    }
});

app.use(express.static(path.join(__dirname, '../frontend')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/home.html'));
});

app.get('/frontpage', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/front-page.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'dashboard.html'));
});

// Rota para a pasta "modelos-XGboost" como arquivos estáticos
app.use('/modelos_XGboost_onnx_todas_cidades_pneumonia', express.static(path.join(__dirname, '../modelos_XGboost_onnx_todas_cidades_pneumonia')));

app.use(express.static(path.join(__dirname, '../frontend')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../frontend/html/home.html')));

// =======================================================
// =======================================================
// =======================================================

let saudacaoEnviada = false;

function similarity(a, b) {
    a = a.toLowerCase();
    b = b.toLowerCase();

    if (a.length < 2 || b.length < 2) return 0;

    const bigrams = new Map();
    for (let i = 0; i < a.length - 1; i++) {
        const gram = a.substring(i, i + 2);
        bigrams.set(gram, (bigrams.get(gram) || 0) + 1);
    }

    let intersection = 0;
    for (let i = 0; i < b.length - 1; i++) {
        const gram = b.substring(i, i + 2);
        if (bigrams.get(gram)) {
            intersection++;
            bigrams.set(gram, bigrams.get(gram) - 1);
        }
    }

    return (2.0 * intersection) / (a.length + b.length - 2);
}

app.post("/chat", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || typeof message !== "string") {
            return res.status(400).json({ reply: "Envie o campo 'message' no corpo da requisição." });
        }

        const faqs = [

            { k: ["modelo de previsão", "modelo"], a: "É um sistema de IA que estima internações por pneumonia usando clima, população e histórico." },
            { k: ["para que serve"], a: "Ajuda a prever aumento de internações e apoiar o planejamento em saúde pública." },
            { k: ["quem desenvolveu", "quem criou"], a: "Foi desenvolvido em ambiente de pesquisa usando dados públicos." },
            { k: ["ministério da saúde"], a: "Não. É um projeto experimental, sem caráter oficial." },
            { k: ["dados públicos"], a: "Sim! Os dados vêm do DataSUS e do INMET." },
            { k: ["usa ia"], a: "Sim, ele utiliza aprendizado de máquina para prever internações." },
            { k: ["aprende sozinho"], a: "Não aprende automaticamente. Precisa ser reprocessado com novos dados." },
            { k: ["atualiza automaticamente"], a: "Não. As atualizações são feitas manualmente quando há novos dados." },
            { k: ["pode errar"], a: "Sim. Como toda previsão, existe margem de erro." },
            { k: ["é seguro"], a: "É confiável como tendência geral, mas não substitui decisões médicas." },
            { k: ["como fazer previsão"], a: "Informe município, data, clima e internações dos últimos 14 dias e clique em 'Gerar Previsão'." },
            { k: ["quais dados preciso"], a: "Município, data, clima e internações dos 14 dias anteriores." },
            { k: ["dados de clima"], a: "Eles são preenchidos automaticamente ou podem ser informados manualmente." },
            { k: ["campo em branco"], a: "O ideal é preencher tudo, mas campos podem ficar como 0." },
            { k: ["número errado"], a: "A previsão pode ficar imprecisa se os dados forem irreais." },
            { k: ["interpretar"], a: "O valor mostrado é a estimativa de internações para o dia escolhido." },
            { k: ["diária"], a: "A previsão é diária, para o dia informado." },
            { k: ["comparar cidades"], a: "Sim! Cada cidade tem seu próprio modelo, e os resultados podem ser comparados." },
            { k: ["erro médio"], a: "O erro médio é de cerca de 0,8 caso por dia." },
            { k: ["cidades grandes"], a: "Cidades grandes têm mais variabilidade, aumentando o erro." },
            { k: ["melhor resultado"], a: "Caruaru (PE), Trindade (PE) e Porto Seguro (BA) tiveram os melhores resultados." },
            { k: ["quantas cidades"], a: "644 cidades tinham dados completos e foram incluídas." },
            { k: ["não aparece"], a: "Ela pode não ter dados climáticos ou de saúde suficientes." },
            { k: ["cidades não incluídas"], a: "13 cidades ficaram de fora por dados incompletos." },
            { k: ["quando será adicionada"], a: "Quando houver dados suficientes de clima e saúde para treinar o modelo." },
            { k: ["quais variáveis"], a: "Temperatura, umidade, chuva, vento, pressão, radiação e população." },
            { k: ["clima da minha cidade"], a: "Usa dados históricos do INMET." },
            { k: ["xgboost"], a: "É um algoritmo de aprendizado de máquina baseado em árvores de decisão." },
            { k: ["rede neural"], a: "Não usa redes neurais — usa árvores com boosting." },
            { k: ["regressor"], a: "Significa que prevê números contínuos, como casos por dia." },
            { k: ["quantos dados foram usados"], a: "Foram usados 5,2 milhões de registros de 2000 a 2023." },
            { k: ["dados faltantes"], a: "O XGBoost lida automaticamente com valores nulos." },
            { k: ["prevê surtos"], a: "Ele prevê internações diárias, o que pode indicar tendência." },
            { k: ["previsão aumenta"], a: "Pode indicar aumento de risco." },
            { k: ["casos ou porcentagem"], a: "A previsão é em número de casos (internações)." },
            { k: ["substitui médicos"], a: "Não — é apenas apoio à decisão." },
            { k: ["modelo erra"], a: "Pode errar devido a fatores imprevisíveis." },
            { k: ["poluição"], a: "Ainda não. Só clima e população." },
            { k: ["período usado", "treinamento"], a: "Treino: 2000–2022 | Teste: 2023." },
            { k: ["campos do formulário"], a: "São dados da cidade, data, clima e internações anteriores." },
            { k: ["como é gerada a previsão"], a: "O sistema envia os dados ao modelo e exibe a previsão." },
            { k: ["terminou o cálculo"], a: "O resultado aparece assim que o processamento termina." },
            { k: ["offline"], a: "Não. O modelo precisa de conexão com o servidor para realizar os cálculos." }
        ];

        const userMsg = message.toLowerCase();

        let bestMatch = null;
        let bestScore = 0;

        for (const f of faqs) {
            for (const kw of f.k) {
                const score = similarity(userMsg, kw);
                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = f;
                }
            }
        }

        if (bestScore >= 0.45 && bestMatch) {
            return res.json({ reply: bestMatch.a });
        }

        const agradecimentos = ["obrigado", "obrigada", "valeu", "agradeço", "brigado", "brigada", "obg", "vlw"];
        if (agradecimentos.some(p => userMsg.includes(p))) {
            return res.json({ reply: "De nada! 😊 Fico feliz em ajudar." });
        }

        const cumprimentos = ["oi", "olá", "ola", "bom dia", "boa tarde", "boa noite", "eae", "eai"];
        if (!saudacaoEnviada && cumprimentos.some(p => userMsg.includes(p))) {
            saudacaoEnviada = true;
            return res.json({ reply: "Olá, bem-vindo ao ClimArS! Como posso ajudar? 😊" });
        }

        const systemPrompt = `
Você é o chatbot do projeto ClimaArs.
Responda sempre em português, de forma curta, simpática e direta.
Importante: NÃO diga "olá" nem "bem-vindo" se já tiver cumprimentado antes.

Páginas do site:
- Home: mostra o objetivo do projeto e as fontes de dados.
- Gráfico: permite escolher UF, cidade, estação, doenças e datas.
- Predição: usa modelos de machine learning para prever internações.

Quando o usuário perguntar como navegar:
“O site tem Home, Gráficos e Predição — cada parte mostra dados e previsões.”

Quando perguntar sobre gráficos:
“Na aba Gráfico você escolhe cidade, estação e doença, depois clica em Filtrar. Pode exportar também.”

Importante:
O usuário só pode exportar em CSV, XLSX, PDF e PNG. 
Se perguntarem sobre outros formatos, explique que apenas esses quatro estão disponíveis.
O site foi desenvolvido pela Universidade Federal do Rio Grande - FURG.

Use respostas curtas. Alguns emojis são ok. 😊📊

Contexto da conversa:
Usuário: ${message}
`;


        const { spawn } = require("child_process");

        const ollama = spawn("ollama", ["run", "llama3"]);

        let reply = "";

        ollama.stdin.write(systemPrompt);
        ollama.stdin.end();

        ollama.stdout.on("data", (data) => {
            reply += data.toString();
        });

        ollama.stderr.on("data", (data) => {
            console.error("Ollama stderr:", data.toString());
        });

        ollama.on("close", () => {
            reply = reply.trim();

            if (saudacaoEnviada) {
                reply = reply
                    .replace(/^olá[,! ]/i, "")
                    .replace(/bem[- ]?vindo[^.!\n]/i, "")
                    .trim();
            }

            res.json({ reply });
        });

    } catch (err) {
        console.error("Erro no chatbot:", err);
        res.status(500).json({ reply: "Erro no servidor do chat." });
    }
});

app.listen(3000, '0.0.0.0', () => console.log('API rodando na porta 3000'));