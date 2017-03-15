const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const connectMongo = require('connect-mongo');
const passport = require('passport');
const Strategy = require('passport-facebook').Strategy;
const passportSocketIo = require('passport.socketio');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const http = require('http');
const path = require('path');
const soketIo = require('socket.io');
const User = require('./models');
const mongoose = require('mongoose');

const port = process.env.PORT || 3000;
const callbackURL = process.env.CALLBACK_URL || `http://localhost:3000/login/facebook/callback`;

mongoose.connect(process.env.MONGODB_URI);

passport.use(new Strategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: callbackURL
  },
  (token, refreshToken, profile, done) => {
    process.nextTick(() => {
      User.findOne({'facebook.id': profile.id}, function (err, user) {
        if (err) {
          return done(err);
        }

        if (user) {
          return done(null, user);
        } else {
          const newUser = new User();

          newUser.facebook.id = profile.id;
          newUser.facebook.token = token;
          newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
          newUser.facebook.email = profile.emails && profile.emails.length ? profile.emails[0].value : '';

          newUser.save(function (err) {
            if (err) {
              throw err;
            }

            return done(null, newUser);
          });
        }
      });
    })
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

const app = express();
const httpServer = http.Server(app);
const io = soketIo(httpServer);
const MongoStore = connectMongo(session);
const sessionStore = new MongoStore({
  mongooseConnection: mongoose.connection
});

app.use(bodyParser.json());
app.use(session({
  secret: 'totallysecret',
  store: sessionStore
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, '../public/')));
app.use(routes);

// io.use(passportSocketIo.authorize({
//   cookieParser: cookieParser,
//   key: 'express.sid',
//   secret: 'totallysecret',
//   // store: sessionStore,
//   success: onAuthorizeSuccess,
//   fail: onAuthorizeFail
// }));

// io.use(passportSocketIo.authorize({
//   cookieParser: cookieParser,
//   key: 'express.sid',
//   secret: 'totallysecret',
//   // store: sessionStore,
// }));
//
// function onAuthorizeSuccess(data, accept){
//   console.log('successful connection to socket.io');
//   accept();
// }
//
// function onAuthorizeFail(data, message, error, accept){
//   console.log('failed connection to socket.io:', message);
//   if (error) accept(new Error(message));
// }

io
  .of('/chat')
  .on('connection', socket => {
    console.log('user connected');
    socket.on('chat message', msg => {
      io.of('chat').emit('chat message', msg);
    }
  );

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

httpServer.listen(port, () => console.log(`Running on localhost:${port}`));
