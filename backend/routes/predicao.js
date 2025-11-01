const express = require('express');
const router = express.Router();

function createMunicipiosRouter(pool) {
    router.get('/cidade-info/:cidade', async (req, res) => {
        const { cidade } = req.params;

        try {
            const queryText = `
                SELECT 
                    cod_ibge, 
                    lati, 
                    long, 
                    pop_2000, 
                    pop_2010, 
                    pop_2021
                FROM 
                    municipios 
                WHERE 
                    nome_munic ILIKE $1
                LIMIT 1;
            `;
            
            const resultado = await pool.query(queryText, [cidade]);

            if (resultado.rows.length > 0) {
                res.json(resultado.rows[0]);
            } else {
                res.status(404).json({ mensagem: "Cidade não encontrada" });
            }

        } catch (err) {
            console.error("Erro ao buscar informações da cidade:", err);
            res.status(500).send('Erro no servidor.');
        }
    });
    
    return router;
}

module.exports = createMunicipiosRouter;