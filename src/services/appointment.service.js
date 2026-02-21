const db = require("../database/db");

exports.getAppointments = async (userId) => {
  const [rows] = await db.query(
    "SELECT * FROM appointments WHERE user_id = ?",
    [userId]
  );
  return rows;
};