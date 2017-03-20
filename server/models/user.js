const mongoose = require('mongoose');
const crypto = require('crypto');
const async = require('async');

const shema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  hashedPass: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});

shema.methods.encryptPass = function(pass) {
  return crypto.createHmac('sha1', this.salt).update(pass).digest('hex');
};

shema.virtual('pass')
  .set(function(pass) {
    this._plainPass = pass;
    this.salt = Math.random() + '';
    this.hashedPass = this.encryptPass(pass);
  })
  .get(function() {
    return this._plainPass
  });

shema.methods.checkPass = function(pass) {
  return this.encryptPass(pass) == this.hashedPass;
};

shema.statics.authorize = function(username, pass, callback) {
  const User = this;

  async.waterfall([
    callback => {
      User.findOne({ username }, callback);
    },
    (user, callback) => {
      if (user) {
        if (user.checkPass(pass)) {
          callback(null, user)
        }
      } else {
        const user = new User({ username, pass });

        user.save(err => {
          if (err) {
            if (err.code === 11000) {
              return res.send({ error: `User with username "${username}" already exist` });
            }
            return res.send({ error: err.message });
          }
          callback(null, user)
        })
      }
    }
  ], callback);
};

module.exports = mongoose.model('Users', shema);
