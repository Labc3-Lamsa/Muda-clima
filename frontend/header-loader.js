document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector('header')) return;

    const currentPath = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const view = params.get("view");
    const isHtmlFolder = currentPath.includes('/html/');

    const homeLink = isHtmlFolder ? 'home.html' : 'html/home.html';
    const chartLink = isHtmlFolder ? '../front-page.html' : 'front-page.html';
    const predshinyLink = isHtmlFolder ? '../predshiny.html' : 'predshiny.html';
    const dashboardLink = isHtmlFolder ? '../dashboard.html' : 'dashboard.html';

    // ADD PÁGINA DE TUTORIAIS
    const tutoriaisLink = isHtmlFolder ? 'tutoriais.html' : 'html/tutoriais.html';
    //ADD PÁGINA DE MATERIAIS EDUCATIVOS
    const materiaisEducativosLink = isHtmlFolder ? 'materiais-educativos.html' : 'html/materiais-educativos.html';
    // ADD PÁGINA DE PUBLICAÇÕES
    const publicacoesLink = isHtmlFolder ? 'publicacoes.html' : 'html/publicacoes.html';
    //--- 

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

        <button class="menu-toggle" aria-label="Abrir menu">
            <span></span>
            <span></span>
            <span></span>
        </button>

        <div class="menu-overlay"></div>

        <nav class="nav-menu">
            <ul>
                <li><a href="${homeLink}" id="nav-home">Início</a></li>
                <li><a href="${chartLink}" id="nav-charts">Gráficos</a></li>
                <li><a href="${predshinyLink}?view=shiny" id="btn-predicao">Previsões Mensais</a></li>
                <li><a href="${dashboardLink}?view=xgb" id="btn-predicao-beta">Previsões Múltiplas</a></li>
                <li><a href="${tutoriaisLink}" id="nav-tutoriais">Tutoriais</a></li>
                <li><a href="${materiaisEducativosLink}" id="nav-materiais-educativos">Materiais Educativos</a></li>
                <li><a href="${publicacoesLink}" id="nav-publicacoes">Publicações</a></li>
            </ul>
        </nav>
    `;
    document.body.prepend(header);

// --- LÓGICA DO MENU MOBILE CORRIGIDA ---
const btn = header.querySelector('.menu-toggle');
const nav = header.querySelector('.nav-menu');
const overlay = header.querySelector('.menu-overlay');
const navLinks = header.querySelectorAll('.nav-menu a'); // Seleciona os links do menu

const toggleMenu = () => {
    const isOpen = nav.classList.toggle('open');
    overlay.classList.toggle('active');
    btn.classList.toggle('active');
    
    // Impede a rolagem da página quando o menu está aberto
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
};

// Abre/Fecha ao clicar no botão sanduíche ou no overlay
if (btn && nav && overlay) {
    btn.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);

    // FECHAR O MENU AO CLICAR EM UM LINK (Importante para Single Page Applications ou navegação interna)
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (nav.classList.contains('open')) {
                toggleMenu();
            }
        });
    });
}

    // --- LÓGICA DE FOCO (ACTIVE) ---
    const resetActive = () => {
        header.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
    };

    if (currentPath.includes('home.html')) {
        document.getElementById('nav-home').classList.add('active');
    } else if (currentPath.includes('front-page.html')) {
        document.getElementById('nav-charts').classList.add('active');
    } else if (currentPath.includes('dashboard.html')) {
        if (view === 'shiny') {
            document.getElementById('btn-predicao').classList.add('active');
        } else {
            document.getElementById('btn-predicao-beta').classList.add('active');
        }
        
        } else if (currentPath.includes('predshiny.html')) {
    const btn = document.getElementById('btn-predicao');
    if (btn) btn.classList.add('active');
}
    // adiciona lógica para tutoriais
    else if (currentPath.includes('tutoriais.html')) {
            document.getElementById('nav-tutoriais').classList.add('active');
    }

    // adiciona lógica para materiais educativos
    else if (currentPath.includes('materiais-educativos.html')) {
        document.getElementById('nav-materiais-educativos').classList.add('active');
    }

    // adiciona lógica para publicações
    else if (currentPath.includes('publicacoes.html')) {
        document.getElementById('nav-publicacoes').classList.add('active');
    }

    header.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', () => {
            if (nav.classList.contains('open')) toggleMenu(); // Fecha ao clicar
            const href = link.getAttribute('href');
            if (href.includes('dashboard.html')) {
                resetActive();
                link.classList.add('active');
            }
        });
    });
});