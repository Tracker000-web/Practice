// User analytics module
import { loadAnalytics } from "../../../../src/routes/analytics.routes.js";
import { api } from "../../core/api.js";

export function initAnalytics(userId) {
    const container = document.querySelector("[data-page='analytics']");
    if (!container) return;

    container.innerHTML = "<p>Loading analytics...</p>";

    loadAnalytics(userId, container);
}

