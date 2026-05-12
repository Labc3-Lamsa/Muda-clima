import { API_BASE_URL } from "./utils/config.js";


// Carregar UFs ao iniciar a página
async function carregarUFs() {
    const resposta = await fetch(`${API_BASE_URL}/ufs`);
    const ufs = await resposta.json();

    const ufSelect = document.getElementById('uf');
    if (!ufSelect) return;

    ufSelect.innerHTML = '<option value="">Escolha a UF</option>';
    ufs.forEach(uf => {
        const option = document.createElement('option');
        option.value = uf;
        option.textContent = uf;
        ufSelect.appendChild(option);
    });
}

// Buscar cidades da UF selecionada
async function carregarCidades() {
    const uf = document.getElementById('uf').value.trim().toUpperCase();
    const cidadeSelect = document.getElementById('city');
    const selectEstacao = document.getElementById('station');

    if (!cidadeSelect) return;

    if (!uf) {
        cidadeSelect.disabled = true;
        cidadeSelect.innerHTML = '<option value="">Escolha a cidade</option>';
        if (selectEstacao) {
            selectEstacao.innerHTML = '<option value="">Escolha uma estação</option>';
            selectEstacao.disabled = true;
        }
        return;
    }

    const resposta = await fetch(`${API_BASE_URL}/cidades/${uf}`);
    const cidades = await resposta.json();

    cidadeSelect.innerHTML = '<option value="">Escolha a cidade</option>';
    cidades.forEach(cidade => {
        const option = document.createElement('option');
        option.value = cidade;
        option.textContent = cidade;
        cidadeSelect.appendChild(option);
    });

    cidadeSelect.disabled = false;
    if (selectEstacao) {
        selectEstacao.innerHTML = '<option value="">Escolha uma estação</option>';
        selectEstacao.disabled = true;
    }
}

async function carregarEstacoes() {
    const cidade = document.getElementById('city').value.trim();
    const selectEstacao = document.getElementById('station');

    if (!selectEstacao) {
        return;
    }

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

const MONTHS = [
    { value: '01', label: 'Jan' },
    { value: '02', label: 'Fev' },
    { value: '03', label: 'Mar' },
    { value: '04', label: 'Abr' },
    { value: '05', label: 'Mai' },
    { value: '06', label: 'Jun' },
    { value: '07', label: 'Jul' },
    { value: '08', label: 'Ago' },
    { value: '09', label: 'Set' },
    { value: '10', label: 'Out' },
    { value: '11', label: 'Nov' },
    { value: '12', label: 'Dez' }
];

function formatarData(date) {
    return date.toISOString().slice(0, 10);
}

function preencherSelectData(prefix) {
    const daySelect = document.getElementById(`${prefix}-day`);
    const monthSelect = document.getElementById(`${prefix}-month`);
    const yearSelect = document.getElementById(`${prefix}-year`);

    if (!daySelect || !monthSelect || !yearSelect) return;

    daySelect.innerHTML = '<option value="">Dia</option>';
    monthSelect.innerHTML = '<option value="">Mês</option>';
    yearSelect.innerHTML = '<option value="">Ano</option>';

    MONTHS.forEach(month => {
        const option = document.createElement('option');
        option.value = month.value;
        option.textContent = month.label;
        monthSelect.appendChild(option);
    });

    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2000; year--) {
        const option = document.createElement('option');
        option.value = String(year);
        option.textContent = String(year);
        yearSelect.appendChild(option);
    }

    atualizarDias(prefix);
}

function atualizarDias(prefix) {
    const daySelect = document.getElementById(`${prefix}-day`);
    const month = document.getElementById(`${prefix}-month`).value;
    const year = document.getElementById(`${prefix}-year`).value;
    if (!daySelect) return;

    const selectedDay = daySelect.value;
    const maxDays = month && year ? new Date(Number(year), Number(month), 0).getDate() : 31;

    let options = '<option value="">Dia</option>';
    for (let dia = 1; dia <= maxDays; dia++) {
        const value = String(dia).padStart(2, '0');
        const selected = value === selectedDay ? ' selected' : '';
        options += `<option value="${value}"${selected}>${value}</option>`;
    }

    daySelect.innerHTML = options;
}

function getSelectedDate(prefix) {
    const day = document.getElementById(`${prefix}-day`).value;
    const month = document.getElementById(`${prefix}-month`).value;
    const year = document.getElementById(`${prefix}-year`).value;
    if (!day || !month || !year) {
        return null;
    }
    return `${year}-${month}-${day}`;
}

function setSelectedDate(prefix, date) {
    const daySelect = document.getElementById(`${prefix}-day`);
    const monthSelect = document.getElementById(`${prefix}-month`);
    const yearSelect = document.getElementById(`${prefix}-year`);
    if (!daySelect || !monthSelect || !yearSelect) return;

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());

    monthSelect.value = month;
    yearSelect.value = year;
    atualizarDias(prefix);
    daySelect.value = day;
}

function updateHiddenDateFields() {
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const startDate = getSelectedDate('start');
    const endDate = getSelectedDate('end');

    if (startDateInput) startDateInput.value = startDate || '';
    if (endDateInput) endDateInput.value = endDate || '';
}

function showDateFeedback(message) {
    const feedback = document.getElementById('date-feedback');
    if (!feedback) return;
    if (!message) {
        feedback.classList.remove('visible');
        feedback.textContent = '';
    } else {
        feedback.classList.add('visible');
        feedback.textContent = message;
    }
}

function differenceInDays(startDate, endDate) {
    return Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
}

function selecionarIntervaloDias(dias) {
    const startDateValue = getSelectedDate('start');
    if (!startDateValue) {
        showDateFeedback('Selecione a data inicial primeiro antes de escolher o intervalo.');
        return false;
    }

    const startDate = new Date(startDateValue);
    const currentEndValue = getSelectedDate('end');
    if (currentEndValue) {
        const currentEnd = new Date(currentEndValue);
        if (differenceInDays(startDate, currentEnd) < dias) {
            showDateFeedback(`O intervalo atual é menor que ${dias} dias. Ajustando a data final para completar o período.`);
        } else {
            showDateFeedback('');
        }
    } else {
        showDateFeedback('');
    }

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + dias - 1);
    setSelectedDate('end', endDate);
    updateHiddenDateFields();
    return true;
}

function configurarDateSelectors() {
    ['start', 'end'].forEach(prefix => {
        preencherSelectData(prefix);

        ['month', 'year'].forEach(part => {
            const select = document.getElementById(`${prefix}-${part}`);
            if (select) {
                select.addEventListener('change', () => {
                    atualizarDias(prefix);
                    updateHiddenDateFields();
                    showDateFeedback('');
                });
            }
        });

        const daySelect = document.getElementById(`${prefix}-day`);
        if (daySelect) {
            daySelect.addEventListener('change', () => {
                updateHiddenDateFields();
                showDateFeedback('');
            });
        }
    });
}

function configurarBotoesIntervalo() {
    const botoes = document.querySelectorAll('.time-filters button');
    const botaoFiltrar = document.getElementById('btn-filtrar');

    botoes.forEach(botao => {
        botao.addEventListener('click', () => {
            botoes.forEach(b => b.classList.remove('active'));
            botao.classList.add('active');

            const dias = parseInt(botao.dataset.days, 10);
            if (!Number.isNaN(dias) && selecionarIntervaloDias(dias)) {
                if (botaoFiltrar) {
                    botaoFiltrar.click();
                }
            }
        });
    });
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

    if (ufInput) ufInput.addEventListener('change', carregarCidades);
    if (cidadeInput) cidadeInput.addEventListener('change', carregarEstacoes);

    carregarUFs();
    configurarDateSelectors();
    configurarBotoesIntervalo();

    window.getSelectedDiseases = () => selectedDiseaseIds;

    document.getElementById('btn-filtrar').addEventListener('click', function() {

    if (window.innerWidth < 1024) {
        setTimeout(() => {
            document.querySelector('.chart-main-area').scrollIntoView({ behavior: 'smooth' });
        }, 300); // Espera um pouco o gráfico carregar
    }
});
    
});