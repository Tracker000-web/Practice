module.exports = function startQueueProcessor(io) {
    setInterval(async () => {

        const [jobs] = await db.query(
            `SELECT * FROM submission_queue 
             WHERE status='pending' 
             LIMIT 5`
        );

        for (const job of jobs) {
            await db.query(
                `UPDATE submission_queue 
                 SET status='processing' 
                 WHERE id=?`,
                [job.id]
            );

            // Simulate heavy analytics work
            await db.query(
                `UPDATE user_trackers 
                 SET status='completed' 
                 WHERE id=?`,
                [job.user_tracker_id]
            );

            await db.query(
                `UPDATE submission_queue 
                 SET status='done', processed_at=NOW()
                 WHERE id=?`,
                [job.id]
            );

            io.to('admin').emit('trackerProcessed', job.user_tracker_id);
        }

    }, 2000);
};