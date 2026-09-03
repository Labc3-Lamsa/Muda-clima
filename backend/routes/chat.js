const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const baseConhecimento = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/base-conhecimento.json'))); //ler base

console.log(baseConhecimento);



function normalizeTexto(text) {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, "");// tira acentos e pontuacao
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

    // teste
    return res.json({
        reply: "Mensagem recebida!",
        sessionId: req.sessionID
    });
});



module.exports = router;