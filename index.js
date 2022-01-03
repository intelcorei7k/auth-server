const express = require('express');
const compression = require('compression');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');
const cookieparser = require('cookie-parser');

dotenv.config();

const config =
  require('./config/config')[process.env.NODE_ENV || 'development'];

const logger = config.logger();

const publicRoutes = require('./routes/publicRoutes');
const privateRoutes = require('./routes/privateRoutes');

const api = express();

api.use(compression());
api.use(helmet());
api.use(
  cors({
    origin: ['https://amazon.zonia.it'],
    credentials: true,
  })
);
api.use(cookieparser());
api.use(express.urlencoded({ extended: true }));
api.use(express.json());
api.use(publicRoutes);
api.use(privateRoutes);

api.get('*', (req, res) => {
  logger.info(`${config.errors.INEXISTANTROUTE} path:${req.path} GET`);
  res
    .status(404)
    .send(JSON.stringify({ error: config.errors.INEXISTANTROUTE }));
});

api.post('*', (req, res) => {
  logger.info(`${config.errors.INEXISTANTROUTE} path:${req.path} POST`);
  res
    .status(404)
    .send(JSON.stringify({ error: config.errors.INEXISTANTROUTE }));
});

api.listen(process.env.PORT || 5000, () => {
  logger.info(`ACTIVE port:${process.env.PORT || 5000}`);
});
