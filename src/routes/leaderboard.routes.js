const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    const period = req.query.period || 'weekly';

    try {
        // Example: fetch top users for the period
        const [data] = await db.query(`
            SELECT username, appointments, ai_score AS aiScore, bad_lead_percent AS badLeadPercent
            FROM users
            ORDER BY appointments DESC
            LIMIT 10
        `);

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed leaderboard fetch' });
    }
});

router.get('/export', async (req, res) => {
    try {
        // Generate PDF using any PDF library, e.g., pdfkit
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="leaderboard.pdf"');
        res.send(/* PDF buffer */); 
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed PDF export' });
    }
});

module.exports = router;
