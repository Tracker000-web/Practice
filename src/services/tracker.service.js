// src/services/tracker.service.js
const db = require("../database/db");

/**
 * Save tracker rows for a user's submission
 * @param {number} userId
 * @param {number} templateId
 * @param {Array} rows
 */

// Fetch assigned tracker templates for a user
exports.getUserTemplates = async (userId) => {
  const [rows] = await db.query(
    "SELECT * FROM manager_card_templates WHERE user_id = ?",
    [userId]
  );
  return rows;
};

exports.submitTrackerRows = async (userId, templateId, rows) => {
    if (!rows || rows.length === 0) return;

    // 1️⃣ Create tracker header for this submission
    const [trackerResult] = await db.query(
        `INSERT INTO trackers (user_id, manager_card_id, date, shift, hours)
         VALUES (?, ?, CURDATE(), NULL, 0)`,
        [userId, templateId]
    );

    const trackerId = trackerResult.insertId;

    // 2️⃣ Insert tracker rows
    const inserts = rows.map(row => [
        trackerId,
        row.phone_number || null,
        row.no_answer || 0,
        row.voicemail || 0,
        row.not_in_service || 0,
        row.left_message || 0,
        row.call_backs || 0,
        row.appointments || 0,
        row.preset_appointments || 0,
        row.confirmed_presets || 0,
        row.state || null,
        row.status || null,
        row.comment || null
    ]);

    await db.query(
        `INSERT INTO tracker_rows
         (tracker_id, phone_number, no_answer, voicemail, not_in_service, left_message,
          call_backs, appointments, preset_appointments, confirmed_presets, state, status, comment)
         VALUES ?`,
        [inserts]
    );

    return { success: true, trackerId };
};

// Fetch tracker history for a user
exports.getUserHistory = async (userId) => {
  const [rows] = await db.query(
    "SELECT * FROM user_trackers WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );
  return rows;
};