// let chats = []; // 채팅 기록 배열 [{id, messages: [{role:'user'|'bot', text}], title}]
// let currentChatId = null;

// const chatListDiv = document.getElementById('chatList');
// const chatHistoryDiv = document.getElementById('chatHistory');
// const userInput = document.getElementById('userInput');
// const sendBtn = document.getElementById('sendBtn');
// const newChatBtn = document.getElementById('newChatBtn');

// function renderChatList() {
//   chatListDiv.innerHTML = '';
//   chats.forEach(chat => {
//     const div = document.createElement('div');
//     div.classList.add('chat-item');
//     if (chat.id === currentChatId) div.classList.add('active');
//     div.textContent = chat.title || `대화 ${chat.id}`;
//     div.onclick = () => {
//       currentChatId = chat.id;
//       renderChatList();
//       renderChatHistory();
//     };
//     chatListDiv.appendChild(div);
//   });
// }

// function renderChatHistory() {
//   chatHistoryDiv.innerHTML = '';
//   if (!currentChatId) return;
//   const chat = chats.find(c => c.id === currentChatId);
//   if (!chat) return;

//   chat.messages.forEach(msg => {
//     const div = document.createElement('div');
//     div.classList.add('message');
//     div.classList.add(msg.role === 'user' ? 'user-message' : 'bot-message');
//     div.textContent = msg.text;
//     chatHistoryDiv.appendChild(div);
//   });
//   chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
// }

// async function sendMessage() {
//   const text = userInput.value.trim();
//   if (!text) return;

//   if (!currentChatId) {
//     // 새 채팅 자동 생성
//     currentChatId = Date.now();
//     chats.push({ id: currentChatId, messages: [], title: `대화 ${new Date().toLocaleTimeString()}` });
//   }

//   const chat = chats.find(c => c.id === currentChatId);
//   chat.messages.push({ role: 'user', text });
//   renderChatHistory();

//   userInput.value = '';
//   userInput.disabled = true;
//   sendBtn.disabled = true;

//   try {
//     const res = await fetch('http://localhost:3000/chat', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ prompt: text })
//     });
//     if (!res.ok) throw new Error(`서버 오류: ${res.status}`);

//     const data = await res.json();
//     chat.messages.push({ role: 'bot', text: data.response });
//     renderChatHistory();
//   } catch (e) {
//     chat.messages.push({ role: 'bot', text: '서버 오류가 발생했습니다.' });
//     renderChatHistory();
//   } finally {
//     userInput.disabled = false;
//     sendBtn.disabled = false;
//     userInput.focus();
//   }
// }

// function newChat() {
//   currentChatId = Date.now();
//   chats.push({ id: currentChatId, messages: [], title: `대화 ${new Date().toLocaleTimeString()}` });
//   renderChatList();
//   renderChatHistory();
//   userInput.value = '';
//   userInput.focus();
// }

// sendBtn.addEventListener('click', sendMessage);
// userInput.addEventListener('keydown', e => {
//   if (e.key === 'Enter') sendMessage();
// });
// newChatBtn.addEventListener('click', newChat);

// // 초기 새 채팅 하나 생성
// newChat();
// renderChatList();



// ✅ chatbot.js (멀티채팅 구조 + Flask 연결 + 로딩 메시지 추가)

let chats = []; // [{id, messages: [{role:'user'|'bot', text}], title}]
let currentChatId = null;

const chatListDiv = document.getElementById('chatList');
const chatHistoryDiv = document.getElementById('chatHistory');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const newChatBtn = document.getElementById('newChatBtn');

function renderChatList() {
  chatListDiv.innerHTML = '';
  chats.forEach(chat => {
    const div = document.createElement('div');
    div.classList.add('chat-item');
    if (chat.id === currentChatId) div.classList.add('active');
    div.textContent = chat.title || `대화 ${chat.id}`;
    div.onclick = () => {
      currentChatId = chat.id;
      renderChatList();
      renderChatHistory();
    };
    chatListDiv.appendChild(div);
  });
}

function renderChatHistory() {
  chatHistoryDiv.innerHTML = '';
  if (!currentChatId) return;
  const chat = chats.find(c => c.id === currentChatId);
  if (!chat) return;

  chat.messages.forEach(msg => {
    const div = document.createElement('div');
    div.classList.add('message');
    div.classList.add(msg.role === 'user' ? 'user-message' : 'bot-message');
    div.textContent = msg.text;
    chatHistoryDiv.appendChild(div);
  });
  chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  if (!currentChatId) {
    // 새 채팅 자동 생성
    currentChatId = Date.now();
    chats.push({ id: currentChatId, messages: [], title: `대화 ${new Date().toLocaleTimeString()}` });
  }

  const chat = chats.find(c => c.id === currentChatId);
  chat.messages.push({ role: 'user', text });
  renderChatHistory();

  // 입력 잠시 비활성화
  userInput.value = '';
  userInput.disabled = true;
  sendBtn.disabled = true;

  // ✅ 로딩 메시지 추가
  const loadingMessage = { role: 'bot', text: '⏳ AI가 생각 중입니다...' };
  chat.messages.push(loadingMessage);
  renderChatHistory();

  try {
    // ✅ Flask 서버로 요청 (5000 포트, /generate 라우트)
    const res = await fetch('http://localhost:5000/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: text })
    });

    if (!res.ok) throw new Error(`서버 오류: ${res.status}`);
    const data = await res.json();

    // ✅ 로딩 메시지 제거 후 실제 응답 표시
    chat.messages.pop(); // 마지막 메시지(로딩 메시지) 제거
    chat.messages.push({ role: 'bot', text: data.response });
    renderChatHistory();
  } catch (e) {
    chat.messages.pop(); // 로딩 메시지 제거
    chat.messages.push({ role: 'bot', text: '⚠️ 서버 오류가 발생했습니다.' });
    renderChatHistory();
  } finally {
    userInput.disabled = false;
    sendBtn.disabled = false;
    userInput.focus();
  }
}

function newChat() {
  currentChatId = Date.now();
  chats.push({ id: currentChatId, messages: [], title: `대화 ${new Date().toLocaleTimeString()}` });
  renderChatList();
  renderChatHistory();
  userInput.value = '';
  userInput.focus();
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMessage();
});
newChatBtn.addEventListener('click', newChat);

// 초기 새 채팅 하나 생성
newChat();
renderChatList();
