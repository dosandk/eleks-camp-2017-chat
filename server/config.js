module.exports = {
  port: process.env.PORT || 3000,
  mongoURL: process.env.MONGODB_URI,
  sessionSecret: 'totallysecret'
};
