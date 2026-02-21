const express = require('express');
const router = express.Router();
const db = require('../db');

// Example Route
router.get('/profile', (req, res) => {
    res.json({ message: "User profile data" });
});

module.exports = router;