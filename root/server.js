const path = require('path');
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// 1. IMPORT YOUR DATABASE
// Ensure your src/db.js uses mysql2/promise
const db = require('./src/db'); 

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// CREATE manager - Fixes 404 for /api/managers
app.post('/api/managers', async (req, res) => {
    // Add this header at the very top of the function
    res.setHeader('Content-Type', 'application/json');

    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: "Name is required" });

        const sql = "INSERT INTO trackers (name, is_new) VALUES (?, 1)";
        await db.query(sql, [name]);

        io.emit('refreshManagerCards');
        return res.status(201).json({ success: true });

    } catch (err) {
        console.error("DATABASE CRASHED:", err);
        // This ensures the frontend gets a JSON error, not HTML
        return res.status(500).json({ error: err.message });
    }
});

// 2. CORRECT STATIC FILE SERVING
// Serves files from the root and public folders
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname)); 

// Request Logger for debugging
app.use((req, res, next) => {
    console.log(`${req.method} request made to: ${req.url}`);
    next();
});

// ===========================================
// 1️⃣ ADMIN: Manager Management
// ===========================================

// GET all managers - Fixes 404 for /api/trackers
app.get('/api/trackers', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM trackers ORDER BY created_at DESC');
        res.json(rows); 
    } catch (err) {
        console.error("Database Error (GET trackers):", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



// DELETE manager
app.delete('/api/managers/:id', async (req, res) => {
    const managerId = req.params.id;
    try {
        await db.query("DELETE FROM trackers WHERE id = ?", [managerId]);
        io.emit('refreshManagerCards'); 
        res.json({ message: "Manager deleted successfully" });
    } catch (err) {
        console.error("Database Error (DELETE manager):", err);
        res.status(500).json({ error: "Database error" });
    }
});

// ===========================================
// 2️⃣ USER: Tracker Submissions
// ===========================================

app.post('/api/user_tracker', async (req, res) => {
    const { tracker_id, user_name } = req.body;
    const sql = "INSERT INTO user_trackers (tracker_id, user_name, status, created_at) VALUES (?, ?, 'draft', NOW())";

    try {
        const [result] = await db.query(sql, [tracker_id, user_name]);
        const trackerData = {
            id: result.insertId,
            tracker_id,
            user_name,
            created_at: new Date()
        };
        io.to('admin').emit('liveTrackerCreated', trackerData);
        res.json(trackerData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/submit_tracker', async (req, res) => {
    const { user_tracker_id } = req.body;
    const sql = "UPDATE user_trackers SET status='submitted', submitted_at=NOW() WHERE id=?";

    try {
        await db.query(sql, [user_tracker_id]);
        io.to('admin').emit('trackerSubmitted', user_tracker_id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===========================================
// 3️⃣ UPDATES & LOGS
// ===========================================

app.post('/api/live_update', (req, res) => {
    const { user_tracker_id, data } = req.body;
    io.to(`spectate_${user_tracker_id}`).emit('liveDataUpdate', data);
    res.json({ success: true });
});

app.get('/api/admin_logs', async (req, res) => {
    const sql = `
        SELECT ut.id, ut.user_name, ut.submitted_at, t.name AS manager_name
        FROM user_trackers ut
        JOIN trackers t ON ut.tracker_id = t.id
        WHERE ut.status='submitted'
        ORDER BY ut.submitted_at DESC
    `;
    try {
        const [results] = await db.query(sql);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/user_history/:user', async (req, res) => {
    const user = req.params.user;
    if (!user || user === 'undefined') {
        return res.status(400).json({ error: "A valid username is required" });
    }

    const sql = `
        SELECT ut.id, ut.submitted_at, t.name AS manager_name
        FROM user_trackers ut
        JOIN trackers t ON ut.tracker_id = t.id
        WHERE ut.user_name=? AND ut.status='submitted'
        ORDER BY ut.submitted_at DESC
    `;
    try {
        const [results] = await db.query(sql, [user]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ===========================================
// 4️⃣ SOCKET.IO & ANALYTICS
// ===========================================

io.on('connection', socket => {
    socket.on('registerRole', role => socket.join(role));
    socket.on('joinSpectate', id => socket.join(`spectate_${id}`));
});

app.get('/api/analytics', async (req, res) => {
    try {
        const [[totalStats]] = await db.query('SELECT COUNT(*) as total FROM user_trackers WHERE status="submitted"');
        const [[userStats]] = await db.query('SELECT COUNT(DISTINCT user_name) as unique_users FROM user_trackers');
        const [managerStats] = await db.query(`
            SELECT t.name, COUNT(ut.id) as count 
            FROM trackers t 
            LEFT JOIN user_trackers ut ON t.id = ut.tracker_id AND ut.status="submitted"
            GROUP BY t.id
        `);

        res.json({
            totalSubmissions: totalStats.total,
            activeUsers: userStats.unique_users,
            breakdown: managerStats
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

server.listen(3000, () => console.log('🚀 Server running on http://localhost:3000'));