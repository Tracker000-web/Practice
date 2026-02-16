const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const adminRoutes = require('./src/routes/admin');
const userRoutes = require('./src/routes/user');
const analyticsRoutes = require('./src/routes/analytics');
const startQueueProcessor = require('./src/services/queueProcessor');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

app.use('/api/admin', adminRoutes(io));
app.use('/api/user', userRoutes(io));
app.use('/api/analytics', analyticsRoutes);

startQueueProcessor(io);

server.listen(3000, () => {
    console.log("Production Server Running");
});