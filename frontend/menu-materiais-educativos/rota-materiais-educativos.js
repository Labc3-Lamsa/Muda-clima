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

     //Rota para o arquivo do jogo caça-palavras
    router.get('/7-Erros-Parque.png', (req, res) => {
        res.sendFile(path.join(__dirname, "../../materiais-educativos/jogos/7-Erros-Parque.png"));
    });  
    
    //Rota para o arquivo do jogo caça-palavras
    router.get('/Caca-palavras.pdf', (req, res) => {
        res.sendFile(path.join(__dirname, "../../materiais-educativos/jogos/Caca-palavras.pdf"));
    });
    
    // Rota para o arquivo do jogo de cruzadinha
    router.get('/Cruzadinha-Facil-Intermediaria.pdf', (req, res) => {
        res.sendFile(path.join(__dirname, "../../materiais-educativos/jogos/Cruzadinha-Facil-Intermediaria.pdf"));
    });
    
    // Rota para o arquivo do jogo de desafio
    router.get('/Desafio-Ilustrado-Final.pdf', (req, res) => {
        res.sendFile(path.join(__dirname, "../../materiais-educativos/jogos/Desafio-Ilustrado-Final.pdf"));
    });

    // Rota para o arquivo do jogo da memória
    router.get('/Jogo-memoria.pdf', (req, res) => {
        res.sendFile(path.join(__dirname, "../../materiais-educativos/jogos/Jogo-memoria.pdf"));
    });

    // Rota para o arquivo do jogo dos patruleiros do ar
    router.get('/Patrulheiros-do-Ar-jogos.pdf', (req, res) => {
        res.sendFile(path.join(__dirname, "../../materiais-educativos/jogos/Patrulheiros-do-Ar-jogos.pdf"));
    });

    // Rota para o arquivo do gabarito dos patruleiros do ar
    router.get('/Respostas-Patrulheiros-do-Ar.pdf', (req, res) => {
        res.sendFile(path.join(__dirname, "../../materiais-educativos/jogos/Respostas-Patrulheiros-do-Ar.pdf"));
    });



    return router;
}

module.exports = redirect_materiais_educativos;