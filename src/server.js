const express = require('express');
const app = express();

const Connect = require('./database/connect');
const path = require('path');
const cookieSession = require('cookie-session');
const passport = require('passport');

// import routers
const mainRouter = require('./routes/main.router');
const usersRouter = require('./routes/users.router');
const postsRouter = require('./routes/posts.router');
const commentsRouter = require('./routes/comments.router');
const profileRouter = require('./routes/profile.router');
const likesRouter = require('./routes/likes.router');
const friendsRouter = require('./routes/friends.router');

const config = require('config');

class Application {
  constructor() {
    this.app = app;

    this.init();
    this.database();
    this.middlewares();
    this.routes();
    this.startServer();
  }

  init() {
    // view engine setup (ejs)
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');

    // static
    // localhost:.../
    app.use(express.static(path.join(__dirname, './public')));

    // .env
    require('dotenv').config();
  }

  database() {
    Connect.mongoDB();
  }

  middlewares() {
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // cookie-session
    app.use(
      cookieSession({
        name: 'cookie-session',
        keys: [process.env.COOKIE_ENCRYPTION_KEY],
      })
    );

    app.use(function (req, res, next) {
      if (req.session && !req.session.regenerate) {
        req.session.regenerate = (callback) => {
          callback();
        };
      }
      if (req.session && !req.session.save) {
        req.session.save = (callback) => {
          callback();
        };
      }
      next();
    });

    // passport
    app.use(passport.initialize());
    app.use(passport.session());
    require('./config/passport');
  }

  routes() {
    app.use('/', mainRouter);
    app.use('/auth', usersRouter);
    app.use('/posts', postsRouter);
    app.use('/posts/:id/comments', commentsRouter);
    app.use('/profile/:id', profileRouter);
    app.use('/friends', friendsRouter);
    app.use('/posts/:id/likes', likesRouter);
  }

  startServer() {
    const port = config.get('server.port');
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  }
}

new Application();
