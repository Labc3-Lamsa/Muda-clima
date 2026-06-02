const express = require('express');
const router = express.Router();
const path = require('path');

function redirect_materiais_educativos(){
    router.get('/materiais-educativos', (req, res) => {
        res.sendFile(path.join(__dirname, "../../frontend/html/materiais-educativos.html"));
    });
    
    return router;
}

module.exports = redirect_materiais_educativos;