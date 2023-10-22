const express = require('express');
const likesRouter = express.Router();

const { checkAuthenticated } = require('../middleware/auth');

const Post = require('../models/posts.model');

likesRouter.put('/posts/:id/likes', checkAuthenticated, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      req.flash('error', '게시물이 존재하지 않습니다.');
      res.redirect('back');
    } else {
      // 이미 좋아요를 눌렀을 경우
      if (post.likes.find((like) => like === req.user._id.toString())) {
        const updatedLikes = post.likes.filter(
          (like) => like !== req.user._id.toString()
        );
        try {
          await Post.findByIdAndUpdate(post._id, {
            likes: updatedLikes,
          });
          req.flash('success', '좋아요 취소 성공.');
          res.redirect('back');
        } catch {
          req.flash('error', '좋아요 취소 실패.');
          res.redirect('back');
        }
        // 좋아요를 처음 눌렀을 경우
      } else {
        try {
          await Post.findByIdAndUpdate(post._id, {
            likes: post.likes.concat([req.user._id]),
          });
          req.flash('success', '좋아요 성공.');
          res.redirect('back');
        } catch {
          req.flash('error', '좋아요 실패.');
          res.redirect('back');
        }
      }
    }
  } catch {
    req.flash('error', '게시물 조회 중 오류가 발생했습니다.');
    res.redirect('back');
  }
});

module.exports = likesRouter;
