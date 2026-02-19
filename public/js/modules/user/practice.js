// Handles Practice page
export function initPractice(userId) {
    if (!userId) return;
    loadPractice(userId);
}

/* =========================================
   LOAD PRACTICE ITEMS
========================================= */
async function loadPractice(userId) {
    const container = document.getElementById("practiceContainer");
    if (!container) return;

    try {
        const res = await fetch(`/api/user/${userId}/practice`);
        if (!res.ok) throw new Error();

        const items = await res.json();
        container.innerHTML = items.length
            ? items.map(renderPracticeItem).join("")
            : "<p>No practice items available.</p>";

    } catch (err) {
        console.error("Practice load error:", err);
        container.innerHTML = "<p>Error loading practice items.</p>";
    }
}

function renderPracticeItem(item) {
    return `
        <div class="practice-card">
            <h4>${item.title}</h4>
            <p>${item.description}</p>
        </div>
    `;
}
