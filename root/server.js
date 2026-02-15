const path = require('path');
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Benito1997!',
    database: 'my_crm_db'
});

db.connect(err => {
    if (err) console.error('❌ MySQL Connection Failed:', err.message);
    else console.log('✅ Connected to MySQL!');
});


// ===========================================
// 1️⃣ ADMIN: Create ManagersCard
// ===========================================
app.post('/api/trackers', (req, res) => {
    const { tracker_name } = req.body;

    const sql = `INSERT INTO trackers (name, is_new, created_at)
                 VALUES (?, 1, NOW())`;

    db.query(sql, [tracker_name], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const newTracker = {
            id: result.insertId,
            name: tracker_name,
            is_new: 1
        };

        io.emit('trackerCreated', newTracker);
        res.json(newTracker);
    });
});


// ===========================================
// 2️⃣ USER: Create Spreadsheet Container
// ===========================================
app.post('/api/user_tracker', (req, res) => {
    const { tracker_id, user_name } = req.body;

    const sql = `
        INSERT INTO user_trackers 
        (tracker_id, user_name, status, created_at)
        VALUES (?, ?, 'draft', NOW())
    `;

    db.query(sql, [tracker_id, user_name], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const trackerData = {
            id: result.insertId,
            tracker_id,
            user_name,
            created_at: new Date()
        };

        io.to('admin').emit('liveTrackerCreated', trackerData);

        res.json(trackerData);
    });
});


// ===========================================
// 3️⃣ LIVE CELL UPDATE (Spectate Mode)
// ===========================================
app.post('/api/live_update', (req, res) => {
    const { user_tracker_id, data } = req.body;

    io.to(`spectate_${user_tracker_id}`)
      .emit('liveDataUpdate', data);

    res.json({ success: true });
});


// ===========================================
// 4️⃣ SUBMIT TRACKER
// ===========================================
app.post('/api/submit_tracker', (req, res) => {
    const { user_tracker_id } = req.body;

    const sql = `
        UPDATE user_trackers
        SET status='submitted', submitted_at=NOW()
        WHERE id=?
    `;

    db.query(sql, [user_tracker_id], err => {
        if (err) return res.status(500).json({ error: err.message });

        io.to('admin').emit('trackerSubmitted', user_tracker_id);
        res.json({ success: true });
    });
});


// ===========================================
// 5️⃣ ADMIN LOG PAGE
// ===========================================
app.get('/api/admin_logs', (req, res) => {
    const sql = `
        SELECT ut.id, ut.user_name, ut.submitted_at,
               t.name AS manager_name
        FROM user_trackers ut
        JOIN trackers t ON ut.tracker_id = t.id
        WHERE ut.status='submitted'
        ORDER BY ut.submitted_at DESC
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});


// ===========================================
// 6️⃣ USER HISTORY PAGE
// ===========================================
app.get('/api/user_history/:user', (req, res) => {
    const user = req.params.user;

    // Check if the user parameter is missing or literally the string "undefined"
    if (!user || user === 'undefined') {
        return res.status(400).json({ error: "A valid username is required" });
    }

    const sql = `
        SELECT ut.id, ut.submitted_at,
               t.name AS manager_name
        FROM user_trackers ut
        JOIN trackers t ON ut.tracker_id = t.id
        WHERE ut.user_name=? AND ut.status='submitted'
        ORDER BY ut.submitted_at DESC
    `;

    db.query(sql, [user], (err, results) => {
        if (err) {
            console.error("Database Error:", err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json(results);
    });
});


// ===========================================
// SOCKET.IO
// ===========================================
io.on('connection', socket => {

    socket.on('registerRole', role => {
        socket.join(role);
    });

    socket.on('joinSpectate', user_tracker_id => {
        socket.join(`spectate_${user_tracker_id}`);
    });

});

server.listen(3000, () =>
    console.log('🚀 Server running on http://localhost:3000')
);
