document.addEventListener("DOMContentLoaded", () => {
  const currentPath = window.location.pathname;
  const isHtmlFolder = currentPath.includes("/html/");
  const basePath = isHtmlFolder ? "../" : "";

  const head = document.head;
  if (!head.querySelector('link[href$="popup.css"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `${basePath}css/popup.css`;
    head.appendChild(link);
  }

  if (document.getElementById("chat-float-btn") || document.getElementById("chat-popup")) {
    return;
  }

  const btn = document.createElement("div");
  btn.id = "chat-float-btn";
  btn.innerHTML = "💬";
  document.body.appendChild(btn);

  const popup = document.createElement("iframe");
  popup.id = "chat-popup";
  popup.src = `${basePath}chat.html`;
  popup.style.display = "none";
  document.body.appendChild(popup);

  btn.addEventListener("click", () => {
    if (popup.classList.contains("open")) {
      popup.classList.remove("open");
      setTimeout(() => {
        popup.style.display = "none";
      }, 200);
    } else {
      popup.style.display = "block";
      setTimeout(() => popup.classList.add("open"), 10);
    }
  });
});
