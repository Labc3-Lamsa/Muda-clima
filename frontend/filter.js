import { API_BASE_URL } from "./utils/config.js";

// Carregar UFs ao iniciar a página
async function carregarUFs() {
    const resposta = await fetch(`${API_BASE_URL}/ufs`);
    const ufs = await resposta.json();

    const listaUFs = document.getElementById('ufs-list');
    listaUFs.innerHTML = '';

    ufs.forEach(uf => {
        listaUFs.innerHTML += `<option value="${uf}">`;
    });
}

// Buscar cidades da UF digitada
async function carregarCidades() {
    const uf = document.getElementById('uf').value.trim().toUpperCase();
    const cidadeInput = document.getElementById('city');
    const listaCidades = document.getElementById('cities-list');

    if (!uf) {
        cidadeInput.disabled = true;
        listaCidades.innerHTML = '';
        return;
    }

    const resposta = await fetch(`${API_BASE_URL}/cidades/${uf}`);
    const cidades = await resposta.json();

    // Preencher o <datalist> com as cidades da UF digitada
    listaCidades.innerHTML = '';
    cidades.forEach(cidade => {
        listaCidades.innerHTML += `<option value="${cidade}">`;
    });

    cidadeInput.disabled = false;
}

async function carregarEstacoes() {
    const cidade = document.getElementById('city').value.trim();
    const selectEstacao = document.getElementById('station');

    if (!cidade) {
        selectEstacao.innerHTML = '<option value="">Escolha uma estação</option>';
        selectEstacao.disabled = true;
        return;
    }

    try {
        const resposta = await fetch(`${API_BASE_URL}/estacoes/${cidade}`);
        if (!resposta.ok) {
            throw new Error(`Erro na API: ${resposta.status}`);
        }
        const estacoes = await resposta.json();

        selectEstacao.innerHTML = '';

        if (estacoes.length === 0) {
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "Não há estação disponível";
            selectEstacao.appendChild(option);
            selectEstacao.disabled = true;
        } 
        else {
            const defaultOption = document.createElement('option');
            defaultOption.value = "";
            defaultOption.textContent = "Escolha uma estação";
            selectEstacao.appendChild(defaultOption);

            estacoes.forEach(estacao => {
                const option = document.createElement('option');
                option.value = estacao;
                option.textContent = estacao;
                selectEstacao.appendChild(option);
            });

            selectEstacao.disabled = false;
        }
    } catch (error) {
        console.error("Falha ao carregar estações:", error);
        selectEstacao.innerHTML = '<option value="">Erro ao carregar</option>';
        selectEstacao.disabled = true;
    }
}

document.addEventListener("DOMContentLoaded", () => {

    const allDiseases = [
        { value: "1", text: "Faringite aguda e amigdalite aguda - J02-J03" },
        { value: "2", text: "Laringite e traqueíte agudas - J04" },
        { value: "3", text: "Outras infecções agudas das vias aéreas superiores - J00-J01, J05-J06" },
        { value: "4", text: "Influenza - J09-J11" },
        { value: "5", text: "Pneumonia - J12-J18" },
        { value: "6", text: "Bronquite aguda e bronquiolite aguda - J20-J21" },
        { value: "7", text: "Sinusite crônica - J32" },
        { value: "8", text: "Outras doenças do nariz e dos seios paranasais - J30-J31, J33-J34" },
        { value: "9", text: "Doenças crônicas das amígdalas e das adenóides - J35" },
        { value: "10", text: "Outras doenças do trato respiratório superior - J22, J66-J99" },
        { value: "11", text: "Bronquite, enfisema e outras doenças pulmonares obstrutivas crônicas - J40-J44" },
        { value: "12", text: "Asma - J45-J46" },
        { value: "13", text: "Pneumoconiose - J60-J65" },
        { value: "14", text: "Outras doenças do aparelho respiratório - J36-J39" }
    ];

    let selectedDiseaseIds = [];

    const diseaseOptionsSelect = document.getElementById('disease-options');
    const addDiseaseBtn = document.getElementById('add-disease-btn');
    const selectedDiseasesContainer = document.getElementById('selected-diseases');

    function updateDiseaseUI() {
        selectedDiseasesContainer.innerHTML = '';
        diseaseOptionsSelect.innerHTML = '<option value="">Escolha uma doença...</option>';

        selectedDiseaseIds.forEach(id => {
            const disease = allDiseases.find(d => d.value === id);
            if (disease) {
                const tag = document.createElement('div');
                tag.className = 'disease-tag';
                tag.innerHTML = `
                    <span>${disease.text}</span>
                    <button class="remove-disease-btn" data-id="${disease.value}">×</button>
                `;
                selectedDiseasesContainer.appendChild(tag);
            }
        });

        const availableDiseases = allDiseases.filter(d => !selectedDiseaseIds.includes(d.value));
        availableDiseases.forEach(disease => {
            const option = document.createElement('option');
            option.value = disease.value;
            option.textContent = disease.text;
            diseaseOptionsSelect.appendChild(option);
        });

        addDiseaseBtn.disabled = availableDiseases.length === 0;
    }

    addDiseaseBtn.addEventListener('click', () => {
        const selectedValue = diseaseOptionsSelect.value;
        if (selectedValue && !selectedDiseaseIds.includes(selectedValue)) {
            selectedDiseaseIds.push(selectedValue);
            updateDiseaseUI();
        }
    });

    selectedDiseasesContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-disease-btn')) {
            const idToRemove = event.target.getAttribute('data-id');
            selectedDiseaseIds = selectedDiseaseIds.filter(id => id !== idToRemove);
            updateDiseaseUI();
        }
    });

    updateDiseaseUI();
    
    const ufInput = document.getElementById('uf');
    const cidadeInput = document.getElementById('city');

    if (ufInput) ufInput.addEventListener('input', carregarCidades);
    if (cidadeInput) cidadeInput.addEventListener('input', carregarEstacoes);

    carregarUFs();

    window.getSelectedDiseases = () => selectedDiseaseIds;
    
});

