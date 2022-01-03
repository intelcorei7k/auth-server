const express = require("express");
const config =
  require("../config/config")[process.env.NODE_ENV || "development"];

const router = express.Router();

const logger = config.logger();

router.post("/", (req, res) => {
  if (!req.headers.cookie) {
    logger.info(
      `${config.errors.MISSINGREFRESHTOKEN} refreshCookieToken:${req.headers.cookie}`
    );
    res
      .status(400)
      .send(JSON.stringify({ error: config.errors.MISSINGREFRESHTOKEN }));
    return;
  }

  res.cookie("refreshToken", null, {
    secure: true,
    httpOnly: true,
    maxAge: 0,
    sameSite: "lax",
  });

  res.sendStatus(200);
});

module.exports = router;
