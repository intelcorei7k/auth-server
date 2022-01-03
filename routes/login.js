const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../database/pool');
const config =
  require('../config/config')[process.env.NODE_ENV || 'development'];
const {
  generateAccessToken,
  generateRefreshToken,
} = require('../auth/jwt-lib');

const router = express.Router();

const logger = config.logger();

router.post('/', async (req, res) => {
  const email = req.body.email ? req.body.email : undefined;
  const username = req.body.username ? req.body.username : undefined;
  const password = req.body.password ? req.body.password : undefined;

  if ((!username && !email) || !password) {
    logger.info(
      `${
        config.errors.MISSINGCREDENTIALS
      } username:${username}, email:${email}, password:${!!password}`
    );
    res
      .status(400)
      .send(JSON.stringify({ error: config.errors.MISSINGCREDENTIALS }));
    return;
  }

  try {
    const result = await pool.query(
      'SELECT username, email, password FROM users WHERE username=? OR email=?',
      [username || email, username || email]
    );

    if (Object.keys(result).length <= 1) {
      logger.info(`${config.errors.USERNOTFOUND} /login`);
      res.status(404).json({ error: config.errors.USERNOTFOUND });
      return;
    }

    let user = result[0];

    if (await bcrypt.compare(password, user.password)) {
      res.cookie('refreshToken', generateRefreshToken(user.username), {
        secure: true,
        httpOnly: true,
        maxAge: 1000 * 3600 * 24 * 7,
        sameSite: 'lax',
      });

      delete user.password;

      res.send(
        JSON.stringify({
          accessToken: generateAccessToken(user.username),
          user: user,
        })
      );

      return;
    }

    logger.info(config.errors.WRONGPASSWORD);
    res
      .status(403)
      .send(JSON.stringify({ error: config.errors.WRONGPASSWORD }));
  } catch (error) {
    logger.fatal(error);
    res.status(500).send(JSON.stringify({ error: config.errors.INTERNAL }));
  }
});

module.exports = router;
