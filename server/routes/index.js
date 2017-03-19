const Router = require('express').Router;
const path = require('path');
const passport = require('passport');
const User = require('../models/user');

const router = Router();

router.get('/users', (req, res, next) => {
  User.find({}, (err, users) => {
    if (err) return next(err);

    const result = users.map(item => ({ id: item.id, username: item.username }));

    res.json(result);
  })
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.status(200).json({ ok: 'ok'});
});

router.post('/login', (req, res, next) => {
  const { username, pass } = req.body;

  if (username && pass) {
    User.authorize(username, pass, (err, user) => {
      if (err) {
        return next(err);
      }

      req.session.userId = user.id;
      res.json({ username: user.username });
    })
  } else {
    res.status(401).json({ error: 'Please specify login and pass!'});
  }
});

module.exports = router;
