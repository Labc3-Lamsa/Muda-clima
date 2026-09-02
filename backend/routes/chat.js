const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const baseConhecimento = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/base-conhecimento.json'))); //ler base

console.log(baseConhecimento);

module.exports = router;