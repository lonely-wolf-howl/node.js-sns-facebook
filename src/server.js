const express = require('express');
const app = express();

const Connect = require('./database/connect');
const path = require('path');
const flash = require('connect-flash');
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
const flashRouter = require('./routes/flash.router');

const config = require('config');

class Application {
  constructor() {
    this.app = app;

    this.init();
    this.database();
    this.middlewares();
    this.routes();
    this.errorHandler();
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

    // connect-flash
    app.use(flash());

    app.use((req, res, next) => {
      res.locals.success = req.flash('success');
      res.locals.error = req.flash('error');
      res.locals.currentUser = req.user;
      next();
    });
  }

  routes() {
    app.use('/', mainRouter);
    app.use('/auth', usersRouter);
    app.use('/posts', postsRouter);
    app.use('/posts/:id/comments', commentsRouter);
    app.use('/profile/:id', profileRouter);
    app.use('/friends', friendsRouter);
    app.use('/posts/:id/likes', likesRouter);
    app.use('/flash', flashRouter);
  }

  errorHandler() {
    app.use((error, req, res, next) => {
      res.status(error.status || 500);
      res.send(error.message);
    });
  }

  startServer() {
    const port = config.get('server.port');
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  }
}

new Application();
