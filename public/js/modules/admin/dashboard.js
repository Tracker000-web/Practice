export async function initDashboard() {
    try {
        const totalUsers = document.getElementById("totalUsers");
        const totalTrackers = document.getElementById("totalTrackers");
        const todaySubmissions = document.getElementById("todaySubmissions");
        const avgBadLead = document.getElementById("avgBadLead");

        // Fetch stats from backend API
        const res = await fetch("/api/admin/dashboard-stats");
        if (!res.ok) throw new Error("Failed to fetch dashboard stats");
        const data = await res.json();

        totalUsers.textContent = data.totalUsers;
        totalTrackers.textContent = data.totalTrackers;
        todaySubmissions.textContent = data.todaySubmissions;
        avgBadLead.textContent = data.avgBadLead + "%";
    } catch (err) {
        console.error("Dashboard init failed:", err);
    }
}
