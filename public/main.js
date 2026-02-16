// public/main.js

import { initLayout } from '../src/layout.js';
import { initSocket } from '../src/socket.js';
import { loadAdminTrackers } from '../src/admin.js';
import { loadUserHistory } from '../src/user.js';
import { loadAnalytics } from '../src/analytics.js';

const pageModules = {
    'trackers': loadAdminTrackers,
    'users': loadUserHistory,
    'metrics': loadAnalytics,
    'spectate': () => console.log("Spectate Mode Active")
};

// 1. Move your user constant to a global scope or fetch it here
const currentUser = "JohnDoe"; 

window.onload = () => {
    initLayout();
    initSocket();
    
    const navBtns = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // targetPage is defined HERE, inside the scope of the click function
            const targetPage = btn.dataset.target;

            // 1. UI Updates
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            pages.forEach(p => {
                p.classList.toggle('active', p.dataset.page === targetPage);
            });

            // 2. Logic: Integrated your check here
            if (pageModules[targetPage]) {
                if (targetPage === 'users') {
                    // Pass the username to loadUserHistory
                    pageModules[targetPage](currentUser); 
                } else {
                    pageModules[targetPage]();
                }
            }
        });
    });

    // Optional: Trigger the initial page load (e.g., click the first button)
    if (navBtns.length > 0) navBtns[0].click();
};

// --- DELETE EVERYTHING BELOW THIS LINE IN YOUR FILE ---
// (The extra code at the bottom was causing your ReferenceError)