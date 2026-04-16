document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector('.footer-container')) return;

    const currentPath = window.location.pathname;
    const isHtmlFolder = currentPath.includes('/html/');
    const homeLink = isHtmlFolder ? 'home.html' : 'html/home.html';
    const chartLink = isHtmlFolder ? '../front-page.html' : 'front-page.html';
    const dashboardLink = isHtmlFolder ? '../dashboard.html' : 'dashboard.html';

    const footer = document.createElement('footer');
    footer.innerHTML = `
        <div class="footer-container">
            <div class="footer-column">
                <h4>Institucional</h4>
                <a href="#">Dados de Saúde</a>
                <a href="#">Contato</a>
                <a href="#">Sobre o Projeto</a>
            </div>
            <div class="footer-column">
                <h4>Links</h4>
                <a href="${homeLink}">Home</a>
                <a href="${chartLink}">Gráficos</a>
                <a href="${dashboardLink}?view=shiny">Previsões Mensais</a>
                <a href="${dashboardLink}?view=xgb">Previsões Múltiplas</a>
            </div>
            <div class="footer-partners">
                <h4>Parceiros Institucionais</h4>
                <div class="partner-logos">
                    <img src="../img/iema.svg" alt="IEMA">
                    <img src="../img/inmet.png" alt="INMET">
                    <img src="../img/datasus.png" alt="DATASUS">
                </div>
            </div>
        </div>
        <p class="copyright">© 2026 CNPQ | FAPERGS - Projeto "Associação entre as variáveis climáticas e as internações por doenças respiratórias"</p>
    `;
    document.body.appendChild(footer);
});