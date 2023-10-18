const express = require('express');
const usersRouter = express.Router();

const passport = require('passport');
const sendEmail = require('../mail/mail');
const User = require('../models/users.model');

// signup
usersRouter.post('/signup', async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    sendEmail(process.env.GOOGLE_EMAIL_ID, user.email, 'welcome');
    res.redirect('/login');
  } catch (error) {
    console.log(error);
  }
});

// login
usersRouter.post('/login', (req, res, next) => {
  passport.authenticate('local', (error, user, info) => {
    if (error) return next(error);
    if (!user) return res.json({ message: info });

    req.login(user, function (error) {
      if (error) return next(error);
      res.redirect('/posts');
    });
  })(req, res, next);
});

// google login
usersRouter.get('/google', passport.authenticate('google'));
usersRouter.get(
  '/google/callback',
  passport.authenticate('google', {
    successReturnToOrRedirect: '/posts',
    failureRedirect: '/login',
  })
);

// kakao login
usersRouter.get('/kakao', passport.authenticate('kakao'));
usersRouter.get(
  '/kakao/callback',
  passport.authenticate('kakao', {
    successReturnToOrRedirect: '/posts',
    failureRedirect: '/login',
  })
);

// logout
usersRouter.post('/logout', (req, res, next) => {
  req.logout(function (error) {
    if (error) return next(error);
    res.redirect('/');
  });
});

module.exports = usersRouter;
