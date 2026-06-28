const express = require('express');
const router = express.Router();
const path = require('path');

function redirect_publicacoes(){
    router.get('/publicacoes', (req, res) => {
        res.sendFile(path.join(__dirname, "../../frontend/html/publicacoes.html"));
    });
    
    return router;
}

module.exports = redirect_publicacoes;