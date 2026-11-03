document.addEventListener("DOMContentLoaded", () => {
  const CHAVE_ABERTO = "climars_chat_aberto";

  // caminhos absolutos: o mesmo widget funciona em qualquer pasta do site
  if (!document.head.querySelector('link[href$="popup.css"]')) {
    const folhaDeEstilo = document.createElement("link");
    folhaDeEstilo.rel = "stylesheet";
    folhaDeEstilo.href = "/css/popup.css";
    document.head.appendChild(folhaDeEstilo);
  }

  if (document.getElementById("chat-float-btn") || document.getElementById("chat-popup")) {
    return;
  }

  // lembra se o chat estava aberto ao trocar de página
  const lerAberto = () => {
    try { return sessionStorage.getItem(CHAVE_ABERTO) === "1"; } catch { return false; }
  };
  const salvarAberto = (aberto) => {
    try { sessionStorage.setItem(CHAVE_ABERTO, aberto ? "1" : "0"); } catch { /* sem storage, segue sem lembrar */ }
  };

  const botao = document.createElement("div");
  botao.id = "chat-float-btn";
  botao.innerHTML = `<img src="/img/chatbot.svg" alt="Chatbot" class="chat-btn-icon">`;
  document.body.appendChild(botao);

  const janelaChat = document.createElement("iframe");
  janelaChat.id = "chat-popup";
  janelaChat.src = "/chat.html";
  janelaChat.style.display = "none";
  document.body.appendChild(janelaChat);

  const marcarAberto = () => {
    janelaChat.classList.add("open");
    botao.classList.add("chat-open");
  };

  if (lerAberto()) {
    janelaChat.style.display = "block";
    marcarAberto();
  }

  botao.addEventListener("click", () => {
    const estavaAberto = janelaChat.classList.contains("open");
    salvarAberto(!estavaAberto);

    if (estavaAberto) {
      janelaChat.classList.remove("open");
      botao.classList.remove("chat-open");
      setTimeout(() => {
        janelaChat.style.display = "none";
      }, 300);
    } else {
      janelaChat.style.display = "block";
      setTimeout(marcarAberto, 10);
    }
  });
});
