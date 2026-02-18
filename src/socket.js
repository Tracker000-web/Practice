export const socket = io("http://localhost:3000");

export function initSocket() {
    socket.emit("registerRole", window.userRole);

    // 1. Existing listeners...
    socket.on("trackerCreated", tracker => {
        if (window.userRole === "user") {
            import('../public/js/user.js').then(m => m.renderManagerCard(tracker));
        }
    });

    socket.on("liveDataUpdate", data => {
        import('./services/spreadsheet.js').then(m => m.updateSpectateView(data));
    });

    socket.on("trackerSubmitted", id => {
        import('../public/js/admin.js').then(m => m.refreshLogs());
    });

    // 2. ADD THIS: The listener for the "Push" refresh
    socket.on('refreshManagerCards', () => {
        console.log("New manager card detected! Refreshing list...");
        // Use dynamic import to call loadAdminTrackers from admin.js
        import('../public/js/admin.js').then(m => {
            if (m.loadAdminTrackers) {
                m.loadAdminTrackers();
            }
        });
    });
}