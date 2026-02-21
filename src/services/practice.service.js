const db = require("../database/db");

exports.getPracticeTasks = async (userId) => {
  const [rows] = await db.query(
    "SELECT * FROM practice_tasks WHERE user_id = ?",
    [userId]
  );
  return rows;
};