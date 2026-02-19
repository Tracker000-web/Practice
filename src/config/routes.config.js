function loadRoutes(app) {
    app.use('/api/auth', require('../routes/auth.routes'));
    app.use('/api/manager-cards', require('../routes/managerCard.routes'));
    app.use('/api/trackers', require('../routes/tracker.routes'));
    app.use('/api/analytics', require('../routes/analytics.routes'));
    app.use('/api/user', require('../routes/user.routes'));
}

module.exports = { loadRoutes };
