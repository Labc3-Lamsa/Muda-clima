document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector('header')) return;

    const currentPath = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const view = params.get("view");
    const isHtmlFolder = currentPath.includes('/html/');

    // Definição dos links dinâmicos
    const homeLink = isHtmlFolder ? 'home.html' : 'html/home.html';
    const chartLink = isHtmlFolder ? '../front-page.html' : 'front-page.html';
    const dashboardLink = isHtmlFolder ? '../dashboard.html' : 'dashboard.html';

    const header = document.createElement('header');
    header.innerHTML = `
        <a href="${homeLink}" class="logo-link">
            <div class="logo-container">
                <img src="../img/logoclimars.png" alt="Logo ClimArS" class="logo-img">
                <div class="logo-text">
                    <span class="brand-name">ClimArS</span>
                    <span class="brand-sub">Clima • Ar • Saúde</span>
                </div>
            </div>
        </a>
        <nav>
            <ul>
                <li><a href="${homeLink}" id="nav-home">Início</a></li>
                <li><a href="${chartLink}" id="nav-charts">Gráficos</a></li>
                <li><a href="${dashboardLink}?view=shiny" id="btn-predicao">Previsões Mensais</a></li>
                <li><a href="${dashboardLink}?view=xgb" id="btn-predicao-beta">Previsões Múltiplas</a></li>
            </ul>
        </nav>
    `;
    document.body.prepend(header);

    // --- LÓGICA DE FOCO (ACTIVE) ---
    const resetActive = () => {
        header.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
    };

    if (currentPath.includes('home.html')) {
        document.getElementById('nav-home').classList.add('active');
    } 
    else if (currentPath.includes('front-page.html')) {
        document.getElementById('nav-charts').classList.add('active');
    } 
    else if (currentPath.includes('dashboard.html')) {
        // Se estiver no dashboard, olha o parâmetro 'view'
        if (view === 'shiny') {
            document.getElementById('btn-predicao').classList.add('active');
        } else {
            document.getElementById('btn-predicao-beta').classList.add('active');
        }
    }

    // Ouvinte para cliques nas abas do Dashboard (para mudar o foco sem recarregar)
    header.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.includes('dashboard.html')) {
                resetActive();
                link.classList.add('active');
            }
        });
    });
});