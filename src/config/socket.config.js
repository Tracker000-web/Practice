function initSocket(server) {
    const socketInit = require('../sockets/socket.init');
    socketInit(server);
}

module.exports = { initSocket };
