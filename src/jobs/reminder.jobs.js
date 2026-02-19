const cron = require('node-cron');
const db = require('../db');
const emailService = require('../services/email.service');

cron.schedule('0 18 * * *', async () => {
  try {

    const [users] = await db.query(`
      SELECT u.email, u.name
      FROM users u
      LEFT JOIN trackers t 
      ON t.user_id=u.id AND DATE(t.date)=CURDATE()
      WHERE t.id IS NULL
    `);

    for (const user of users) {
      await emailService.sendReminder(user.email, user.name);
    }

    console.log("Reminder job executed successfully");

  } catch (err) {
    console.error("Reminder job failed:", err);
  }
});
