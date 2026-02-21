//server.js
const path = require('path');
const express = require('express'); // Make sure express is required
const { createServer } = require('./config/app.config');
const { initSocket } = require('./config/socket.config');
const { loadRoutes } = require('./config/routes.config');
const { loadJobs } = require('./config/jobs.config');

const { app, server } = createServer();

// --- ADD THIS SECTION HERE ---
// This serves all files in /public (css, js, images) automatically
app.use(express.static(path.join(__dirname, '../public')));
// -----------------------------

initSocket(server);
loadRoutes(app);
loadJobs();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});