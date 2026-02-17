// =============================
// IMPORTS
// =============================
const db = require('./db.js');
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
require("dotenv").config();

// =============================
// APP + SERVER
// =============================
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// =============================
// MIDDLEWARE
// =============================
app.use(cors());
app.use(express.json());

// =============================
// STATIC FILES
// =============================
app.use(express.static(path.join(__dirname, 'public')));

// Route for user dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'user.html'));
});

// Route for admin dashboard
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
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
// ADMIN ROUTES
// =============================

// Create template
app.post("/api/admin/create-template", async (req, res) => {
    try {
        const { title, fields } = req.body;
        const [result] = await db.query(
            "INSERT INTO templates (title, fields) VALUES (?, ?)",
            [title, JSON.stringify(fields)]
        );
        res.json({ success: true, templateId: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Template creation failed" });
    }
});

// Get all templates
app.get('/api/admin/templates', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM templates ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error('DATABASE ERROR:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Delete template
app.delete("/api/admin/create-template/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM templates WHERE id = ?", [id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Delete failed" });
    }
});

// Assign template to user
app.post("/api/admin/assign-template", async (req, res) => {
    try {
        const { templateId, userId } = req.body;
        await db.query("DELETE FROM user_templates WHERE user_id = ?", [userId]);
        await db.query("INSERT INTO user_templates (user_id, template_id) VALUES (?, ?)", [userId, templateId]);
        
        // Push to user in real-time
        io.to(`user_${userId}`).emit("newTemplateAssigned", { templateId });

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Assignment failed" });
    }
});

// View submissions (admin)
app.get("/api/admin/submissions/:templateId", async (req, res) => {
    try {
        const templateId = req.params.templateId;
        const [rows] = await db.query("SELECT * FROM tracker_submissions WHERE template_id = ?", [templateId]);
        rows.forEach(row => row.answers = JSON.parse(row.answers));
        res.json({ submissions: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to load submissions" });
    }
});

// =============================
// USER ROUTES
// =============================

// Get assigned template
app.get("/api/user/:userId/template", async (req, res) => {
    try {
        const userId = req.params.userId;
        const [rows] = await db.query(`
            SELECT t.id, t.title, t.fields
            FROM templates t
            JOIN user_templates ut ON t.id = ut.template_id
            WHERE ut.user_id = ?
        `, [userId]);

        if (rows.length === 0) return res.json({ template: null });

        const template = rows[0];
        template.fields = JSON.parse(template.fields);
        res.json({ template });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to load template" });
    }
});

// Submit tracker
app.post("/api/user/submit-tracker", async (req, res) => {
    try {
        const { userId, templateId, answers } = req.body;
        await db.query(
            "INSERT INTO tracker_submissions (user_id, template_id, answers) VALUES (?, ?, ?)",
            [userId, templateId, JSON.stringify(answers)]
        );

        // Notify admins spectating
        io.to(`tracker_${templateId}`).emit("trackerSubmitted");

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Submission failed" });
    }
});

// User history
app.get("/api/user_history/:username", async (req, res) => {
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
