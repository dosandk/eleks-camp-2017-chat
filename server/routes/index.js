const Router = require('express').Router;
const path = require('path');
const passport = require('passport');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const User = require('../models');

const router = Router();

router.get('/users', (req, res, next) => {
  User.find({}, (err, users) => {
    if (err) return next(err);
    res.json(users);
  })
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  req.logout();
  res.redirect('/');
});

router.get('/login/facebook', passport.authenticate('facebook'));

router.get('/login/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect : '/',
    failureRedirect: '/fail'
  }),
  (req, res) => {
    res.redirect('/');
  }
);

router.get('fail', (req, res) => {
  res.status(401).json({ error: 'Authorization failed' } );
});

router.get('/profile', ensureLoggedIn(),
  (req, res) => {
    const { user } = req;
    res.json({ user });
  }
);

module.exports = router;
