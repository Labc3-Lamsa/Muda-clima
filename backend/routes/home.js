const express = require('express');
const router = express.Router();
const path = require('path');

function redirect_home(){
    router.get('/home', (req, res) => {
        res.sendFile(path.join(__dirname, "../../frontend/html/home.html"));
    });
    
    return router;
}

module.exports = redirect_home;