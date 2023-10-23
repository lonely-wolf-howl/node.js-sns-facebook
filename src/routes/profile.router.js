const express = require('express');
const profileRouter = express.Router({
  mergeParams: true,
});

const { checkAuthenticated, checkIsMe } = require('../middleware/auth');

const Post = require('../models/posts.model');
const User = require('../models/users.model');

profileRouter.get('/', checkAuthenticated, async (req, res) => {
  try {
    const posts = await Post.find({ 'author.id': req.params.id })
      .populate('comments')
      .sort({ createdAt: -1 })
      .exec();

    const user = await User.findById(req.params.id);
    if (!user) {
      req.flash('error', '사용자가 존재하지 않습니다.');
      res.redirect('back');
    }
    res.render('profile', {
      posts: posts,
      user: user,
    });
  } catch {
    req.flash('error', '사용자 게시물 목록 조회 중 오류가 발생했습니다.');
    res.redirect('back');
  }
});

profileRouter.get('/edit', checkIsMe, async (req, res) => {
  res.render('profile/edit', {
    user: req.user,
  });
});

profileRouter.put('/', checkIsMe, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, req.body);
    req.flash('success', '내 정보 수정 성공.');
    res.redirect('/profile/' + req.params.id);
  } catch {
    req.flash('error', '내 정보 수정 실패.');
    res.redirect('back');
  }
});

module.exports = profileRouter;
