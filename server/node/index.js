// server/node/index.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');

const authRouter = require('./auth');
const { logout } = require('./helpers');

const app = express();
const PORT = 3000;

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 (client 폴더)
app.use(express.static(path.join(__dirname, '../../client')));

// 라우터 등록
app.use('/auth', authRouter);

// Flask 서버와 통신 (AI 응답)
app.post('/chat', async (req, res) => {
  const prompt = req.body.prompt;

  try {
    const flaskRes = await axios.post('http://localhost:5000/generate', { prompt });
    res.json(flaskRes.data);
  } catch (err) {
    console.error('❌ Flask 통신 오류:', err.message);
    res.status(500).json({ response: 'Flask 서버 오류' });
  }
});

// 기본 페이지
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/index.html'));
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`✅ Node.js 서버가 http://localhost:${PORT} 에서 실행 중`);
});
