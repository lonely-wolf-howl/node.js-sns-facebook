const express = require('express');
const postsRouter = express.Router();

const {
  checkAuthenticated,
  checkPostOwnership,
} = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const Post = require('../models/posts.model');
// not required
const Comment = require('../models/comments.model');

const storageEngine = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, path.join(__dirname, '../public/assets/images'));
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  },
});
const upload = multer({ storage: storageEngine }).single('image');

postsRouter.post('/', checkAuthenticated, upload, async (req, res, next) => {
  const desc = req.body.desc;
  const image = req.file ? req.file.filename : '';
  console.log(req.file);

  try {
    await Post.create({
      image,
      description: desc,
      author: {
        id: req.user._id,
        username: req.user.username,
      },
    });
    req.flash('success', '게시물 생성 성공.');
    res.redirect('posts');
  } catch (error) {
    req.flash('error', '게시물 생성 실패.');
    next(error);
  }
});

postsRouter.get('/', checkAuthenticated, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('comments')
      .sort({ createAt: -1 })
      .exec();

    res.render('posts', {
      posts,
    });
  } catch (error) {
    console.log(error);
  }
});

postsRouter.get('/:id/edit', checkPostOwnership, (req, res) => {
  res.render('posts/edit', {
    post: req.post,
  });
});

postsRouter.put('/:id', checkPostOwnership, async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, req.body);
    req.flash('success', '게시물 수정 성공.');
    res.redirect('/posts');
  } catch (error) {
    req.flash('error', '게시물 수정 실패.');
    res.redirect('/posts');
  }
});

module.exports = postsRouter;
