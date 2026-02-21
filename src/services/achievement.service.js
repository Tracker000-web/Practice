const db = require("../database/db");

exports.getAchievements = async (userId) => {
  const [rows] = await db.query(
    "SELECT * FROM achievements WHERE user_id = ?",
    [userId]
  );
  return rows;
};