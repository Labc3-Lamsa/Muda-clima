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

app.post('/datasus', async (req, res) => {
    const { startDate } = req.body;
    
    try {
        const resultado = await pool.query(`SELECT m.nome_munic, m.uf, m.pop_2000, d.cod_grupo, d.data, d.valor FROM municipios m 
                                            JOIN datasus d ON m.cod_ibge = d.cod_ibge WHERE (m.nome_munic ILIKE 'Rio grande%' 
                                            AND m.uf = 'RS' AND cod_grupo = 4 
                                            AND (data >= $1 AND data < ($1::DATE + INTERVAL '1 month'))) 
                                            ORDER BY data ASC LIMIT 400;`, [startDate]);
        res.json(resultado.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro no servidor.')
    }
});

app.listen(3000, () => console.log('API rodando na porta 3000'));