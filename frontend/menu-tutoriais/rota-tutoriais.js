const express = require('express');
const router = express.Router();
const path = require('path');

function redirect_tutoriais(){
    router.get('/tutoriais', (req, res) => {
        res.sendFile(path.join(__dirname, "../../frontend/html/tutoriais.html"));
    });


    router.get('/tutorial-graficos.pdf', (req, res) => {
        res.sendFile(path.join(__dirname, "../../frontend/menu-tutoriais/tutorial-graficos.pdf"));
    });

    router.get('/tutorial-previsao-mensal.pdf', (req, res) => {
        res.sendFile(path.join(__dirname, "../../frontend/menu-tutoriais/tutorial-previsao-mensal.pdf"));
    });

    router.get('/tutorial-previsao-multipla.pdf', (req, res) => {
        res.sendFile(path.join(__dirname, "../../frontend/menu-tutoriais/tutorial-previsao-multipla.pdf"));
    });
    
    return router;
}

module.exports = redirect_tutoriais;