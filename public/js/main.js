import { initLayout } from "./core/layout.js";
import { initUser } from "./modules/user/user.js";
import { initAdmin } from "./modules/admin/admin.js";

document.addEventListener("DOMContentLoaded", () => {
    initLayout();

    const role = document.body.dataset.role;

    if (role === "admin") initAdmin();
    if (role === "user") initUser("JohnDoe"); // Replace with real login later
});
