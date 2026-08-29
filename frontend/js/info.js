import { API_BASE_URL } from "../utils/config.js";

// Função para buscar e preencher dados da cidade
async function carregarInfoCidade() {
    const cidade = document.getElementById('city').value.trim();

    const campos = {
        cod_ibge: document.getElementById('cod_ibge'),
        lati: document.getElementById('lati'),
        long: document.getElementById('long'),
        pop_2000: document.getElementById('pop_2000'),
        pop_2010: document.getElementById('pop_2010'),
        pop_2021: document.getElementById('pop_2021')
    };

    if (!cidade) {
        for (let id in campos) {
            if (campos[id]) campos[id].value = '';
        }
        return;
    }

    if (campos.cod_ibge) {
        try {
            const resposta = await fetch(`${API_BASE_URL}/cidade-info/${cidade}`);
            if (!resposta.ok) throw new Error('Cidade não encontrada');
            
            const data = await resposta.json();

            campos.cod_ibge.value = data.cod_ibge;
            campos.lati.value = data.lati;
            campos.long.value = data.long;
            campos.pop_2000.value = data.pop_2000;
            campos.pop_2010.value = data.pop_2010;
            campos.pop_2021.value = data.pop_2021;

        } catch (error) {
            console.error("Falha ao carregar informações da cidade:", error);
            for (let id in campos) {
                if (campos[id]) campos[id].value = '';
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const cidadeInput = document.getElementById('city');

    if (cidadeInput) {
        cidadeInput.addEventListener('change', carregarInfoCidade);
    }
});