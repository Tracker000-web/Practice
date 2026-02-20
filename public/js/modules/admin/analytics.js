// public/js/admin/analytics.js

export async function initAnalytics() {
    try {
        // ==============================
        // EXISTING METRICS (KEEP)
        // ==============================
        const totalSubmissions = document.getElementById("totalSubmissions");
        const todaySubmissions = document.getElementById("todaySubmissionsMetric");
        const avgBadLead = document.getElementById("avgBadLeadMetric");

        const res = await fetch("/api/admin/analytics");
        if (!res.ok) throw new Error("Failed to fetch analytics");
        const data = await res.json();

        if (totalSubmissions) totalSubmissions.textContent = data.totalSubmissions;
        if (todaySubmissions) todaySubmissions.textContent = data.todaySubmissions;
        if (avgBadLead) avgBadLead.textContent = data.avgBadLead + "%";

        // ==============================
        // NEW: LEADERBOARD
        // ==============================
        initLeaderboard();

        // ==============================
        // NEW: BAD LEAD CHART
        // ==============================
        initBadLeadChart();

        // ==============================
        // NEW: PDF EXPORT
        // ==============================
        initPDFExport();

    } catch (err) {
        console.error("Analytics init failed:", err);
    }
}

/* ===================================================
   LEADERBOARD
=================================================== */

async function initLeaderboard(period = "weekly") {
    const container = document.getElementById("leaderboardTable");
    const select = document.getElementById("periodSelect");

    if (!container) return;

    try {
        container.innerHTML = "Loading leaderboard...";

        const res = await fetch(`/api/admin/leaderboard?period=${period}`);
        if (!res.ok) throw new Error("Failed leaderboard fetch");

        const data = await res.json();

        container.innerHTML = `
            <table class="leaderboard-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>User</th>
                        <th>Appointments</th>
                        <th>AI Score</th>
                        <th>Bad Lead %</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map((u, i) => `
                        <tr>
                            <td>${i + 1}</td>
                            <td>${u.username}</td>
                            <td>${u.appointments}</td>
                            <td>${u.aiScore}</td>
                            <td>${u.badLeadPercent}%</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `;

        // Handle period change
        if (select) {
            select.onchange = (e) => {
                initLeaderboard(e.target.value);
            };
        }

    } catch (err) {
        console.error("Leaderboard failed:", err);
        container.innerHTML = "Error loading leaderboard.";
    }
}

/* ===================================================
   BAD LEAD CHART (Simple Bar Chart)
=================================================== */

async function initBadLeadChart() {
    const canvas = document.getElementById("badLeadChart");
    if (!canvas) return;

    try {
        const res = await fetch("/api/admin/badlead-breakdown");
        if (!res.ok) throw new Error("Failed bad lead chart");

        const data = await res.json();

        // Requires Chart.js loaded in HTML
        new Chart(canvas, {
            type: "bar",
            data: {
                labels: data.labels,
                datasets: [{
                    label: "Bad Lead %",
                    data: data.values
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                }
            }
        });

    } catch (err) {
        console.error("Bad lead chart failed:", err);
    }
}

/* ===================================================
   PDF EXPORT
=================================================== */

function initPDFExport() {
    const btn = document.getElementById("exportPDF");
    if (!btn) return;

    btn.onclick = async () => {
        try {
            const res = await fetch("/api/admin/leaderboard/export");
            if (!res.ok) throw new Error("PDF export failed");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "leaderboard.pdf";
            a.click();
        } catch (err) {
            console.error("PDF export failed:", err);
        }
    };
}
