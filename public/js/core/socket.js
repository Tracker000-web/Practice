import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

export const socket = io();

socket.on("connect", () => console.log("Connected:", socket.id));
socket.on("disconnect", (reason) => console.log("Disconnected:", reason));
socket.on("connect_error", (err) => console.error("Socket error:", err));
