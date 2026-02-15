// public/main.js

// Import specific functions instead of the whole file
import { initLayout } from '../src/layout.js';
import { initSocket } from '../src/socket.js';
import { loadAdminTrackers } from '../src/admin.js';
import { loadUserHistory } from '../src/user.js';
import { loadAnalytics } from '../src/analytics.js';

const pageModules = {
    'trackers': loadAdminTrackers,
    'users': loadUserHistory,
    'metrics': loadAnalytics,
};

window.onload = () => {
    initLayout();
    initSocket();
    
    // Handle Navigation Switching
    const navBtns = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetPage = btn.dataset.target;

            // 1. UI: Toggle active classes
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            pages.forEach(p => {
                p.classList.toggle('active', p.dataset.page === targetPage);
            });

            // 2. LOGIC: Only load data for the active page
            if (pageModules[targetPage]) {
                pageModules[targetPage]();
            }
        });
    });
};

// main.js
const currentUser = "JohnDoe"; // Replace this with how you actually get the username

if (pageModules[targetPage]) {
    // If the page is 'users', we must pass the name
    if (targetPage === 'users') {
        pageModules[targetPage](currentUser); 
    } else {
        pageModules[targetPage]();
    }
}