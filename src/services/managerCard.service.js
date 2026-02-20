// src/services/managerCard.service.js
const db = require('../db');

async function create({ manager_name, description, template_json }) {
  const [result] = await db.query(
    `INSERT INTO manager_cards (manager_name, description, template_json)
     VALUES (?, ?, ?)`,
    [manager_name, description, JSON.stringify(template_json)]
  );

  return { success: true, id: result.insertId };
}

async function publish(id) {
  // Mark as published
  await db.query(
    `UPDATE manager_cards SET status='published' WHERE id=?`,
    [id]
  );

  // Get all users
  const [users] = await db.query(`SELECT id FROM users`);

  if (users.length > 0) {
    const inserts = users.map(u => [u.id, id, true, new Date()]);

    await db.query(
      `INSERT IGNORE INTO user_manager_cards
       (user_id, manager_card_id, is_new, published_at)
       VALUES ?`,
      [inserts]
    );
  }

  return { success: true };
}

async function remove(id) {
  await db.query(
    `UPDATE manager_cards SET status='deleted' WHERE id=?`,
    [id]
  );

  await db.query(
    `DELETE FROM user_manager_cards WHERE manager_card_id=?`,
    [id]
  );

  return { success: true };
}

async function getAll() {
  const [cards] = await db.query(
    `SELECT * FROM manager_cards WHERE status!='deleted'`
  );
  return cards;
}

async function getByUser(userId) {
  const [cards] = await db.query(`
    SELECT mc.*, umc.is_new
    FROM user_manager_cards umc
    JOIN manager_cards mc ON mc.id = umc.manager_card_id
    WHERE umc.user_id=? AND mc.status='published'
  `, [userId]);

  return cards;
}

module.exports = {
  create,
  publish,
  remove,
  getAll,
  getByUser
};
