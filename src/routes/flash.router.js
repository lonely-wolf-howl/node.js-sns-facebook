const express = require('express');
const flashRouter = express.Router();

flashRouter.get('/send', (req, res) => {
  req.flash('post success', '게시물이 생성되었습니다.');
  res.redirect('/flash/receive');
});

flashRouter.get('/receive', (req, res) => {
  res.send(req.flash('post success')[0]);
});

module.exports = flashRouter;
