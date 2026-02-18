// public/js/socket.js
import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

// Connect to the server
export const socket = io("http://localhost:3000");

socket.on("connect", () => console.log("Connected to Socket.io:", socket.id));
socket.on("disconnect", (reason) => console.log("Disconnected:", reason));
socket.on("connect_error", (err) => console.error("Socket connection error:", err));
