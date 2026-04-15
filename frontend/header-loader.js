document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector('header')) return;

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
                <li><a href="/home">Início</a></li>
                <li><a href="/front-page.html">Gráficos</a></li>
                <li><a href="/dashboard.html?view=shiny">Previsões Mensais</a></li>
                <li><a href="/dashboard.html?view=xgb">Previsões Múltiplas</a></li>
            </ul>
        </nav>
    `;
    document.body.prepend(header);
});