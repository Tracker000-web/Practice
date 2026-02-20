// public/js/socket.js
import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

// Connect automatically to same origin server
export const socket = io();

socket.on("connect", () => {
    console.log("Connected to Socket.io:", socket.id);
});

socket.on("disconnect", (reason) => {
    console.log("Disconnected:", reason);
});

socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err);
});
