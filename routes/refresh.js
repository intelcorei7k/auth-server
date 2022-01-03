const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../database/pool');
const config =
  require('../config/config')[process.env.NODE_ENV || 'development'];
const {
  generateAccessToken,
  generateRefreshToken,
} = require('../auth/jwt-lib');

const router = express.Router();

const logger = config.logger();

router.post('/', (req, res) => {
  try {
    if (!req.headers.cookie) {
      logger.info(
        `${config.errors.MISSINGREFRESHTOKEN} refreshCookieToken:${req.headers.cookie}`
      );
      res
        .status(400)
        .send(JSON.stringify({ error: config.errors.MISSINGREFRESHTOKEN }));
      return;
    }

    const temp =
      String(req.headers.cookie).indexOf('refreshToken') !== -1
        ? String(req.headers.cookie).split(';')
        : undefined;

    if (!temp) {
      logger.info(`${config.errors.MISSINGREFRESHTOKEN} refreshToken:${temp}`);
      res
        .status(400)
        .send(JSON.stringify({ error: config.errors.MISSINGREFRESHTOKEN }));
      return;
    }

    const refreshToken = temp[0].trim().startsWith('refreshToken')
      ? temp[0].split('=')[1].trim()
      : temp[1].split('=')[1].trim();

    jwt.verify(refreshToken, process.env.PRIVATEKEY, async (error, data) => {
      if (error) {
        logger.info(
          `${config.errors.INVALIDREFRESHTOKEN} refreshToken:${refreshToken}`
        );
        res
          .status(401)
          .send(JSON.stringify({ error: config.errors.INVALIDREFRESHTOKEN }));
        return;
      }

      const result = await pool.query(
        'SELECT username, email, password FROM users WHERE username=? OR email=?',
        [data.username, data.username]
      );

      res.cookie('refreshToken', generateRefreshToken(data.username), {
        secure: true,
        httpOnly: true,
        maxAge: 1000 * 3600 * 24 * 7,
        sameSite: 'lax',
      });

      res.send(
        JSON.stringify({
          accessToken: generateAccessToken(data.username),
          user: result[0],
        })
      );
      return;
    });
  } catch (error) {
    logger.fatal(error);
    res.status(500).send(JSON.stringify({ error: config.errors.INTERNAL }));
  }
});

module.exports = router;
