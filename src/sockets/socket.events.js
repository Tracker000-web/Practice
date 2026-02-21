// src/sockets/socket.events.js
const { getIO } = require('../config/socket.config');

function registerTrackerSockets(socket) {
    // When a user joins a tracker manager card (for companion view)
    socket.on('join-managercard', ({ workspaceId, managercardId, user }) => {
        socket.join(`managercard-${managercardId}`);

        // Notify others in this room about the new dialer
        const io = getIO();
        const room = io.sockets.adapter.rooms.get(`managercard-${managercardId}`) || new Set();
        const dialers = Array.from(room).map(id => {
            const s = io.sockets.sockets.get(id);
            return s?.userData || null;
        }).filter(u => u !== null);

        io.to(`managercard-${managercardId}`).emit('dialers-update', dialers);
        
        // Attach user data to socket
        socket.userData = user;
    });

    // When a user leaves a manager card (on unload)
    socket.on('leave-managercard', () => {
        const userData = socket.userData;
        if (!userData) return;

        const io = getIO();
        // Remove user from rooms automatically via socket.io
        // Update remaining dialers
        // (Socket.IO handles leaving rooms automatically on disconnect)
    });

    // When a user submits a tracker, broadcast to admins
    socket.on('trackerSubmitted', ({ userId, templateId, trackerId }) => {
        const io = getIO();
        // Broadcast only to admin namespace or room if you have one
        io.emit('admin-tracker-submitted', { userId, templateId, trackerId });
    });
}

module.exports = { registerTrackerSockets };