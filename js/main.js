import { initLayout } from './layout.js';
import { initSocket } from './socket.js';
import { loadAdminTrackers } from './admin.js';
import { loadUserHistory } from './user.js';
import { loadAnalytics } from './analytics.js';

window.onload = () => {
    initLayout();
    initSocket();
    loadAdminTrackers();
    loadUserHistory();
    loadAnalytics();
};
