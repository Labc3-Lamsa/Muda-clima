document.addEventListener("DOMContentLoaded", () => {
  const chatBox = document.getElementById("chatBox");
  const chatForm = document.getElementById("chatForm");
  const userMessageInput = document.getElementById("userMessage");
  const closeChatBtn = document.getElementById("closeChat");

  //contexto pagina atual
  function detectarContexto() {
    const p = window.location.pathname;
    if (p.includes("front-page")) return "Gráficos";
    if (p.includes("dashboard")) return "Previsões Múltiplas";
    if (p.includes("predshiny")) return "Previsões Mensais";
    if (p.includes("tutoriais")) return "Tutoriais";
    if (p.includes("materiais")) return "Materiais Educativos";
    if (p.includes("publicacoes")) return "Publicações";
    return "Início";
  }

  //markdown
  function renderizarMarkdown(texto) {
    return texto
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>");
  }

  //adiciona mensagem ao chatBox
  function adicionarMensagem(remetente, texto) {
    const divMensagem = document.createElement("div");
    divMensagem.classList.add(remetente === "usuario" ? "user-message" : "bot-message");
    divMensagem.innerHTML = `<p>${renderizarMarkdown(texto)}</p>`;
    chatBox.appendChild(divMensagem);
    chatBox.scrollTop = chatBox.scrollHeight;
    return divMensagem;
  }

  //indicador de digitando
  function mostrarDigitando() {
    const div = document.createElement("div");
    div.classList.add("bot-message", "indicador-digitando");
    div.setAttribute("data-digitando", "true");
    div.innerHTML = `<p><span class="ponto"></span><span class="ponto"></span><span class="ponto"></span></p>`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    return div;
  }

  function removerDigitando() {
    const indicador = chatBox.querySelector("[data-digitando='true']");
    if (indicador) indicador.remove();
  }

  //renderiza sugestoes
  function renderizarSugestoes(sugestoes) {
    //remove sugestoes antigas
    chatBox.querySelectorAll(".container-sugestoes").forEach(el => el.remove());

    if (!sugestoes || sugestoes.length === 0) return;

    const containerSugestoes = document.createElement("div");
    containerSugestoes.classList.add("container-sugestoes");

    sugestoes.forEach(textoChip => {
      const chip = document.createElement("button");
      chip.classList.add("chip-sugestao");
      chip.textContent = textoChip;
      chip.addEventListener("click", () => {
        userMessageInput.value = textoChip;
        chatForm.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      });
      containerSugestoes.appendChild(chip);
    });

    chatBox.appendChild(containerSugestoes);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  //envio de mensagem
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const mensagem = userMessageInput.value.trim();
    if (!mensagem) return;

    //remove sugestoes antigas
    chatBox.querySelectorAll(".container-sugestoes").forEach(el => el.remove());

    adicionarMensagem("usuario", mensagem);
    userMessageInput.value = "";

    mostrarDigitando();

    try {
      const resposta = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: mensagem,
          paginaAtual: detectarContexto(),
        }),
      });

      const dados = await resposta.json();
      removerDigitando();

      adicionarMensagem("bot", dados.reply || "Desculpe, não consegui responder agora.");
      renderizarSugestoes(dados.sugestoes);

    } catch (erro) {
      console.error("Erro no chat:", erro);
      removerDigitando();
      adicionarMensagem("bot", "Erro ao conectar ao servidor.");
    }
  });
});
