export async function loadAnalytics() {

    const res = await fetch('/api/admin_logs');
    const logs = await res.json();

    const totalSubmissions = logs.length;

    const completed = logs.filter(l =>
        new Date(l.submitted_at).toDateString() ===
        new Date().toDateString()
    ).length;

    document.getElementById("totalSubmissions").innerText = totalSubmissions;
    document.getElementById("todaySubmissions").innerText = completed;
}
