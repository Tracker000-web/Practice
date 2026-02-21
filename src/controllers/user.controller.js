const trackerService = require("../services/tracker.service");
const practiceService = require("../services/practice.service");
const appointmentService = require("../services/appointment.service");
const achievementService = require("../services/achievement.service");

// --- TRACKERS ---
exports.getTemplates = async (req, res) => {
  try {
    const { userId } = req.params;
    const templates = await trackerService.getUserTemplates(userId);
    res.json({ template: templates });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get templates" });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await trackerService.getUserHistory(userId);
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get history" });
  }
};

// --- PRACTICE ---
exports.getPractice = async (req, res) => {
  try {
    const { userId } = req.params;
    const tasks = await practiceService.getPracticeTasks(userId);
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get practice tasks" });
  }
};

// --- APPOINTMENTS ---
exports.getAppointments = async (req, res) => {
  try {
    const { userId } = req.params;
    const appointments = await appointmentService.getAppointments(userId);
    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get appointments" });
  }
};

// --- ACHIEVEMENTS ---
exports.getAchievements = async (req, res) => {
  try {
    const { userId } = req.params;
    const achievements = await achievementService.getAchievements(userId);
    res.json(achievements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get achievements" });
  }
};