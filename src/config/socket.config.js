// config/socket.config.js
const { Server } = require("socket.io");

let io;

// In-memory presence store
const activeDialers = {};
// {
//   "workspace_1_managercard_5": [
//       { userId: 3, name: "Glenn" }
//   ]
// }

function initSocket(server) {

    io = new Server(server);

    io.on("connection", (socket) => {

        console.log("User connected:", socket.id);

        // 🔵 JOIN MANAGERCARD
        socket.on("join-managercard", ({ workspaceId, managercardId, user }) => {

            const room = `workspace_${workspaceId}_managercard_${managercardId}`;
            socket.join(room);

            socket.workspaceRoom = room;
            socket.userId = user.id;

            if (!activeDialers[room]) {
                activeDialers[room] = [];
            }

            // Prevent duplicate entries
            if (!activeDialers[room].some(u => u.userId === user.id)) {
                activeDialers[room].push({
                    userId: user.id,
                    name: user.name
                });
            }

            io.to(room).emit("dialers-update", activeDialers[room]);
        });

        // 🔵 LEAVE MANAGERCARD
        socket.on("leave-managercard", () => {
            removeUser(socket);
        });

        socket.on("disconnect", () => {
            removeUser(socket);
            console.log("User disconnected:", socket.id);
        });
    });
}

function removeUser(socket) {
    const room = socket.workspaceRoom;

    if (!room || !activeDialers[room]) return;

    activeDialers[room] =
        activeDialers[room].filter(u => u.userId !== socket.userId);

    io.to(room).emit("dialers-update", activeDialers[room]);
}

function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
}

module.exports = { initSocket, getIO };