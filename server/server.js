import express  from 'express';
import bodyParser from 'body-parser';
import expressSession from 'express-session';
import passport from 'passport';
import { Strategy } from 'passport-facebook';
import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpackConfig from '../webpack.config';
import routes from './routes';
import http from 'http';
import soketIo from 'socket.io'
import dotenv from 'dotenv';

dotenv.load();

passport.use(new Strategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/login/callback'
  },
  (accessToken, refreshToken, profile, cb) => {
    return cb(null, profile);
  })
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

const app = express();
const httpServer = http.Server(app);
const io = soketIo(httpServer);
const port = 3000;
const compiler = webpack(webpackConfig);

app.use(bodyParser.json());
app.use(expressSession({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(routes);

app.use(webpackMiddleware(compiler, {
  hot: true,
  publicPath: webpackConfig.output.publicPath,
  noInfo: true
}));

app.use(webpackHotMiddleware(compiler));

io.on('connection', socket => {
  console.log('a user connected');

  socket.on('chat message', msg => {
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

httpServer.listen(port, () => console.log(`Running on localhost:${port}`));
