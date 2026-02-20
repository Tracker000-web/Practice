export async function getUserHeatmap(userId) {
    const [rows] = await db.query(`
        SELECT DATE(created_at) as day,
               SUM(dials) as total_dials
        FROM trackers
        WHERE user_id = ?
        GROUP BY DATE(created_at)
    `, [userId]);

    return rows;
}


// Bad Lead % =
// (No Answer + Voicemail + Not In Service) / Dials × 100 //