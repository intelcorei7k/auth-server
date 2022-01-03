const bunyan = require("bunyan");

const loggers = {
  development: () =>
    bunyan.createLogger({ name: "development", level: "debug" }),
  production: () => bunyan.createLogger({ name: "production", level: "info" }),
  test: () => bunyan.createLogger({ name: "test", level: "fatal" }),
};

const Errors = {
  INTERNAL: "Richiesta fallita",
  USERNOTFOUND: "Utente non trovato",
  BADREQUEST: "Richiesta non valida",
  UNAUTHORIZEDREQUEST: "Richiesta non autorizzata",
  MISSINGACCESSTOKEN: "Access token mancante",
  MISSINGREFRESHTOKEN: "Refresh token mancante",
  MISSINGCREDENTIALS: "Credenziali mancanti",
  MISSINGFIELDS: "Riempire tutti i campi",
  INVALIDACCESSTOKEN: "Access token invalido",
  INVALIDREFRESHTOKEN: "Refresh token invalido",
  WRONGPASSWORD: "Password incorretta",
  ALREADYREGISTERED: "Utente gia registrato",
  INEXISTANTROUTE: "Route non trovata",
};

module.exports = {
  development: {
    errors: Errors,
    logger: loggers.development,
  },
  test: {
    errors: Errors,
    logger: loggers.test,
  },
  production: { errors: Errors, logger: loggers.production },
};
