const express = require("express");
const pool = require("../database/pool");
const config =
  require("../config/config")[process.env.NODE_ENV || "development"];

const router = express.Router();

const logger = config.logger();

router.get("/", async (req, res) => {
  try {
    const username = req.query.username ? req.query.username : undefined;
    const uuid = req.query.uuid ? req.query.uuid : undefined;

    if (!username || !uuid) {
      logger.info(
        `${config.errors.BADREQUEST} username:${username} uuid:${uuid}`
      );
      res.status(400).send(JSON.stringify({ error: config.errors.BADREQUEST }));
      return;
    }

    const result = await pool.query(
      "SELECT id, username, email, password FROM unverifiedusers WHERE username=?",
      [username]
    );

    if (Object.keys(result).length <= 1) {
      logger.info(`${config.errors.USERNOTFOUND} /verify`);
      res
        .status(404)
        .send(JSON.stringify({ error: config.errors.USERNOTFOUND }));
      return;
    }

    await pool.query("DELETE FROM unverifiedusers WHERE username=?", [
      username,
    ]);

    await pool
      .query(
        "INSERT INTO users (id, username, email, password) VALUE (?,?,?,?)",
        [result[0].id, username, result[0].email, result[0].password]
      )
      .catch((error) => {
        logger.fatal(error);
        res.status(500).send(JSON.stringify({ error: config.errors.INTERNAL }));
        return;
      });

    res.redirect("../verified");
  } catch (error) {
    logger.fatal(error);
    res.status(500).send(JSON.stringify({ error: config.errors.INTERNAL }));
  }
});

module.exports = router;
