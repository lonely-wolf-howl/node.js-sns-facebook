const Post = require('../models/posts.model');
const Comment = require('../models/comments.model');
const User = require('../models/users.model');

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/posts');
  }
  next();
}

async function checkPostOwnership(req, res, next) {
  if (req.isAuthenticated()) {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        req.flash('error', '게시물이 존재하지 않습니다.');
        res.redirect('back');
      } else {
        if (post.author.id.equals(req.user.id)) {
          req.post = post;
          next();
        } else {
          req.flash('error', '해당 게시물에 대한 권한이 없습니다.');
          res.redirect('back');
        }
      }
    } catch (error) {
      req.flash('error', '게시물 조회 중 오류가 발생했습니다.');
      res.redirect('back');
    }
  } else {
    req.flash('error', '사용자 인증이 필요합니다.');
    res.redirect('/login');
  }
}

async function checkCommentOwnership(req, res, next) {
  if (req.isAuthenticated()) {
    try {
      const comment = await Comment.findById(req.params.commentId);
      if (!comment) {
        req.flash('error', '댓글이 존재하지 않습니다.');
        res.redirect('back');
      } else {
        if (comment.author.id.equals(req.user._id)) {
          req.comment = comment;
          next();
        } else {
          req.flash('error', '해당 댓글에 대한 권한이 없습니다.');
          res.redirect('back');
        }
      }
    } catch (error) {
      req.flash('error', '댓글 조회 중 오류가 발생했습니다.');
      res.redirect('back');
    }
  } else {
    req.flash('error', '사용자 인증이 필요합니다.');
    res.redirect('/login');
  }
}

async function checkIsMe(req, res, next) {
  if (req.isAuthenticated()) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        req.flash('error', '사용자가 존재하지 않습니다.');
        res.redirect('/profile/' + req.params.id);
      } else {
        if (user._id.equals(req.user._id)) {
          next();
        } else {
          req.flash('error', '내 정보에 대한 권한이 없습니다.');
          res.redirect('back');
        }
      }
    } catch (error) {
      req.flash('error', '사용자 조회 중 오류가 발생했습니다.');
      res.redirect('back');
    }
  } else {
    req.flash('error', '사용자 인증이 필요합니다.');
    res.redirect('/login');
  }
}

module.exports = {
  checkAuthenticated,
  checkNotAuthenticated,
  checkPostOwnership,
  checkCommentOwnership,
  checkIsMe,
};
