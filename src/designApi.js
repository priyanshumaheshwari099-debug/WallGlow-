const API_BASE = "https://wallglow-backend.onrender.com/api";

async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    return data;
}

export async function saveDesign(design) {
    return apiRequest("/designs", {
        method: "POST",
        body: JSON.stringify(design),
    });
}

export async function getMyDesigns() {
    return apiRequest("/designs");
}

export async function getFavoriteDesigns() {
    return apiRequest("/designs?favorites=true");
}

export async function toggleFavorite(id, isFavorite) {
    return apiRequest(`/designs/${id}/favorite`, {
        method: "PATCH",
        body: JSON.stringify({ isFavorite }),
    });
}

export async function deleteDesign(id) {
    return apiRequest(`/designs/${id}`, {
        method: "DELETE",
    });
}

export async function getDesignHistory() {
    return apiRequest("/history");
}