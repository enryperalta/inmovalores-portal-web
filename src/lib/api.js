const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function getProperties() {
    const res = await fetch(`${API_BASE_URL}/properties`, {
        next: { tags: ['properties'] },
        headers: {
            "ngrok-skip-browser-warning": "true"
        }
    });
    if (!res.ok) throw new Error('Failed to fetch properties');
    return res.json();
}

export async function getProperty(id) {
    const res = await fetch(`${API_BASE_URL}/properties/${id}`, {
        next: { tags: [`property-${id}`, 'properties'] },
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

export async function getPropertyBySlug(slug) {
    const res = await fetch(`${API_BASE_URL}/properties/by-slug/${slug}`, {
        next: { tags: ['properties', `property-slug-${slug}`] },
        headers: {
            "ngrok-skip-browser-warning": "true"
        }
    });
    if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error('Failed to fetch property by slug');
    }
    return res.json();
}

export async function getPropertyAssignment(id) {
    try {
        const res = await fetch(`${API_BASE_URL}/properties/${id}/assignment`, {
            // Sin revalidate automatico, solo manual o al recargar si no hay caché
            cache: 'no-store',
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

export async function createLead(leadData) {
    const res = await fetch(`${API_BASE_URL}/contacts/leads`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify(leadData)
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Error al enviar el formulario');
    }
    return res.json();
}
