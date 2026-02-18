// public/main.js

import { initLayout } from './layout.js';
import { initSocket } from '../../src/socket.js';
import { loadAdminTemplates } from './admin.js';
import { loadAnalytics } from '../../src/routes/analytics.js';
import { initUser } from './user.js';
 
const pageModules = {
    'trackers': loadAdminTemplates,
    'users': initUser,
    'metrics': loadAnalytics,
    'spectate': () => console.log("Spectate Mode Active")
};

// 1. Move your user constant to a global scope or fetch it here
const currentUser = "JohnDoe"; 

document.addEventListener('DOMContentLoaded', () => {
    initUser();
});

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