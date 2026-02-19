export async function initAnalytics() {
    try {
        const totalSubmissions = document.getElementById("totalSubmissions");
        const todaySubmissions = document.getElementById("todaySubmissionsMetric");
        const avgBadLead = document.getElementById("avgBadLeadMetric");

        const res = await fetch("/api/admin/metrics");
        if (!res.ok) throw new Error("Failed to fetch metrics");
        const data = await res.json();

        totalSubmissions.textContent = data.totalSubmissions;
        todaySubmissions.textContent = data.todaySubmissions;
        avgBadLead.textContent = data.avgBadLead + "%";
    } catch (err) {
        console.error("Metrics init failed:", err);
    }
}
