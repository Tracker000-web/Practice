import { initDashboard } from "./dashboard.js";
import { initUsers } from "./users.js";
import { initTrackers } from "./trackers.js";
import { initLogs } from "./logs.js";
import { initMetrics } from "./analytics.js";

export function initAdmin() {
    initDashboard();
    initUsers();
    initTrackers();
    initLogs();
    initMetrics();
}
