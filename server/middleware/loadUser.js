const User = require('../models/user');

module.exports = (req, res, next) => {
  if (!req.session.user) return next();

  User.findById(req.session.user, (err, user) => {
    if (err) return next(err);

    req.user = user;

    next();
  })
};
