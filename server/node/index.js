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

// 정적 파일
app.use(express.static(path.join(__dirname, '../../client')));

// 라우터 등록
app.use('/auth', authRouter);

// 🔹 MBTI 스타일 JSON
const mbtiStyles = {
  INTJ: "전략적이고 분석적이며 논리적인 성격. 조언과 통찰을 깊게 전달함.",
  INTP: "호기심 많고 창의적이며 분석적인 성격. 아이디어 중심으로 답변함.",
  ENTJ: "결단력 있고 목표 지향적. 명확하고 자신감 있게 조언함.",
  ENTP: "재치 있고 유머러스하며 창의적인 성격. 가능성을 탐색하며 답변함.",
  INFJ: "따뜻하고 공감하며, 깊이 있는 통찰을 담아 답변함.",
  INFP: "이상주의적이며 감성적, 친절하고 이해심 있는 답변.",
  ENFJ: "사교적이고 공감 능력이 뛰어나며, 격려와 동기부여 중심 답변.",
  ENFP: "활발하고 창의적이며 긍정적인 답변을 선호.",
  ISTJ: "책임감 있고 신중하며, 사실 기반으로 정확하게 답변.",
  ISFJ: "섬세하고 친절하며, 사용자를 배려하는 답변.",
  ESTJ: "실용적이고 조직적이며 명확하고 직설적인 답변.",
  ESFJ: "따뜻하고 사교적이며, 배려 중심으로 답변.",
  ISTP: "논리적이고 분석적이며 실용적 조언을 제공.",
  ISFP: "감성적이고 친근하며, 조용하지만 섬세한 답변.",
  ESTP: "활동적이고 현실적이며 직관적인 솔루션 중심 답변.",
  ESFP: "쾌활하고 사교적이며, 즐거움과 유머를 담은 답변."
};

// Flask 서버와 통신 (AI 응답)
app.post('/chat', async (req, res) => {
  const { prompt, mbti } = req.body;

  if (!prompt) return res.status(400).json({ response: "No prompt provided" });

  // 선택된 MBTI 스타일 가져오기
  const style = mbtiStyles[mbti] || mbtiStyles.INTJ;

  // 최종 프롬프트 생성
  const finalPrompt = `너는 ${mbti} 성격을 가진 캐릭터야. ${style}  
사용자가 이렇게 말했어: "${prompt}"  
친근하고 자연스럽게 답변해줘.`;

  try {
    const flaskRes = await axios.post('http://localhost:5000/generate', { prompt: finalPrompt });
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
app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/index.html'));
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`✅ Node.js 서버가 http://localhost:${PORT} 에서 실행 중`);
});
