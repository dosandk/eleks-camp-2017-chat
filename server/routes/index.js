import { Router } from 'express';
import path from 'path';
import passport from 'passport';
import { ensureLoggedIn } from 'connect-ensure-login';
import User from '../models';

const router = Router();

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../index.html'));
});

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
    failureRedirect: '/login'
  }),
  (req, res) => {
    res.redirect('/');
  }
);

router.get('/profile', ensureLoggedIn(),
  (req, res) => {
    const { user } = req;
    res.json({ user });
  }
);

export default router;
