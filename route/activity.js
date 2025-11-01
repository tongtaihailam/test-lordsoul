const express = require('express');
const path = require('path');
const router = express.Router();

const signJson = require('../config/signin');

router.get('/api/v1/signIn', (req, res) => {
    res.json(signJson);
});

module.exports = router;