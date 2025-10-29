const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const { logout } = require('./helpers');

const router = express.Router();

const db = new Map();
const USER_COOKIE_KEY = 'USER';
const MBTI_COOKIE_KEY = 'MBTI';

router.use(cookieParser());
router.use(express.urlencoded({ extended: true }));

// 기본 라우트
router.get('/', (req, res) => {
  const user = req.cookies[USER_COOKIE_KEY];

  if (user) {
    const userData = JSON.parse(user);
    if (db.get(userData.username)) {
      return res.status(200).send(`
        <a href="/auth/logout">Log Out</a>
        <h1>id: ${userData.username}, name: ${userData.name}, password: ${userData.password}</h1>
      `);
    }
  }

  res.status(200).send(`
    <a href="/login.html">Log In</a>
    <a href="/signup.html">Sign Up</a>
    <h1>Not Logged In</h1>
  `);
});

// ✅ 회원가입
router.post('/signup', (req, res) => {
  const { username, name, password } = req.body;
  const exists = db.get(username);

  if (exists) {
    return res.status(400).send(`duplicate username: ${username}`);
  }

  const newUser = { username, name, password };
  db.set(username, newUser);

  res.cookie(USER_COOKIE_KEY, JSON.stringify(newUser), {
    httpOnly: false,
    sameSite: 'Lax',
    path: '/'
  });

  // ✅ 회원가입 성공 → MBTI 선택 페이지로 이동
  res.redirect('/login.html');
});

// ✅ 로그인
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.get(username);

  if (!user || user.password !== password) {
    return res.status(401).send('❌ 아이디 또는 비밀번호가 올바르지 않습니다.');
  }

  res.cookie(USER_COOKIE_KEY, JSON.stringify(user), {
    httpOnly: false,
    sameSite: 'Lax',
    path: '/'
  });

  // ✅ 로그인 성공 → MBTI 선택 페이지로 이동
  res.redirect('/mbti.html');
});

// 로그아웃
router.get('/logout', logout);

module.exports = router;
