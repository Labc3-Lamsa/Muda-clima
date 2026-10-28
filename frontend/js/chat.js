document.addEventListener("DOMContentLoaded", () => {
  const caixaChat = document.getElementById("chatBox");
  const formulario = document.getElementById("chatForm");
  const campoMensagem = document.getElementById("userMessage");
  const botaoNovaConversa = document.getElementById("resetChat");

  const CHAVE_CONVERSA = "climars_chat_conversa";
  const MAX_MENSAGENS = 60;
  const MENSAGEM_SEM_RESPOSTA = "Desculpe, não consegui responder agora.";
  let conversa = { mensagens: [], sugestoes: [] };

  function carregarConversa() {
    try {
      const salva = JSON.parse(sessionStorage.getItem(CHAVE_CONVERSA));
      if (salva && Array.isArray(salva.mensagens)) conversa = { mensagens: salva.mensagens, sugestoes: salva.sugestoes || [] };
    } catch { }
  }

  function salvarConversa() {
    try {
      conversa.mensagens = conversa.mensagens.slice(-MAX_MENSAGENS);
      sessionStorage.setItem(CHAVE_CONVERSA, JSON.stringify(conversa));
    } catch { }
  }

  //contexto pagina atual: o chat roda dentro de um iframe, entao le a URL da pagina que o contem
  function detectarContexto() {
    let caminho = window.location.pathname;
    let parametrosUrl = window.location.search;
    try {
      caminho = window.parent.location.pathname;
      parametrosUrl = window.parent.location.search;
    } catch { }

    const aba = new URLSearchParams(parametrosUrl).get("view");
    if (caminho.includes("front-page")) return "Gráficos";
    if (caminho.includes("predshiny")) return "Previsões Mensais";
    if (caminho.includes("dashboard")) return aba === "shiny" ? "Previsões Mensais" : "Previsões Múltiplas";
    if (caminho.includes("tutoriais")) return "Tutoriais";
    if (caminho.includes("materiais") || caminho.includes("atividades") || caminho.includes("jogos")) return "Materiais Educativos";
    if (caminho.includes("publicacoes")) return "Publicações";
    return "Início";
  }

  //sugestoes iniciais de cada pagina (cada texto tem um gatilho correspondente na base de conhecimento)
  const SUGESTOES_POR_PAGINA = {
    "Início": ["O que é o ClimArS?", "Como usar os gráficos?", "Como fazer uma previsão?"],
    "Gráficos": ["Como usar os gráficos?", "Como exportar os dados?", "Quais doenças posso visualizar?"],
    "Previsões Mensais": ["Como funciona a previsão mensal?", "Como funciona a previsão diária?", "Onde estão os tutoriais?"],
    "Previsões Múltiplas": ["Como fazer uma previsão?", "O que é o XGBoost?", "Qual é o erro médio do modelo?"],
    "Tutoriais": ["Como usar os gráficos?", "Como fazer uma previsão?", "Onde estão os materiais educativos?"],
    "Materiais Educativos": ["Quais publicações estão disponíveis?", "Onde estão os tutoriais?", "O que é o ClimArS?"],
    "Publicações": ["Quem desenvolveu o projeto?", "Quais são as fontes dos dados?", "Onde estão os materiais educativos?"]
  };

  const LINKS_PAGINAS = {
    "Previsões Múltiplas": "/dashboard.html?view=xgb",
    "Previsões Mensais": "/predshiny.html?view=shiny",
    "Materiais Educativos": "/html/materiais-educativos.html",
    "Publicações": "/html/publicacoes.html",
    "Tutoriais": "/html/tutoriais.html",
    "Gráficos": "/front-page.html"
  };
  const REGEX_NOMES_PAGINAS = new RegExp(Object.keys(LINKS_PAGINAS).join("|"), "g");

  const CARACTERES_HTML = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

  function rolarParaFim() {
    caixaChat.scrollTop = caixaChat.scrollHeight;
  }

  function removerSugestoes() {
    caixaChat.querySelectorAll(".container-sugestoes").forEach(elemento => elemento.remove());
  }

  function escaparHtml(texto) {
    return String(texto).replace(/[&<>"']/g, caractere => CARACTERES_HTML[caractere]);
  }

  function renderizarMarkdown(texto, { links = false } = {}) {
    let html = escaparHtml(texto);
    if (links) {
      html = html.replace(REGEX_NOMES_PAGINAS, (nome) =>
        `<a class="link-pagina" href="${LINKS_PAGINAS[nome]}" target="_top">${nome}</a>`);
    }
    return html
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>");
  }

  function htmlDoBalao(remetente, texto) {
    return `<p>${renderizarMarkdown(texto, { links: remetente === "bot" })}</p>`;
  }

  function criarBalao(remetente, texto, animar) {
    const [classeBase, classeAnimacao] = remetente === "usuario"
      ? ["user-message", "msg-slide-right"]
      : ["bot-message", "msg-slide-left"];
    const balao = document.createElement("div");
    balao.classList.add(classeBase);
    if (animar) balao.classList.add(classeAnimacao);
    balao.innerHTML = htmlDoBalao(remetente, texto);
    caixaChat.appendChild(balao);
    rolarParaFim();
    return balao;
  }

  function registrarMensagem(remetente, texto) {
    conversa.mensagens.push({ remetente, texto });
    salvarConversa();
  }

  function adicionarMensagem(remetente, texto, { restaurando = false } = {}) {
    criarBalao(remetente, texto, !restaurando);
    if (!restaurando) registrarMensagem(remetente, texto);
  }

  function mostrarDigitando() {
    const balao = document.createElement("div");
    balao.classList.add("bot-message", "indicador-digitando");
    balao.setAttribute("data-digitando", "true");
    balao.innerHTML = `<p><span class="ponto"></span><span class="ponto"></span><span class="ponto"></span></p>`;
    caixaChat.appendChild(balao);
    rolarParaFim();
  }

  function removerDigitando() {
    const indicador = caixaChat.querySelector("[data-digitando='true']");
    if (indicador) indicador.remove();
  }

  function renderizarSugestoes(sugestoes, { restaurando = false } = {}) {
    removerSugestoes();

    const lista = sugestoes || [];
    if (!restaurando) {
      conversa.sugestoes = lista;
      salvarConversa();
    }

    if (lista.length === 0) return;

    const containerSugestoes = document.createElement("div");
    containerSugestoes.classList.add("container-sugestoes");
    if (!restaurando) containerSugestoes.classList.add("msg-slide-up");

    lista.forEach(textoSugestao => {
      const botaoSugestao = document.createElement("button");
      botaoSugestao.classList.add("chip-sugestao");
      botaoSugestao.textContent = textoSugestao;
      botaoSugestao.addEventListener("click", () => {
        campoMensagem.value = textoSugestao;
        formulario.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      });
      containerSugestoes.appendChild(botaoSugestao);
    });

    caixaChat.appendChild(containerSugestoes);
    rolarParaFim();
  }

  async function lerStream(resposta) {
    const leitor = resposta.body.getReader();
    const decodificador = new TextDecoder();
    let trechoPendente = "";
    let texto = "";
    let balao = null;
    let sugestoes = [];

    const atualizar = () => {
      if (!balao) {
        removerDigitando();
        balao = criarBalao("bot", "", true);
      }
      balao.innerHTML = htmlDoBalao("bot", texto);
      rolarParaFim();
    };

    const processarLinha = (linha) => {
      if (!linha.trim()) return;
      const evento = JSON.parse(linha);
      if (typeof evento.delta === "string") {
        texto += evento.delta;
        atualizar();
      }
      if (typeof evento.replace === "string") {
        texto = evento.replace;
        atualizar();
      }
      if (evento.done) sugestoes = evento.sugestoes || [];
    };

    try {
      while (true) {
        const { done: terminou, value: bytes } = await leitor.read();
        if (terminou) break;
        const linhas = (trechoPendente + decodificador.decode(bytes, { stream: true })).split("\n");
        trechoPendente = linhas.pop();
        linhas.forEach(processarLinha);
      }
      processarLinha(trechoPendente);
    } catch (erro) {
      console.error("Stream interrompido:", erro);
      if (!texto) throw erro;
    }

    removerDigitando();
    if (!texto) texto = MENSAGEM_SEM_RESPOSTA;
    atualizar();
    registrarMensagem("bot", texto);
    renderizarSugestoes(sugestoes);
  }

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const mensagem = campoMensagem.value.trim();
    if (!mensagem) return;

    removerSugestoes();
    conversa.sugestoes = [];

    adicionarMensagem("usuario", mensagem);
    campoMensagem.value = "";

    mostrarDigitando();
    const delayMinimo = new Promise(resolve => setTimeout(resolve, 700));

    try {
      const [resposta] = await Promise.all([
        fetch("/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: mensagem,
            paginaAtual: detectarContexto(),
            stream: true,
          }),
        }),
        delayMinimo,
      ]);

      //respostas prontas da base vem em JSON; as do modelo vem em streaming
      if ((resposta.headers.get("Content-Type") || "").includes("application/x-ndjson")) {
        await lerStream(resposta);
        return;
      }

      const dados = await resposta.json();
      removerDigitando();
      adicionarMensagem("bot", dados.reply || MENSAGEM_SEM_RESPOSTA);
      renderizarSugestoes(dados.sugestoes);
    } catch (erro) {
      console.error("Erro no chat:", erro);
      removerDigitando();
      adicionarMensagem("bot", "Erro ao conectar ao servidor.");
    }
  });

  function sugestoesIniciais() {
    renderizarSugestoes(SUGESTOES_POR_PAGINA[detectarContexto()] || SUGESTOES_POR_PAGINA["Início"]);
  }

  botaoNovaConversa.addEventListener("click", () => {
    while (caixaChat.children.length > 1) caixaChat.removeChild(caixaChat.lastChild);
    conversa = { mensagens: [], sugestoes: [] };
    salvarConversa();
    fetch("/chat/reset", { method: "POST" }).catch(() => { /* sem servidor, so limpa a tela */ });
    sugestoesIniciais();
    campoMensagem.focus();
  });

  carregarConversa();
  conversa.mensagens.forEach(item => adicionarMensagem(item.remetente, item.texto, { restaurando: true }));
  if (conversa.mensagens.length === 0) sugestoesIniciais();
  else renderizarSugestoes(conversa.sugestoes, { restaurando: true });
});
