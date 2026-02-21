// src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Trackers
router.get("/:userId/template", auth, userController.getTemplates);
router.get("/:userId/history", auth, userController.getHistory);

// Practice
router.get("/:userId/practice", auth, userController.getPractice);

// Appointments
router.get("/:userId/appointments", auth, userController.getAppointments);

// Achievements
router.get("/:userId/achievements", auth, userController.getAchievements);

module.exports = router;