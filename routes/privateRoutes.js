const express = require('express');
const jwt = require('jsonwebtoken');
const config =
  require('../config/config')[process.env.NODE_ENV || 'development'];

const router = express.Router();

const logger = config.logger();

const logout = require('./logout');

router.use((req, res, next) => {
  logger.info(
    `User access IP:${
      req.headers['cf-connecting-ip'] || req.socket.remoteAddress
    }`
  );

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logger.info(`${config.errors.UNAUTHORIZEDREQUEST} token:${token}`);
    res
      .status(401)
      .send(JSON.stringify({ error: config.errors.UNAUTHORIZEDREQUEST }));
    return;
  }

  jwt.verify(token, process.env.PRIVATEKEY, (error, username) => {
    if (error) {
      logger.info(`${config.errors.INVALIDACCESSTOKEN} token:${token}`);
      res
        .status(401)
        .send(JSON.stringify({ error: config.errors.INVALIDACCESSTOKEN }));
      return;
    }

    req.username = username.username;
    next();
  });
});

router.use('/logout', logout);

module.exports = router;
