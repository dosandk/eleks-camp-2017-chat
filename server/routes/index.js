import { Router } from 'express';
import path from 'path';
import passport from 'passport';
import { ensureLoggedIn } from 'connect-ensure-login';

const router = Router();

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../index.html'));
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

router.get('/login', passport.authenticate('facebook'));

router.get('/login/callback',
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
