const express = require('express');

const router = express.Router();

const register = require('./register');
const verify = require('./verify');
const login = require('./login');
const refresh = require('./refresh');

router.use('/register', register);
router.use('/verify', verify);
router.use('/login', login);
router.use('/refresh', refresh);

module.exports = router;
