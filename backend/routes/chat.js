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
    const normalized = normalizeTexto(message);
    let best = null, bestScore = 0;
    for (const intent of base.intencoes) {
        for (const gatilho of intent.gatilhos) {
            const score = similarity(normalized, normalizeTexto(gatilho));
            // palavra-chave exata
            const hasKeyword = intent.gatilhos.some(g =>
                normalized.includes(normalizeTexto(g))
            );
            //se sim ele aumenta o score
            const finalScore = hasKeyword ? Math.max(score, 0.7) : score;
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
});



module.exports = router;