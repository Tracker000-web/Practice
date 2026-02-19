import { initDashboard } from "./dashboard.js";
import { initUsers } from "./users.js";
import { initTrackers } from "./trackers.js";
import { initLogs } from "./logs.js";
import { initAnalytics } from "./analytics.js";
import { initAppointments } from "./appointments.js";

export function initAdmin() {
    initDashboard();
    initUsers();
    initTrackers();
    initLogs();
    initAnalytics();
    initAppointments();
}
