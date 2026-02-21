const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    try {
        const [totalRes] = await db.query(`SELECT COUNT(*) AS totalSubmissions FROM trackers`);
        const [todayRes] = await db.query(`SELECT COUNT(*) AS todaySubmissions FROM trackers WHERE DATE(created_at) = CURDATE()`);
        const [badLeadRes] = await db.query(`
            SELECT AVG(bad_lead_percent) AS avgBadLead
            FROM users
        `);

        res.json({
            totalSubmissions: totalRes[0].totalSubmissions || 0,
            todaySubmissions: todayRes[0].todaySubmissions || 0,
            avgBadLead: Math.round(badLeadRes[0].avgBadLead || 0)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to load analytics' });
    }
});

module.exports = router;
