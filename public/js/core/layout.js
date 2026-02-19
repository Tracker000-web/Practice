export function initLayout() {
    const appLayout = document.querySelector('.app-layout');
    const navButtons = document.querySelectorAll(".nav-btn");
    const pages = document.querySelectorAll(".page");

    // -----------------------------
    // Sidebar toggle
    // -----------------------------
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            appLayout.classList.toggle("sidebar-hidden");
        });
    }

    // -----------------------------
    // Navigation buttons
    // -----------------------------
    navButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.dataset.target;

            // Show correct page
            pages.forEach(p => {
                if (p.dataset.page === target) {
                    p.classList.add("active");
                } else {
                    p.classList.remove("active");
                }
            });

            // Update active button styling
            navButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        });
    });

    // Optional: activate first page if none active
    if (![...pages].some(p => p.classList.contains("active")) && pages.length) {
        pages[0].classList.add("active");
        if (navButtons.length) navButtons[0].classList.add("active");
    }
}

// -----------------------------
// Modal helper
// -----------------------------
export function toggleModal(modalId = 'myModal') {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.toggle('hidden');
}

// Make global so HTML buttons can call
window.toggleModal = toggleModal;
