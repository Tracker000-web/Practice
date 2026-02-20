const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT username, bad_lead_percent
            FROM users
        `);

        res.json({
            labels: rows.map(r => r.username),
            values: rows.map(r => r.bad_lead_percent)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed bad lead data' });
    }
});

module.exports = router;
