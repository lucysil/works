// chatbot.js
const FLASK_URL = "https://your-ngrok-url.ngrok.io"; // ← 여기에 Colab ngrok 주소
const chatHistory = document.getElementById("chatHistory");
const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");

// 로그인 확인
window.addEventListener("DOMContentLoaded", async () => {
  const res = await fetch("http://localhost:3000/auth/check", { credentials: "include" });
  const data = await res.json();

  if (!data.loggedIn) {
    alert("로그인이 필요합니다.");
    window.location.href = "./login.html";
  } else {
    console.log(`👤 로그인: ${data.username}`);
  }
});

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  addMessage("user", message);
  userInput.value = "";

  try {
    const res = await fetch(`${FLASK_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await res.json();
    addMessage("bot", data.reply || "(응답 없음)");
  } catch (err) {
    addMessage("bot", "⚠️ 서버 연결 오류");
  }
}

function addMessage(sender, text) {
  const msg = document.createElement("div");
  msg.className = `message ${sender}-message`;
  msg.textContent = text;
  chatHistory.appendChild(msg);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}
