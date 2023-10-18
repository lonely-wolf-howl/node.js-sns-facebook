const passport = require('passport');

const User = require('../models/users.model');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

// take a user id and return the user object
passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

// local
const LocalStrategy = require('passport-local').Strategy;
const LocalStrategyConfig = new LocalStrategy(
  { usernameField: 'email', passwordField: 'password' },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return done(null, false, { message: 'Incorrect email' });
      }

      user.comparePassword(password, (error, isMatch) => {
        if (error) return done(error);
        if (isMatch) return done(null, user);
        return done(null, false, { message: 'Incorrect email or password' });
      });
    } catch (error) {
      return done(error);
    }
  }
);
passport.use('local', LocalStrategyConfig);

// google
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const googleStrategyConfig = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
    scope: ['email', 'profile'],
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const existingUser = await User.findOne({ googleId: profile.id });
      if (existingUser) {
        return done(null, existingUser);
      } else {
        const user = new User();
        user.email = profile.emails[0].value;
        user.googleId = profile.id;
        user.username = profile.displayName;
        user.firstName = profile.name.givenName;
        user.lastName = profile.name.familyName;

        await user.save();
        return done(null, user);
      }
    } catch (error) {
      return done(error);
    }
  }
);
passport.use('google', googleStrategyConfig);

// kakao
const KakaoStrategy = require('passport-kakao').Strategy;
const kakaoStrategyConfig = new KakaoStrategy(
  {
    clientID: process.env.KAKAO_CLIENT_ID,
    callbackURL: '/auth/kakao/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const existingUser = await User.findOne({ googleId: profile.id });
      if (existingUser) {
        return done(null, existingUser);
      } else {
        const user = new User();
        user.email = profile._json.kakao_account.email;
        user.kakaoId = profile.id;

        await user.save();
        return done(null, user);
      }
    } catch (error) {
      return done(error);
    }
  }
);
passport.use('kakao', kakaoStrategyConfig);
