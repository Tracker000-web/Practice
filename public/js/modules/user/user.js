// Entry module for User dashboard
import { initLayout } from '../core/layout.js';
import { initTrackers } from "./tracker.js";
import { initHistory } from "./history.js";
import { initAchievements } from "./achievements.js";
import { initAppointments } from "./appointments.js";
import { initPractice } from "./practice.js";
import { initAnalytics } from "../admin/analytics.js";


/* =========================================
   INIT USER
========================================= */
export function initUser(userId) {
    if (!userId) {
        console.error("No user ID provided to initUser()");
        return;
    }

    console.log("Initializing user dashboard for:", userId);

    // Initialize each module
    initLayout();             // from layout.js

    initTrackers(userId);     // Tracker module
    initHistory(userId);      // History module
    initAchievements(userId); // Achievements module
    initAppointments(userId); // Appointments module
    initPractice(userId);     // Practice module
    initAnalytics(userId);    // Analytics module
}

/* =========================================
   OPTIONAL: Import layout init if not global
========================================= */

