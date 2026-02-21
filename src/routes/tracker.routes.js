const express = require('express');
const router = express.Router();
const controller = require('../controllers/tracker.controller');
const db = require('../db');

router.post('/', controller.createTracker);
router.post('/:id/submit', controller.submitTracker);
router.get('/user/:userId', controller.getUserTrackers);

module.exports = router;
