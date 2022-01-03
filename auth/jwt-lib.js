const jwt = require('jsonwebtoken');

const generateAccessToken = (username) => {
  return jwt.sign({ username: username }, process.env.PRIVATEKEY, {
    expiresIn: '2h',
  });
};

const generateRefreshToken = (username) => {
  return jwt.sign({ username: username }, process.env.PRIVATEKEY, {
    expiresIn: '7d',
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
