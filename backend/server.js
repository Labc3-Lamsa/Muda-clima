const express = require('express');
const cors = require('cors');
const app = express();
const { Pool } = require('pg');

app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'mudaclima',
    password: 'admin',
    port: 5432,
})

// Rota para obter todas as UFs
app.get('/ufs', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT DISTINCT uf FROM municipios ORDER BY uf;');
        res.json(resultado.rows.map(row => row.uf));
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro no servidor');
    }
});

// Rota para obter cidades por UF digitada
app.get('/cidades/:uf', async (req, res) => {
    const { uf } = req.params;
    
    try {
        const resultado = await pool.query('SELECT nome_munic FROM municipios WHERE uf = $1 ORDER BY nome_munic;', [uf]);
        res.json(resultado.rows.map(row => row.nome_munic));
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro no servidor');
    }
});

// Rota para obter as estações climáticas por cidade digitada
app.get('/estacoes/:cidade', async (req, res) => {
    const { cidade } = req.params;

    try {
        const resultado = await pool.query(`SELECT * FROM municipios m join estacoes e on m.cod_ibge = e.cod_ibge 
                                            WHERE m.nome_munic ILIKE $1;`, [cidade]);
        res.json(resultado.rows.map(row => row.cod_estacao));
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro no servidor');
    }
});

// Endpoint para pegar os dados do postgresql filtrados
app.post('/datasus', async (req, res) => {
    console.log(req.body); // DEBUG
    const { uf, city, station, group, startDate, interval, inmet, pop } = req.body;
    
    try {
        const resultado = await pool.query(`SELECT m.nome_munic, m.uf, m.${pop}, d.data, e.cod_estacao, d.valor, g.cid10, i.${inmet}  FROM municipios m 
                                            JOIN datasus d ON m.cod_ibge = d.cod_ibge 
                                            JOIN estacoes e ON d.cod_ibge = e.cod_ibge
                                            JOIN inmet i ON e.cod_estacao = i.cod_estacao
                                            JOIN grupos g ON d.cod_grupo = g.codigo
                                            WHERE (m.nome_munic ILIKE $2 AND m.uf = $1 AND d.cod_grupo = $4 AND e.cod_estacao ILIKE $3
                                            AND d.data = i.data AND (d.data >= $5 AND d.data < ($5::DATE + ($6 || ' month')::INTERVAL))) 
                                            ORDER BY d.data ASC;`, [uf, city, station, group, startDate, interval]);
        res.json(resultado.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro no servidor.')
    }
});

app.listen(3000, () => console.log('API rodando na porta 3000'));