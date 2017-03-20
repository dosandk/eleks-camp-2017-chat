module.exports = {
  port: process.env.PORT || 3000,
  mongoURL: process.env.MONGODB_URI || 'mongodb://localhost:27017',
  sessionSecret: 'totallysecret'
};
