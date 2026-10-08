const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const LOG_PATH = path.join(__dirname, '../chat_logs.jsonl');

//salvar log de conversas
function logConversation(sessionId, message, reply, intentId) {
    const entry = JSON.stringify({
        timestamp: new Date().toISOString(),
        sessionId,
        intentId,
        message,
        reply
    });
    fs.appendFile(LOG_PATH, entry + '\n', (err) => {
        if (err) console.error('erro ao gravar log:', err.message);
    });
}

const baseConhecimento = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/base-conhecimento.json'))); //ler base

console.log(baseConhecimento);



function normalizeTexto(text) {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, "");// tira acentos e pontuacao
}

//mesmo algoritmo de antes
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

//funcao que procura gatilho, similarity calcula parecido e haskeyword verifica se tem palavra exata
function detectIntent(message, base) {
    const normalized = normalizeTexto(message).trim();
    const words = normalized.split(/\s+/);
    let best = null, bestScore = 0;

    for (const intent of base.intencoes) {
        for (const gatilho of intent.gatilhos) {
            const gatilhoNorm = normalizeTexto(gatilho);

            // match exato da mensagem inteira (ex: "oi", "olá", "vlw")
            const exactFullMatch = normalized === gatilhoNorm;

            // palavra exata contida na mensagem (ex: "oi" em "oi tudo bem")
            const hasKeyword = intent.gatilhos.some(g => {
                const gn = normalizeTexto(g);
                // para palavras curtas (≤ 4 chars), compara palavra a palavra
                if (gn.length <= 4) {
                    return words.includes(gn);
                }
                return normalized.includes(gn);
            });

            const score = similarity(normalized, gatilhoNorm);
            let finalScore = score;

            if (exactFullMatch) finalScore = 1.0;
            else if (hasKeyword) finalScore = Math.max(score, 0.75);

            if (finalScore > bestScore) { bestScore = finalScore; best = intent; }
        }
    }
    return { intent: best, score: bestScore };
}


const OLLAMA_HOST = (process.env.OLLAMA_HOST || 'http://localhost:11434').replace(/\/$/, '');
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';
const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS) || 60000;

// prompt
function buildPrompt(pageContext) {
    return `Você é o assistente virtual do projeto ClimArS da FURG.
Responda SEMPRE em português brasileiro, de forma clara e amigável.
Você conhece o site climars.furg.br e suas ferramentas.

PÁGINAS DO SITE:
- Início: objetivo e fontes de dados
- Gráficos: filtros por UF, cidade, estação, 14 doenças, período. Exporta CSV/XLSX/PDF/PNG
- Previsões Mensais: modelo Shiny (R)
- Previsões Múltiplas: XGBoost, 644 cidades, 14 doenças, previsão diária
- Tutoriais, Materiais Educativos, Publicações

FONTES DE DADOS: SIH/DATASUS, INMET (273 estações), IEMA
PERÍODO: 2000 a 2023
PÁGINA ATUAL DO USUÁRIO: ${pageContext || 'desconhecida'}

REGRAS:
- Respostas curtas (máximo 3 parágrafos)
- Use emojis com moderação
- Não invente dados; se não souber, diga que não tem a informação
- Mencione as páginas do menu quando for relevante para navegar
- Não responda perguntas fora do tema ou do escopo do site`;
}

// chamada para o ollama
async function callOllama(message, history, pageContext) {
    const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: OLLAMA_MODEL,
            stream: false, // resposta completa de uma vez
            messages: [
                { role: 'system', content: buildPrompt(pageContext) },
                ...(history || []).slice(-6),
                { role: 'user', content: message }
            ],
            options: {
                num_predict: 200,      // limita a resposta a ~150-200 palavras
                num_ctx: 2048,         // contexto menor gasta menos memória
                temperature: 0.3       // resposta mais direta e focada
            },
            keep_alive: "60m"          // não descarrega o modelo da memória
        }),
        signal: AbortSignal.timeout(OLLAMA_TIMEOUT_MS)
    });

    if (!response.ok) throw new Error(`Ollama HTTP ${response.status}: ${await response.text()}`);
    const data = await response.json();
    return data.message?.content || '';
}

router.post("/chat", async (req, res) => {
    const { message, paginaAtual } = req.body;

    if (!message || typeof message !== 'string') {
        return res.status(400).json({ reply: "Envie uma mensagem válida." });
    }

    if (!req.session.history) {
        req.session.history = [];
    }
    req.session.lastActivity = Date.now();

    req.session.history.push({ role: "user", content: message });

    console.log("sessionId:", req.sessionID, "| paginaAtual:", paginaAtual || 'não informada');

    // 1. tenta a base de conhecimento
    const { intent, score } = detectIntent(message, baseConhecimento);

    if (score >= 0.55 && intent) {
        req.session.history.push({ role: 'assistant', content: intent.resposta });
        logConversation(req.sessionID, message, intent.resposta, intent.id);
        return res.json({ reply: intent.resposta, sugestoes: intent.sugestoes || [] });
    }

    // 2. fallback: ollama
    try {
        const reply = await callOllama(message, req.session.history, paginaAtual);
        if (reply) {
            req.session.history.push({ role: 'assistant', content: reply });
            logConversation(req.sessionID, message, reply, 'ollama_fallback');
            return res.json({ reply, sugestoes: [] });
        }
    } catch (err) {
        console.error('Ollama indisponível:', err.message);
        return res.json({
            reply: 'Não consegui processar sua pergunta agora. Tente novamente em instantes. 😕',
            sugestoes: ['O que é o ClimArS?', 'Como usar os gráficos?']
        });
    }

    // fallback padrão se não houver resposta
    const fallback = "Não consegui processar sua pergunta agora. Tente novamente em instantes. 😕";
    logConversation(req.sessionID, message, fallback, "fallback");
    return res.json({
        reply: fallback,
        sugestoes: [
            "O que é o ClimArS?",
            "Como usar os gráficos?",
            "Como funciona a previsão?"
        ]
    });
});

module.exports = router;