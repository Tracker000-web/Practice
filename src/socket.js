export const socket = io("http://localhost:3000");

export function initSocket() {

    socket.emit("registerRole", window.userRole);

    socket.on("trackerCreated", tracker => {
        if (window.userRole === "user") {
            import('./user.js').then(m => m.renderManagerCard(tracker));
        }
    });

    socket.on("liveDataUpdate", data => {
        import('./spreadsheet.js').then(m => m.updateSpectateView(data));
    });

    socket.on("trackerSubmitted", id => {
        import('./admin.js').then(m => m.refreshLogs());
    });
}

// Add this to your Socket initialization logic
socket.on('refreshManagerCards', () => {
    console.log("New manager card detected! Refreshing list...");
    loadAdminTrackers(); 
});