const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function getProperties() {
    const res = await fetch(`${API_BASE_URL}/properties`, {
        next: { revalidate: 60 } // Revalidar cada 60 segundos (ISR)
    });
    if (!res.ok) throw new Error('Failed to fetch properties');
    return res.json();
}

export async function getProperty(id) {
    const res = await fetch(`${API_BASE_URL}/properties/${id}`, {
        next: { revalidate: 3600 }
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
            next: { revalidate: 300 } // Revalidar asignaciones más seguido
        });
        if (!res.ok) return { assigned: false };
        return res.json();
    } catch (e) {
        return { assigned: false };
    }
}
