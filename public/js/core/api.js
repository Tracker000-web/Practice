const API_BASE = "/api";

async function request(url, options = {}) {
    const res = await fetch(`${API_BASE}${url}`, {
        headers: { "Content-Type": "application/json" },
        ...options
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Request failed");
    }

    return res.json();
}

export const api = {
    get: (url) => request(url),
    post: (url, body) =>
        request(url, {
            method: "POST",
            body: JSON.stringify(body)
        }),
    delete: (url) =>
        request(url, {
            method: "DELETE"
        })
};
