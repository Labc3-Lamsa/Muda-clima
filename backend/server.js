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

app.get('/datasus', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM datasus LIMiT 10');
        res.json(resultado.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro no servidor.')
    }
});

app.listen(3000, () => console.log('API rodando na porta 3000'));