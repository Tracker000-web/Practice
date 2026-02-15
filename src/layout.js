export function initLayout() {

    const appLayout = document.querySelector('.app-layout');
    const navButtons = document.querySelectorAll(".nav-btn");
    const pages = document.querySelectorAll(".page");

    document.getElementById('menu-toggle')
        .addEventListener('click', () => {
            appLayout.classList.toggle("sidebar-hidden");
        });

    navButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.dataset.target;
            pages.forEach(p =>
                p.classList.toggle("active", p.dataset.page === target)
            );
        });
    });
}
