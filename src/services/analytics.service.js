const db = require('../db');

const buildDateFilter = (period) => {
  if (period === 'weekly')
    return "YEARWEEK(t.date,1)=YEARWEEK(CURDATE(),1)";
  if (period === 'monthly')
    return "MONTH(t.date)=MONTH(CURDATE()) AND YEAR(t.date)=YEAR(CURDATE())";
  return "1=1";
};

exports.getDashboardStats = async () => {
  const [[users]] = await db.query(`SELECT COUNT(*) as count FROM users`);
  const [[trackers]] = await db.query(`SELECT COUNT(*) as count FROM trackers`);
  const [[submittedToday]] = await db.query(`
    SELECT COUNT(*) as count
    FROM trackers
    WHERE DATE(created_at)=CURDATE()
  `);

  const [[badLeadAvg]] = await db.query(`
    SELECT AVG(bad_lead_percent) as avg
    FROM trackers
    WHERE status='approved'
  `);

  return {
    users: users.count,
    trackers: trackers.count,
    submittedToday: submittedToday.count,
    badLeadAvg: Number(badLeadAvg.avg || 0).toFixed(2)
  };
};

exports.getLeaderboardByManager = async (managerCardId, period) => {
  const filter = buildDateFilter(period);

  const [rows] = await db.query(`
    SELECT 
      u.id,
      u.name,
      SUM(t.ai_score) as score
    FROM trackers t
    JOIN users u ON u.id=t.user_id
    WHERE t.manager_card_id=? 
    AND ${filter}
    GROUP BY u.id
    ORDER BY score DESC
  `, [managerCardId]);

  return rows;
};

exports.getLeaderboardGlobal = async (period) => {
  const filter = buildDateFilter(period);

  const [rows] = await db.query(`
    SELECT 
      u.id,
      u.name,
      SUM(t.ai_score) as score
    FROM trackers t
    JOIN users u ON u.id=t.user_id
    WHERE ${filter}
    GROUP BY u.id
    ORDER BY score DESC
  `);

  return rows;
};

exports.getHeatmapByUser = async (userId) => {
  const [rows] = await db.query(`
    SELECT 
      DATE(date) as day,
      COUNT(*) as submissions
    FROM trackers
    WHERE user_id=?
    AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    GROUP BY DATE(date)
  `, [userId]);

  return rows;
};

exports.getManagerAnalytics = async (managerCardId) => {
  const [[stats]] = await db.query(`
    SELECT
      COUNT(*) as total_trackers,
      SUM(status='draft') as drafts,
      SUM(status='submitted') as submitted,
      SUM(status='approved') as approved,
      SUM(status='rejected') as rejected,
      AVG(ai_score) as avg_score
    FROM trackers
    WHERE manager_card_id=?
  `, [managerCardId]);

  return {
    ...stats,
    avg_score: Number(stats.avg_score || 0).toFixed(2)
  };
};
