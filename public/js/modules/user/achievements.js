// Handles Achievements page
export function initAchievements(userId) {
    if (!userId) return;
    loadAchievements(userId);
}

/* =========================================
   LOAD ACHIEVEMENTS
========================================= */
async function loadAchievements(userId) {
    const container = document.getElementById("achievementsContainer");
    if (!container) return;

    try {
        const res = await fetch(`/api/user/${userId}/achievements`);
        if (!res.ok) throw new Error();

        const data = await res.json();
        container.innerHTML = data.length
            ? data.map(renderAchievement).join("")
            : "<p>No achievements yet.</p>";

    } catch (err) {
        console.error("Achievements load error:", err);
        container.innerHTML = "<p>Error loading achievements.</p>";
    }
}

function renderAchievement(a) {
    return `
        <div class="achievement-card">
            <h4>${a.title}</h4>
            <p>${a.description}</p>
            <span>${new Date(a.date).toLocaleDateString()}</span>
        </div>
    `;
}
