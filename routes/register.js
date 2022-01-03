const express = require("express");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const nodeoutlook = require("nodejs-nodemailer-outlook");
const pool = require("../database/pool");
const config =
  require("../config/config")[process.env.NODE_ENV || "development"];

const router = express.Router();

const logger = config.logger();

router.post("/", async (req, res) => {
  try {
    const username = req.body.username ? req.body.username : undefined;
    const email = req.body.email ? req.body.email : undefined;
    const password = req.body.password ? req.body.password : undefined;

    if (!username || !email || !password) {
      logger.info(
        `${
          config.errors.MISSINGCREDENTIALS
        } username:${username}, email:${email}, password:${!!password} /register`
      );
      res
        .status(400)
        .send(JSON.stringify({ error: config.errors.MISSINGFIELDS }));
      return;
    }

    const result = await pool.query(
      "SELECT username FROM users WHERE username=? OR email=?",
      [username, email]
    );

    if (Object.keys(result).length >= 2) {
      logger.info(
        `${config.errors.ALREADYREGISTERED} username:${username} result:${result}`
      );
      res
        .status(400)
        .send(JSON.stringify({ error: config.errors.ALREADYREGISTERED }));
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const verifyId = uuidv4();
    const emailBody = `Ciao ${username}, eccoti il link per completare la registrazione:\n`;
    const verifyLink = `https://api.zonia.it/verify?username=${username}&uuid=${verifyId}`;

    nodeoutlook.sendEmail({
      auth: {
        user: "IlPostinoDiZonia@outlook.it",
        pass: "k6t6gqucqtEgXnA",
      },
      from: "IlPostinoDiZonia@outlook.it",
      to: email,
      subject: "Completamento della registrazione a Amazon-clone",
      text: emailBody + verifyLink,
      onError: async (error) => {
        logger.fatal(error);
        res.status(500).send(JSON.stringify({ error: config.errors.INTERNAL }));
        return;
      },
      onSuccess: async () => {
        const resultE = await pool.query(
          "SELECT email FROM unverifiedusers WHERE email=?",
          [email]
        );

        const resultU = await pool.query(
          "SELECT username FROM unverifiedusers WHERE username=?",
          [username]
        );

        (Object.keys(resultE).length >= 2 ||
          Object.keys(resultU).length >= 2) &&
          (await pool.query(
            "DELETE FROM unverifiedusers WHERE username=? OR email=?",
            [username, email]
          ));

        await pool.query(
          "INSERT INTO unverifiedusers (id, checkid, username, email, password) VALUE (?,?,?,?,?)",
          [userId, verifyId, username, email, hashedPassword]
        );
        res.sendStatus(200);
        return;
      },
    });
  } catch (error) {
    logger.fatal(error);
    res.status(500).send(JSON.stringify({ error: config.errors.INTERNAL }));
  }
});

module.exports = router;
