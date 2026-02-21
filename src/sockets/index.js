// src/sockets/index.js

const activeDialers = {}; // Tracks dialers per room

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    /** ========================================
     * JOIN MANAGERCARD ROOM (COMPANION VIEW)
     * ======================================== */
    socket.on("join-managercard", ({ workspaceId, managercardId, user }) => {
      const room = `workspace_${workspaceId}_managercard_${managercardId}`;
      socket.join(room);

      // Save info on socket for easy removal
      socket.workspaceRoom = room;
      socket.userId = user.id;
      socket.userName = user.name;

      // Initialize room if not exists
      if (!activeDialers[room]) activeDialers[room] = [];

      // Add user to active dialers if not already present
      if (!activeDialers[room].some(u => u.userId === user.id)) {
        activeDialers[room].push({ userId: user.id, name: user.name });
      }

      // Notify all users in the room
      io.to(room).emit("dialers-update", activeDialers[room]);
    });

    /** ========================================
     * LEAVE MANAGERCARD ROOM
     * ======================================== */
    socket.on("leave-managercard", () => {
      removeUserFromRoom(socket, io);
    });

    /** ========================================
     * TRACKER SUBMISSION (ADMIN NOTIFY)
     * ======================================== */
    socket.on("trackerSubmitted", ({ userId, templateId, trackerId }) => {
      // Broadcast to admins only
      // For now, we broadcast to everyone; later you can filter by admin namespace/room
      io.emit("admin-tracker-submitted", { userId, templateId, trackerId });
    });

    /** ========================================
     * DISCONNECT
     * ======================================== */
    socket.on("disconnect", () => {
      removeUserFromRoom(socket, io);
      console.log("User disconnected:", socket.id);
    });
  });
};

/** ========================================
 * UTILITY: REMOVE USER FROM ROOM
 * ======================================== */
function removeUserFromRoom(socket, io) {
  const room = socket.workspaceRoom;
  if (!room || !activeDialers[room]) return;

  // Remove user from activeDialers
  activeDialers[room] = activeDialers[room].filter(u => u.userId !== socket.userId);

  // Notify remaining users in the room
  io.to(room).emit("dialers-update", activeDialers[room]);
}