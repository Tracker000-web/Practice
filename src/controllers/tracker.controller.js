// src/controllers/tracker.controller.js
const trackerService = require('../services/tracker.service');
const { getIO } = require('../config/socket.config');

exports.submitTracker = async (req, res) => {
    try {
        const templateId = req.params.id;
        const { userId, rows } = req.body;

        if (!userId || !rows || !rows.length) {
            return res.status(400).json({ error: 'Missing userId or tracker rows' });
        }

        // Save tracker rows
        const result = await trackerService.submitTrackerRows(userId, templateId, rows);

        // Broadcast to admins
        const io = getIO();
        io.emit('trackerSubmitted', { userId, templateId, trackerId: result.trackerId });

        res.status(200).json({ message: 'Tracker submitted successfully', trackerId: result.trackerId });
    } catch (err) {
        console.error('Error submitting tracker:', err);
        res.status(500).json({ error: 'Failed to submit tracker' });
    }
};