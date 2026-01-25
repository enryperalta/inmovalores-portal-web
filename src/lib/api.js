const API_BASE_URL = 'https://theodore-unhasted-erlene.ngrok-free.dev/api';

export async function getProperties() {
    const res = await fetch(`${API_BASE_URL}/properties`, {
        next: { revalidate: 60, tags: ['properties'] },
        headers: {
            "ngrok-skip-browser-warning": "true"
        }
    });
    if (!res.ok) throw new Error('Failed to fetch properties');
    return res.json();
}

export async function getProperty(id) {
    const res = await fetch(`${API_BASE_URL}/properties/${id}`, {
        next: { revalidate: 3600, tags: [`property-${id}`, 'properties'] },
        headers: {
            "ngrok-skip-browser-warning": "true"
        }
    });
    if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error('Failed to fetch property');
    }
    return res.json();
}

export async function getPropertyAssignment(id) {
    try {
        const res = await fetch(`${API_BASE_URL}/properties/${id}/assignment`, {
            next: { revalidate: 300 },
            headers: {
                "ngrok-skip-browser-warning": "true"
            }
        });
        if (!res.ok) return { assigned: false };
        return res.json();
    } catch (e) {
        console.error("Error fetching assignment:", e);
        return { assigned: false };
    }
}
