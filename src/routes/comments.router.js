const express = require('express');
const commentsRouter = express.Router({
  mergeParams: true,
});

const {
  checkAuthenticated,
  checkCommentOwnership,
} = require('../middleware/auth');

const Post = require('../models/posts.model');
const Comment = require('../models/comments.model');

commentsRouter.post('/', checkAuthenticated, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      req.flash('error', '게시물이 존재하지 않습니다.');
      res.redirect('back');
    } else {
      try {
        const comment = await Comment.create(req.body);
        comment.author.id = req.user._id;
        comment.author.username = req.user.username;
        await comment.save();

        post.comments.push(comment);
        await post.save();

        req.flash('success', '댓글 생성 성공.');
        res.redirect('back');
      } catch {
        req.flash('error', '댓글 생성 중 오류가 발생했습니다.');
        res.redirect('back');
      }
    }
  } catch {
    req.flash('error', '게시물 조회 중 오류가 발생했습니다.');
    res.redirect('back');
  }
});

commentsRouter.delete(
  '/:commentId',
  checkCommentOwnership,
  async (req, res, next) => {
    try {
      await Comment.findByIdAndDelete(req.params.commentId);
      req.flash('success', '댓글 삭제 성공.');
      res.redirect('back');
    } catch {
      req.flash('error', '댓글 삭제 실패.');
      res.redirect('back');
    }
  }
);

module.exports = commentsRouter;
