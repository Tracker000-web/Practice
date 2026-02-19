const db = require('../db');

exports.create = async ({
  user_id,
  manager_card_id,
  shift,
  date,
  hours,
  additional_appointment,
  data
}) => {

  const [result] = await db.query(
    `INSERT INTO trackers
     (user_id, manager_card_id, shift, date, hours, additional_appointment, data)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      user_id,
      manager_card_id,
      shift,
      date,
      hours,
      JSON.stringify(additional_appointment || []),
      JSON.stringify(data || {})
    ]
  );

  return { success: true, id: result.insertId };
};

exports.submit = async (trackerId) => {

  await db.query(
    `UPDATE trackers
     SET status='submitted'
     WHERE id=?`,
    [trackerId]
  );

  return { success: true };
};

exports.getByUser = async (userId) => {

  const [trackers] = await db.query(
    `SELECT *
     FROM trackers
     WHERE user_id=?
     ORDER BY date DESC`,
    [userId]
  );

  return trackers;
};
