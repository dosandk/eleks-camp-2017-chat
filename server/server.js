import express  from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import connectMongo from 'connect-mongo';
import passport from 'passport';
import { Strategy } from 'passport-facebook';
import passportSocketIo from 'passport.socketio';
import cookieParser from 'cookie-parser';
import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpackConfig from '../webpack.config';
import routes from './routes';
import http from 'http';
import soketIo from 'socket.io'
import User from './models';
import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/users');

passport.use(new Strategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/login/facebook/callback'
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
const port = 3000;
const compiler = webpack(webpackConfig);
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
app.use(routes);

app.use(webpackMiddleware(compiler, {
  hot: true,
  publicPath: webpackConfig.output.publicPath,
  noInfo: true
}));

app.use(webpackHotMiddleware(compiler));

io.use(passportSocketIo.authorize({
  cookieParser: cookieParser,
  key: 'express.sid',
  secret: 'totallysecret',
  store: sessionStore,
}));

io.on('connection', socket => {
  socket.on('chat message', msg => {
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

httpServer.listen(port, () => console.log(`Running on localhost:${port}`));
