const path = require('path');
const { createServer } = require('./config/app.config');
const { initSocket } = require('./config/socket.config');
const { loadRoutes } = require('./config/routes.config');
const { loadJobs } = require('./config/jobs.config');

// createServer returns { app, server }
const { app, server } = createServer();

// Load socket.io
initSocket(server);

// Load API & HTML routes
loadRoutes(app);

// Load cron/jobs if any
loadJobs();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
