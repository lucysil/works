// // server/node/helpers.js
// module.exports.logout = (req, res) => {
//   req.logout(err => {
//     if (err) console.error(err);
//     req.session.destroy(() => res.redirect('/'));
//   });
// };


// helpers.js — 여러 함수 정리 파일
function logout(req, res) {
  // 세션을 삭제하고 로그아웃 처리
  req.session.destroy(() => {
    res.json({ message: '로그아웃 완료' });
  });
}

module.exports = { logout };
