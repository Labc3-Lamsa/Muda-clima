document.addEventListener("DOMContentLoaded", () => {
  const chatBox = document.getElementById("chatBox");
  const chatForm = document.getElementById("chatForm");
  const userMessageInput = document.getElementById("userMessage");
  const closeChatBtn = document.getElementById("closeChat");

//  closeChatBtn.addEventListener("click", () => {
//    window.location.href = "/";
//  });

  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const message = userMessageInput.value.trim();
    if (!message) return;

    appendMessage("user", message);
    userMessageInput.value = "";

    appendMessage("bot", "Digitando...");

    try {
      const response = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      const lastBotMessage = chatBox.querySelector(".bot-message:last-child");
      if (lastBotMessage && lastBotMessage.textContent === "Digitando...") {
        lastBotMessage.remove();
      }

      appendMessage("bot", data.reply || "Desculpe, não consegui responder agora.");
    } catch (err) {
      console.error("Erro no chat:", err);
      appendMessage("bot", "Erro ao conectar ao servidor.");
    }
  });

  function appendMessage(sender, text) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add(sender === "user" ? "user-message" : "bot-message");
    msgDiv.innerHTML = `<p>${text}</p>`;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});
