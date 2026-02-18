// =============================
// IMPORTS
// =============================
const db = require('./db.js');
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path"); require("dotenv").config();

// =============================
// APP + SERVER
// =============================
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// =============================
// MIDDLEWARE
// =============================
app.use(cors());
app.use(express.json());


// =============================
// STATIC FILES
// =============================
const publicPath = path.join(__dirname, '../public');

app.use(express.static(publicPath, { index: false }));

app.get('/admin', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'user.html'));
});

app.get('/user', (req, res) => {
    res.sendFile(path.join(publicPath, 'user.html'));
});


// =============================
// SOCKET.IO CONNECTION
// =============================
io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // User joins their own room for new template assignment
    socket.on("joinUserRoom", (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined room user_${userId}`);
    });

    // Admin joins spectate room for a template
    socket.on("joinSpectate", (templateId) => {
        socket.join(`tracker_${templateId}`);
        console.log(`Admin ${socket.id} joined spectate room tracker_${templateId}`);
    });

    // User updates tracker row → push to admins in room
    socket.on("trackerUpdate", ({ templateId, rowData }) => {
        io.to(`tracker_${templateId}`).emit("trackerUpdated", rowData);
    });

    // User submits tracker → push to admins in room
    socket.on("trackerSubmitted", (templateId) => {
        io.to(`tracker_${templateId}`).emit("trackerSubmitted");
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

// =============================
// MANAGERCARD & TRACKER ROUTES
// =============================

// --- CREATE MANAGERCARD ---
app.post("/api/admin/managercards", async (req, res) => {
    try {
        const { title, details } = req.body;
        if (!title) return res.status(400).json({ error: "Title is required" });

        const [result] = await db.query(
            "INSERT INTO managercards (title, details, status) VALUES (?, ?, ?)",
            [title, details || "", "draft"]
        );

        const [cards] = await db.query("SELECT * FROM managercards WHERE id = ?", [result.insertId]);
        res.json({ success: true, managerCard: cards[0] });
    } catch (err) {
        console.error("Create ManagerCard Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// --- PUBLISH MANAGERCARD TO ALL USERS ---
app.post("/api/admin/managercards/:id/publish", async (req, res) => {
    try {
        const managerCardId = req.params.id;

        // Update status to live
        await db.query("UPDATE managercards SET status = ? WHERE id = ?", ["live", managerCardId]);

        // Get all users
        const [users] = await db.query("SELECT id FROM users");

        // Assign managercard to all users with is_new = 1
        const assignments = users.map(u => [u.id, managerCardId, new Date(), 1]);
        if (assignments.length) {
            await db.query(
                "INSERT INTO user_managercards (user_id, managercard_id, assigned_at, is_new) VALUES ?",
                [assignments]
            );
        }

        // Fetch managercard
        const [cards] = await db.query("SELECT * FROM managercards WHERE id = ?", [managerCardId]);
        const managerCard = cards[0];

        // Notify all users via Socket.io
        users.forEach(u => io.to(`user_${u.id}`).emit("newManagerCardAssigned", { managerCard }));

        res.json({ success: true, managerCard });
    } catch (err) {
        console.error("Publish ManagerCard Error:", err);
        res.status(500).json({ error: "Publish failed" });
    }
});

// --- DELETE MANAGERCARD ---
app.delete("/api/admin/managercards/:id", async (req, res) => {
    try {
        const managerCardId = req.params.id;

        // Delete assignments first
        await db.query("DELETE FROM user_managercards WHERE managercard_id = ?", [managerCardId]);

        // Delete managercard
        await db.query("DELETE FROM managercards WHERE id = ?", [managerCardId]);

        // Notify users
        io.emit("managerCardDeleted", { managerCardId });

        res.json({ success: true });
    } catch (err) {
        console.error("Delete ManagerCard Error:", err);
        res.status(500).json({ error: "Delete failed" });
    }
});

// --- GET USER MANAGERCARDS ---
app.get("/api/user/:userId/managercards", async (req, res) => {
    try {
        const userId = req.params.userId;
        const [rows] = await db.query(`
            SELECT mc.*, umc.is_new
            FROM managercards mc
            JOIN user_managercards umc ON mc.id = umc.managercard_id
            WHERE umc.user_id = ?
            ORDER BY umc.assigned_at DESC
        `, [userId]);

        res.json({ managerCards: rows });
    } catch (err) {
        console.error("Load User ManagerCards Error:", err);
        res.status(500).json({ error: "Failed to load manager cards" });
    }
});

// --- CREATE TRACKER FOR MANAGERCARD ---
app.post("/api/user/:userId/managercards/:id/create-tracker", async (req, res) => {
    try {
        const userId = req.params.userId;
        const managerCardId = req.params.id;
        const { title, columns, rows } = req.body;

        const [result] = await db.query(
            `INSERT INTO managercard_trackers (user_id, managercard_id, title, columns, rows)
             VALUES (?, ?, ?, ?, ?)`,
            [userId, managerCardId, title, JSON.stringify(columns), JSON.stringify(rows)]
        );

        const [trackerRows] = await db.query("SELECT * FROM managercard_trackers WHERE id = ?", [result.insertId]);
        res.json({ success: true, tracker: trackerRows[0] });
    } catch (err) {
        console.error("Create Tracker Error:", err);
        res.status(500).json({ error: "Failed to create tracker" });
    }
});

// --- GET TRACKER DATA ---
app.get("/api/user/:userId/trackers/:trackerId", async (req, res) => {
    try {
        const trackerId = req.params.trackerId;
        const [rows] = await db.query("SELECT * FROM managercard_trackers WHERE id = ?", [trackerId]);

        if (!rows.length) return res.status(404).json({ error: "Tracker not found" });

        const tracker = rows[0];
        tracker.columns = JSON.parse(tracker.columns);
        tracker.rows = JSON.parse(tracker.rows);

        res.json({ tracker });
    } catch (err) {
        console.error("Load Tracker Error:", err);
        res.status(500).json({ error: "Failed to load tracker" });
    }
});

// --- SUBMIT TRACKER ---
app.post("/api/user/submit-tracker/:trackerId", async (req, res) => {
    try {
        const trackerId = req.params.trackerId;

        // Mark tracker as submitted
        await db.query("UPDATE managercard_trackers SET submitted = 1 WHERE id = ?", [trackerId]);

        // Notify admins
        io.emit("trackerSubmitted", { trackerId });

        res.json({ success: true });
    } catch (err) {
        console.error("Submit Tracker Error:", err);
        res.status(500).json({ error: "Failed to submit tracker" });
    }
});


// User history
app.get("/api/user/history/:username", async (req, res) => {
    try {
        const username = req.params.username;
        const [rows] = await db.query(
            "SELECT * FROM tracker_submissions WHERE user_id = ? ORDER BY submitted_at DESC", 
            [username]
        );

        const history = rows.map(row => ({
            ...row,
            answers: typeof row.answers === 'string' ? JSON.parse(row.answers) : row.answers
        }));

        res.json(history);
    } catch (err) {
        console.error("History Load Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// =============================
// START SERVER
// =============================
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
