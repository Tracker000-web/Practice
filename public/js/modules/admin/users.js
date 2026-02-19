export async function initUsers() {
    const usersContent = document.getElementById("usersContent");
    if (!usersContent) return;

    try {
        const res = await fetch("/api/admin/users");
        if (!res.ok) throw new Error("Failed to load users");
        const users = await res.json();

        usersContent.innerHTML = users.length
            ? users.map(u => `<div>${u.name} (${u.email})</div>`).join("")
            : "<p>No users found.</p>";
    } catch (err) {
        console.error("Users init failed:", err);
        usersContent.innerHTML = "<p>Error loading users.</p>";
    }
}
