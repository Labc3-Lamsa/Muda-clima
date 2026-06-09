const express = require('express');
const router = express.Router();
const path = require('path');

function redirect_materiais_educativos(){
    // Rota para a página de materiais educativos
    router.get('/materiais-educativos', (req, res) => {
        res.sendFile(path.join(__dirname, "../../frontend/html/materiais-educativos.html"));
    });

    // Rota para a página de atividades
    router.get('/atividades.html', (req, res) => {
        res.sendFile(path.join(__dirname, "../../frontend/menu-materiais-educativos/atividades.html"));
    });

    // Rota para a página de jogos
    router.get('/jogos.html', (req, res) => {
        res.sendFile(path.join(__dirname, "../../frontend/menu-materiais-educativos/jogos.html"));
    });

    ////////////////////////////////////////
    // Rotas para os arquivos das atividades 
    ////////////////////////////////////////

    // Rota para o arquivo Ações de extensão
    router.get('/Acoes-extensao.pdf', (req, res) => {
        res.sendFile(path.join(__dirname, "../../materiais-educativos/extensao/Acoes-extensao.pdf"));
    });

    //Rota para o arquivo PDF da cartilha
    router.get('/Cartilha.pdf', (req, res) => {
        res.sendFile(path.join(__dirname, "../../materiais-educativos/cartilhas/Cartilha.pdf"));
    });
        
    // Rota para o arquivo PDF da atividade de ligar os pontos
    router.get('/Atividade-ligar-pontos.pdf', (req, res) => {
        res.sendFile(path.join(__dirname, "../../materiais-educativos/atividades/Atividade-ligar-pontos.pdf"));
    }); 
    
    //Rota para o arquivo PDF da atividade de colorir
    router.get('/Atividade-colorir.pdf', (req, res) => {
        res.sendFile(path.join(__dirname, "../../materiais-educativos/atividades/Atividade-colorir.pdf"));
    });
    
    //Rota para o arquivo DOCX da atividade de colorir
    router.get('/Atividade-colorir.docx', (req, res) => {
        res.sendFile(path.join(__dirname, "../../materiais-educativos/atividades/Atividade-colorir.docx"));
    }); 
    
    //Rota para o arquivo PDF da atividade de completar
    router.get('/Atividade-completar.pdf', (req, res) => {
        res.sendFile(path.join(__dirname, "../../materiais-educativos/atividades/Atividade-completar.pdf"));
    });    
    
    //Rota para o arquivo DOCX da atividade de completar
    router.get('/Atividade-completar.docx', (req, res) => {
        res.sendFile(path.join(__dirname, "../../materiais-educativos/atividades/Atividade-completar.docx"));
    });    
       
    //Rota para o arquivo de gabarito
    router.get('/Gabarito.pdf', (req, res) => {
        res.sendFile(path.join(__dirname, "../../materiais-educativos/atividades/Gabarito.pdf"));
    });

    ////////////////////////////////////////
    // Rotas para os arquivos dos jogos 
    ////////////////////////////////////////

    return router;
}

module.exports = redirect_materiais_educativos;