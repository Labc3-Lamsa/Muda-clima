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


router.post("/chat", async (req, res) => {
    const { message, paginaAtual } = req.body;

    if (!req.session.history) {
        req.session.history = [];
    }
    req.session.lastActivity = Date.now();

    req.session.history.push({ role: "user", content: message });

    console.log("sessionId:", req.sessionID);
    console.log("histórico atual:", req.session.history);
    const { intent, score } = detectIntent(message, baseConhecimento);

    //se encontrar intencao responde
    if (score >= 0.55 && intent) {
        req.session.history.push({ role: 'bot', content: intent.resposta });
        logConversation(req.sessionID, message, intent.resposta, intent.id);
        return res.json({ reply: intent.resposta, sugestoes: intent.sugestoes || [] });
    }

    // fallback quando nenhuma intenção for encontrada
    const fallback = "Hmm, não entendi muito bem. 🤔 Pode reformular a pergunta? Estou aqui para ajudar com dúvidas sobre o ClimArS!";
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