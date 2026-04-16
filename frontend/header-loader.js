document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector('header')) return;

    const currentPath = window.location.pathname;
    const isHtmlFolder = currentPath.includes('/html/');
    const homeLink = isHtmlFolder ? 'home.html' : 'html/home.html';
    const chartLink = isHtmlFolder ? '../front-page.html' : 'front-page.html';
    const dashboardLink = isHtmlFolder ? '../dashboard.html' : 'dashboard.html';

    const header = document.createElement('header');
    header.innerHTML = `
        <div class="logo-container">
            <img src="../img/logoclimars.png" alt="Logo ClimArS" class="logo-img">
            <div class="logo-text">
                <span class="brand-name">ClimArS</span>
                <span class="brand-sub">Clima • Ar • Saúde</span>
            </div>
        </div>
        <nav>
            <ul>
                <li><a href="${homeLink}">Início</a></li>
                <li><a href="${chartLink}">Gráficos</a></li>
                <li><a href="${dashboardLink}?view=shiny">Previsões Mensais</a></li>
                <li><a href="${dashboardLink}?view=xgb">Previsões Múltiplas</a></li>
            </ul>
        </nav>
    `;
    document.body.prepend(header);
});