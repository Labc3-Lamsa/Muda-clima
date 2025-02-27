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

// Endpoint para pegar os dados do postgresql filtrados
app.post('/datasus', async (req, res) => {
    console.log(req.body); // DEBUG
    const { uf, city, startDate, interval } = req.body;
    
    try {
        const resultado = await pool.query(`SELECT m.nome_munic, m.uf, m.pop_2000, d.cod_grupo, d.data, d.valor FROM municipios m 
                                            JOIN datasus d ON m.cod_ibge = d.cod_ibge WHERE (m.nome_munic ILIKE $2 
                                            AND m.uf = $1 AND cod_grupo = 4 
                                            AND (data >= $3 AND data < ($3::DATE + ($4 || ' month')::INTERVAL)))
                                            ORDER BY data ASC LIMIT 400;`, [uf, city, startDate, interval]);
        res.json(resultado.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro no servidor.')
    }
});

app.listen(3000, () => console.log('API rodando na porta 3000'));