// server/node/auth.js
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const { logout } = require('./helpers');

const router = express.Router();

const db = new Map();
// KEY=VALUE 형태로 브라우저에 저장되는 쿠키의 KEY
const USER_COOKIE_KEY = 'USER';

router.use(cookieParser());
router.use(express.urlencoded({ extended: true }));


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

  // 로그인되지 않은 상태
  res.status(200).send(`
    <a href="/login.html">Log In</a>
    <a href="/signup.html">Sign Up</a>
    <h1>Not Logged In</h1>
  `);
});

// 회원가입 라우트
router.post('/signup', (req, res) => {
  const { username, name, password } = req.body;
  const exists = db.get(username);

  if (exists) {
    return res.status(400).send(`duplicate username: ${username}`);
  }

  const newUser = { username, name, password };
  db.set(username, newUser);

  // 쿠키에 사용자 정보 저장
  res.cookie(USER_COOKIE_KEY, JSON.stringify(newUser));
  res.redirect('/auth'); // /auth/ 페이지로 이동
});

// 로그인 라우트
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.get(username);

  if (!user || user.password !== password) {
    return res.status(401).send('❌ 아이디 또는 비밀번호가 올바르지 않습니다.');
  }

  // 로그인 성공 시 쿠키에 유저정보 저장
  res.cookie(USER_COOKIE_KEY, JSON.stringify(user), {
  httpOnly: false,      // JS에서 읽을 수 있게
  sameSite: 'Lax',      // 크로스 사이트 문제 방지
  path: '/'             // 전체 경로에서 유효
});

  // ✅ 로그인 성공 시 바로 chatPage로 이동
  res.redirect('/chat');
});


router.get('/logout', logout);

module.exports = router;
