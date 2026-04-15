document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector('.footer-container')) return;

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
                <a href="/home">Home</a>
                <a href="/front-page.html">Gráficos</a>
                <a href="/dashboard.html?view=shiny">Previsões Mensais</a>
                <a href="/dashboard.html?view=xgb">Previsões Múltiplas</a>
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