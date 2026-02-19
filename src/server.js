const { createServer } = require('./config/app.config');
const { initSocket } = require('./config/socket.config');
const { loadRoutes } = require('./config/routes.config');
const { loadJobs } = require('./config/jobs.config');

const { app, server } = createServer();

initSocket(server);
loadRoutes(app);
loadJobs();

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
