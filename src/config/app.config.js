const path = require("path");
const express = require("express");
const cors = require("cors");
const http = require("http");
require("dotenv").config();

function createServer() {
    const app = express();
    const server = http.createServer(app);

    // Middleware
    app.use(cors());
    app.use(express.json());

    // Static files
    const publicPath = path.join(__dirname, '../../public');
    app.use(express.static(publicPath, { index: false }));

    app.get('/admin', (req, res) =>
        res.sendFile(path.join(publicPath, 'index.html'))
    );

    app.get('/', (req, res) =>
        res.sendFile(path.join(publicPath, 'user.html'))
    );

    app.get('/user', (req, res) =>
        res.sendFile(path.join(publicPath, 'user.html'))
    );

    return { app, server };
}

module.exports = { createServer };
