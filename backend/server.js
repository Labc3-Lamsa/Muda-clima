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
    const { uf, city, station, group, startDate, endDate, inmet, pop } = req.body;
    
    try {
        const queryText = `
            SELECT 
                m.nome_munic, 
                m.uf, 
                m.${pop}, 
                d.data, 
                SUM(d.valor) AS valor,
                -- As colunas de estação e inmet podem ser NULL se não houver correspondência
                e.cod_estacao, 
                i.${inmet}
            FROM municipios m 
            -- A tabela datasus é a nossa base, então o join com municipios é mantido
            JOIN datasus d ON m.cod_ibge = d.cod_ibge 

            LEFT JOIN estacoes e ON d.cod_ibge = e.cod_ibge 
                                  -- MUDANÇA 2: A condição do filtro da estação vem para o ON
                                  AND e.cod_estacao ILIKE $3
            
            LEFT JOIN inmet i ON e.cod_estacao = i.cod_estacao
                              -- MUDANÇA 2: A condição de data também vem para o ON
                              AND d.data = i.data
            
            WHERE 
                m.nome_munic ILIKE $2 
                AND m.uf = $1 
                -- As condições dos LEFT JOINs foram movidas para os seus respectivos ON
                AND d.data BETWEEN $5 AND $6
                AND d.cod_grupo = ANY($4)
            GROUP BY 
                m.nome_munic, 
                m.uf, 
                m.${pop}, 
                d.data, 
                e.cod_estacao, -- Agrupamos por elas mesmo que possam ser NULL
                i.${inmet}
            ORDER BY 
                d.data ASC;
        `;

        const queryParams = [uf, city, station, group, startDate, endDate];
        const resultado = await pool.query(queryText, queryParams);

        res.json(resultado.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro no servidor.')
    }
});

const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/front-page.html'));
});
app.listen(3000, () => console.log('API rodando na porta 3000'));