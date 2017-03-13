const mongoose = require('mongoose');

module.exports = mongoose.model('Users', new mongoose.Schema({
  facebook: {
    id: String,
    token: String,
    email: String,
    name: String
  }
}));
