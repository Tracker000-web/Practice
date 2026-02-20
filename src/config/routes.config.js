// public/src/config
const path = require('path');

function loadRoutes(app) {
    // API routes
    app.use('/api/auth', require('../routes/auth.routes'));
    app.use('/api/manager-cards', require('../routes/managerCard.routes'));
    app.use('/api/trackers', require('../routes/tracker.routes'));
    app.use('/api/user', require('../routes/user.routes'));

    // Admin API routes
    app.use('/api/admin/analytics', require('../routes/analytics.routes'));
    app.use('/api/admin/leaderboard', require('../routes/leaderboard.routes'));
    app.use('/api/admin/badlead-breakdown', require('../routes/badlead.routes'));

    // Serve HTML pages
    app.get('/admin', (req, res) => {
        res.sendFile(path.join(__dirname, '../../public/index.html'));
    });

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '../../public/user.html'));
    });
}

module.exports = { loadRoutes };
