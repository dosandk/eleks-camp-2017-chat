const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const connectMongo = require('connect-mongo');
const cookieParser = require('cookie-parser');
const cookie = require('cookie');
const async = require('async');
const routes = require('./routes');
const http = require('http');
const soketIo = require('socket.io');
const cors = require('cors');

const User = require('./models/user');
const mongoose = require('mongoose');
const config = require('./config');

mongoose.connect(config.mongoURL);

const app = express();
const httpServer = http.Server(app);
const io = soketIo(httpServer);
const MongoStore = connectMongo(session);
const sessionStore = new MongoStore({
  mongooseConnection: mongoose.connection
});

app.use(cors({ credentials: true, origin: true }));
app.use(bodyParser());
app.use(cookieParser());
app.use(session({
  secret: config.sessionSecret,
  cookie: {
    domain: 'localhost',
    httpOnly: true,
    maxAge: new Date(Date.now() + 3600000),
  },
  store: sessionStore
}));

app.use(require('./middleware/loadUser'));
app.use(routes);

function loadSession(sid, callback) {
  sessionStore.get(sid, (err, session) => {
    if (arguments.length === 0) {
      return callback(null, null);
    }

    return callback(null, session)
  });
}

function loadUser(session, callback) {
  const { userId } = session;

  if (!userId) {
    return callback(null, null);
  }

  User.findById(userId, (err, user) => {
    if (err) return callback(err);

    if (!user) return callback(null, null);

    callback(null, user);
  });
}

io.use((socket, callback) => {
  const { handshake } = socket;

  async.waterfall([
    callback => {
      handshake.cookies = cookie.parse(handshake.headers.cookie || '');

      const sid = cookieParser.signedCookie(handshake.cookies['connect.sid'], config.sessionSecret);

      loadSession(sid, callback)
    },
    (session, callback) => {
      if (!session) {
        return callback('Error: No session');
      }

      handshake.session = session;
      loadUser(session, callback);
    },
    (user, callback) => {
      if (!user) {
        return callback('Error: Anonymous session');
      }

      handshake.user = user;
      callback(null);
    }
  ], err => {
    if (!err) {
      return callback(null, true);
    }

    callback(err);
  })
});

io
  .on('connection', socket => {
    const username = socket.handshake.user.get('username');

    socket.broadcast.emit('join', `${username} joined to chat`);

    socket.on('message', msg => {
      io.emit('message', `${username}> ${msg}`);
    });

    socket.on('disconnect', () => {
      socket.broadcast.emit('leave', `${username} left chat`);
    });
});

httpServer.listen(config.port, () => console.log(`Running on localhost:${config.port}`));
